# Development certificate for the PowerPoint add-in.
#
# Office add-ins must be served over HTTPS, so `npm run dev:powerpoint` needs a
# certificate that Windows trusts for localhost.
#
# Installs into CurrentUser\Root: no elevation. Phase 0 (Q1a) confirmed this
# raises a certificate trust prompt but never a UAC prompt.
#
# This is the DEVELOPMENT path only. Production must generate a certificate per
# machine at install time - see plan sections 23.1 and 23.2, which are Phase 8.
# A working setup here is not evidence that the production path works.
#
#   pwsh -File dev-cert.ps1            # create (or re-export) and trust
#   pwsh -File dev-cert.ps1 -Remove    # clean up

param(
    [switch]$Remove
)

$ErrorActionPreference = 'Stop'

$subject  = 'CN=BuzzMaster Dev'
# Deliberately OUTSIDE integrations/powerpoint: that folder is exposed as a
# trusted add-in catalog share during development, and a private key for a
# cert in the trusted root store has no business sitting in a shared folder.
$certDir  = Join-Path $PSScriptRoot '..\..\.certs'
$pfxPath  = Join-Path $certDir 'localhost.pfx'
$pfxPass  = 'buzzmaster-dev'

# Also matches the Phase 0 spike certificate, so an already-trusted spike cert is
# reused rather than adding a second trust entry for the same host.
$subjectPattern = 'CN=BuzzMaster*'

function Get-DevCerts {
    @(
        Get-ChildItem Cert:\CurrentUser\My   -ErrorAction SilentlyContinue
        Get-ChildItem Cert:\CurrentUser\Root -ErrorAction SilentlyContinue
    ) | Where-Object { $_.Subject -like $subjectPattern }
}

if ($Remove) {
    $found = Get-DevCerts
    if (-not $found) { Write-Host 'Nothing to remove.' }
    foreach ($c in $found) {
        Write-Host "Removing $($c.Subject) [$($c.Thumbprint)]"
        Remove-Item $c.PSPath -Force
    }
    if (Test-Path $pfxPath) { Remove-Item $pfxPath -Force }
    Write-Host 'Done. Restart PowerPoint so it drops the cached trust decision.'
    return
}

if (-not (Test-Path $certDir)) {
    New-Item -ItemType Directory -Path $certDir -Force | Out-Null
}

$existing = Get-ChildItem Cert:\CurrentUser\My -ErrorAction SilentlyContinue |
    Where-Object { $_.Subject -like $subjectPattern -and $_.NotAfter -gt (Get-Date) } |
    Sort-Object NotAfter -Descending |
    Select-Object -First 1

if ($existing) {
    Write-Host "Reusing trusted certificate $($existing.Subject) [$($existing.Thumbprint)]"
    $cert = $existing
} else {
    Write-Host 'Creating a self-signed certificate for localhost...'
    $cert = New-SelfSignedCertificate `
        -Subject $subject `
        -DnsName 'localhost', '127.0.0.1' `
        -CertStoreLocation 'Cert:\CurrentUser\My' `
        -KeyExportPolicy Exportable `
        -KeyUsage DigitalSignature, KeyEncipherment `
        -TextExtension @('2.5.29.37={text}1.3.6.1.5.5.7.3.1') `
        -NotAfter (Get-Date).AddDays(365)

    Write-Host "  thumbprint: $($cert.Thumbprint)"
    Write-Host 'Trusting it in CurrentUser\Root (expect a certificate prompt, not UAC)...'

    $root = Get-Item 'Cert:\CurrentUser\Root'
    $root.Open('ReadWrite')
    $root.Add($cert)
    $root.Close()
}

Write-Host "Exporting PFX -> $pfxPath"
$securePass = ConvertTo-SecureString -String $pfxPass -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password $securePass | Out-Null

Write-Host ''
Write-Host 'Certificate ready. Start the add-in dev server with:'
Write-Host '  npm run dev:powerpoint'
