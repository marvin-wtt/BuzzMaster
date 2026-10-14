# Provision the PowerPoint add-in for the current user.
#
# Run by BuzzMaster itself, not by the installer, and deliberately so:
#
#  - everything here is PER USER (CurrentUser cert store, HKCU registry), which
#    means no elevation and no UAC prompt on install. Phase 0 (Q1a) confirmed
#    that trusting a certificate this way raises a certificate prompt but never
#    an elevation prompt;
#  - a machine-wide installer cannot provision per-user state for users who did
#    not run it;
#  - certificates expire, so this has to be re-runnable at any launch, not only
#    at install time. Plan section 23.2 calls silent expiry out as a production
#    failure mode.
#
# The certificate is generated HERE, on the user's machine. A private key shipped
# in the installer would be a shared secret across every install, which plan
# section 23 rules out explicitly.
#
# Emits a single line of JSON so the calling process can log a real result.

param(
    [Parameter(Mandatory = $true)][string]$CertPath,
    [Parameter(Mandatory = $true)][string]$Password,
    [Parameter(Mandatory = $true)][string]$ManifestPath,
    [int]$RenewWithinDays = 30,
    [switch]$SkipCertificate,
    [switch]$Remove
)

$ErrorActionPreference = 'Stop'

$subject = 'CN=BuzzMaster PowerPoint Add-in'
$result = [ordered]@{
    ok               = $false
    certificate      = 'unchanged'
    registered       = @()
    thumbprint       = $null
    notAfter         = $null
    error            = $null
}

function Get-AppCerts {
    @(
        Get-ChildItem Cert:\CurrentUser\My   -ErrorAction SilentlyContinue
        Get-ChildItem Cert:\CurrentUser\Root -ErrorAction SilentlyContinue
    ) | Where-Object { $_.Subject -eq $subject }
}

# Office keeps its add-in registry under a version-specific key. Enumerate rather
# than hardcoding 16.0: the segment is not a public contract and an Office
# upgrade can move it (plan section 22.1 / R6).
#
# Filtered to 15.0 and above. Web add-ins arrived in Office 2013 (15.0), and real
# machines carry stale keys from far older versions - this one was developed on a
# machine with an Office 8.0 key still present. Writing there would be registry
# litter that no Office build ever reads.
function Get-WefDeveloperKeys {
    Get-ChildItem 'HKCU:\Software\Microsoft\Office' -ErrorAction SilentlyContinue |
        Where-Object {
            $_.PSChildName -match '^\d+\.\d+$' -and [double]$_.PSChildName -ge 15.0
        } |
        ForEach-Object { Join-Path $_.PSPath 'WEF\Developer' }
}

try {
    if ($Remove) {
        foreach ($c in Get-AppCerts) { Remove-Item $c.PSPath -Force }
        if (Test-Path $CertPath) { Remove-Item $CertPath -Force }
        foreach ($key in Get-WefDeveloperKeys) {
            if (Test-Path $key) {
                Remove-ItemProperty -Path $key -Name 'BuzzMaster' -ErrorAction SilentlyContinue
            }
        }
        $result.ok = $true
        $result.certificate = 'removed'
        Write-Output ($result | ConvertTo-Json -Compress)
        return
    }

    # Check prerequisites before touching the certificate store. A run that
    # cannot finish should not leave a new trust entry behind.
    if (-not (Test-Path $ManifestPath)) {
        throw "Manifest not found at $ManifestPath"
    }

    # ---- certificate -------------------------------------------------------
    # Skipped in development: the dev server and the Electron socket both use the
    # certificate from dev-cert.ps1, so provisioning another one here would add a
    # second trusted entry for localhost that nothing ever reads.
    if ($SkipCertificate) {
        $result.certificate = 'unchanged'
    } else {
    $existing = Get-ChildItem Cert:\CurrentUser\My -ErrorAction SilentlyContinue |
        Where-Object { $_.Subject -eq $subject } |
        Sort-Object NotAfter -Descending |
        Select-Object -First 1

    $needsCert =
        (-not $existing) -or
        (-not (Test-Path $CertPath)) -or
        ($existing.NotAfter -lt (Get-Date).AddDays($RenewWithinDays))

    if ($needsCert) {
        # Remove superseded certificates so the trust store does not accumulate
        # one entry per renewal.
        foreach ($c in Get-AppCerts) { Remove-Item $c.PSPath -Force }

        $cert = New-SelfSignedCertificate `
            -Subject $subject `
            -DnsName 'localhost', '127.0.0.1' `
            -CertStoreLocation 'Cert:\CurrentUser\My' `
            -KeyExportPolicy Exportable `
            -KeyUsage DigitalSignature, KeyEncipherment `
            -TextExtension @('2.5.29.37={text}1.3.6.1.5.5.7.3.1') `
            -NotAfter (Get-Date).AddYears(2)

        $root = Get-Item 'Cert:\CurrentUser\Root'
        $root.Open('ReadWrite')
        $root.Add($cert)
        $root.Close()

        $dir = Split-Path -Parent $CertPath
        if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }

        $secure = ConvertTo-SecureString -String $Password -Force -AsPlainText
        Export-PfxCertificate -Cert $cert -FilePath $CertPath -Password $secure | Out-Null

        $result.certificate = if ($existing) { 'renewed' } else { 'created' }
        $result.thumbprint = $cert.Thumbprint
        $result.notAfter = $cert.NotAfter.ToString('o')
    } else {
        $result.thumbprint = $existing.Thumbprint
        $result.notAfter = $existing.NotAfter.ToString('o')
    }
    }

    # ---- manifest registration --------------------------------------------
    foreach ($key in Get-WefDeveloperKeys) {
        if (-not (Test-Path $key)) {
            New-Item -Path $key -Force | Out-Null
        }
        New-ItemProperty -Path $key -Name 'BuzzMaster' -Value $ManifestPath `
            -PropertyType String -Force | Out-Null
        $result.registered += ($key -replace '^Microsoft\.PowerShell\.Core\\Registry::', '')
    }

    $result.ok = $true
} catch {
    $result.error = $_.Exception.Message
}

Write-Output ($result | ConvertTo-Json -Compress)
