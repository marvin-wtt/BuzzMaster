import { app, BrowserWindow, ipcMain } from 'electron';
import initWindowApiHandler from '@/../src-electron/windowAPI/main';
import initAppApiHandler, {
  isPowerPointEnabled,
  setPowerPointEnabledSetting,
} from '@/../src-electron/appAPI/main';
import initCastApiHandler from '@/../src-electron/castAPI/main';
import { PowerPointServer } from '@/../src-electron/powerpoint/server';
import { castEventToMessage } from '@/../src-electron/powerpoint/castBridge';
import { emptyCastSnapshot } from '@/../common/CastSnapshot';
import { CAST_MIN_WIDTH } from '@/../common/castWindow';
import {
  certificatePath,
  provisionPowerPoint,
} from '@/../src-electron/powerpoint/provisioning';
import { existsSync } from 'node:fs';
import type { PowerPointIntegrationStatus } from '@/../common/AppAPI';
import type {
  ActivationOutcome,
  ActivationRequest,
} from '@/../common/PowerPointAPI';
import path from 'path';
import os from 'os';
import log from 'electron-log';
import {
  registerQuasarRuntime,
  resolveElectronAssetsPath,
} from '#q-app/electron/main';

import './electron-updater';

// needed in case process is undefined under Linux
const platform = process.platform || os.platform();
const singleInstanceLock = app.requestSingleInstanceLock();
let mainWindow: BrowserWindow | undefined;
let powerPointServer: PowerPointServer | undefined;
let castBroadcaster: ReturnType<typeof initCastApiHandler> | undefined;

log.initialize();

if (!singleInstanceLock) {
  log.error(
    'Failed to start application: Another instance seems to be already running.',
  );
  app.quit();
} else {
  app.on('second-instance', () => {
    log.info('Application is already running, restoring window.');

    const mainWindow = BrowserWindow.getAllWindows().find(
      (win) => !win.isDestroyed(),
    );
    mainWindow?.restore();
    mainWindow?.focus();
  });
}

/**
 * Pending activation requests, keyed by requestId.
 *
 * The add-in waits on a reply, so a request that the renderer never answers -
 * a window closed mid-activation, a renderer crash - must not leave it waiting
 * forever. Each request carries its own timeout.
 */
const pendingActivations = new Map<
  string,
  { resolve: (outcome: ActivationOutcome) => void; timer: NodeJS.Timeout }
>();

const ACTIVATION_TIMEOUT_MS = 10_000;

function requestActivation(
  request: ActivationRequest,
): Promise<ActivationOutcome> {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return Promise.resolve({
      requestId: request.requestId,
      success: false,
      error: 'The BuzzMaster window is not available.',
    });
  }

  return new Promise<ActivationOutcome>((resolve) => {
    const timer = setTimeout(() => {
      pendingActivations.delete(request.requestId);
      resolve({
        requestId: request.requestId,
        success: false,
        error: 'BuzzMaster did not respond in time.',
      });
    }, ACTIVATION_TIMEOUT_MS);

    pendingActivations.set(request.requestId, { resolve, timer });
    mainWindow?.webContents.send('powerpoint:activationRequest', request);
  });
}

ipcMain.on(
  'powerpoint:activationResult',
  (_event, outcome: ActivationOutcome) => {
    const pending = pendingActivations.get(outcome.requestId);
    if (!pending) {
      // Already timed out, or a reply to something we never asked for.
      return;
    }
    clearTimeout(pending.timer);
    pendingActivations.delete(outcome.requestId);
    pending.resolve(outcome);
  },
);

/**
 * Bring the PowerPoint integration in line with the user's setting.
 *
 * Three outcomes, and the middle one is the interesting one:
 *
 *  - **enabled** — provision (certificate + manifest registration) and serve
 *    everything;
 *  - **disabled, but provisioned before** — keep serving the add-in page with the
 *    command channel refused. An element already embedded in someone's deck can
 *    then load and say *why* it is not working. Without this it fails with a bare
 *    browser error inside the slide, which explains nothing;
 *  - **disabled and never provisioned** — do nothing at all. Someone who has
 *    never opted in gets no certificate, no registry entry and no listening
 *    socket. That is the point of the setting.
 */
async function applyPowerPointIntegration(isDev: boolean): Promise<void> {
  const enabled = isPowerPointEnabled();

  if (enabled) {
    // Idempotent and never fatal; see provisioning.ts.
    await provisionPowerPoint(isDev);
  }

  const provisioned = isDev || existsSync(certificatePath());

  if (!enabled && !provisioned) {
    log.info('PowerPoint integration is disabled and was never set up.');
    powerPointServer?.stop();
    powerPointServer = undefined;
    return;
  }

  if (!powerPointServer) {
    powerPointServer = new PowerPointServer({
      isDev,
      appVersion: app.getVersion(),
      // In production the add-in is served from the same built renderer the app
      // windows load - one build output, served two ways.
      staticRoot: import.meta.dirname,
      snapshot: () => castBroadcaster?.snapshot ?? emptyCastSnapshot(),
      activate: requestActivation,
      // Read per connection, so toggling the setting takes effect immediately.
      websocketEnabled: isPowerPointEnabled,
    });

    // Second cast sink: same stream the cast window receives, different
    // transport. Plan section 17 - one broadcaster, many surfaces.
    castBroadcaster?.subscribe((event) => {
      powerPointServer?.broadcast(castEventToMessage(event));
    });
  }

  // Outside the block above, and idempotent: the first start can fail because
  // there is no certificate yet, which is exactly the state of a fresh install
  // before provisioning has run. Starting only on creation left the server
  // permanently dead until the app was restarted.
  powerPointServer.start();

  // Report what actually happened, not what was asked for. An earlier version
  // logged "enabled" even when provisioning had failed and nothing was
  // listening, which made a completely dead integration look healthy.
  const listening = powerPointServer?.listening ?? false;

  if (enabled && !listening) {
    log.error(
      'PowerPoint integration is enabled but the local server is not listening. ' +
        'The add-in will not load. See the warnings above for the cause.',
    );
    return;
  }

  log.info(
    `PowerPoint integration ${enabled ? 'enabled' : 'disabled'}, ` +
      `server ${listening ? 'listening' : 'stopped'}` +
      (!enabled && listening
        ? ' (serving the add-in page so embedded elements can explain themselves)'
        : ''),
  );
}

function powerPointStatus(): PowerPointIntegrationStatus {
  const enabled = isPowerPointEnabled();
  return {
    enabled,
    serving: powerPointServer?.listening ?? false,
    websocket: enabled && (powerPointServer?.listening ?? false),
  };
}

async function setPowerPointIntegration(
  enabled: boolean,
): Promise<PowerPointIntegrationStatus> {
  setPowerPointEnabledSetting(enabled);

  try {
    await applyPowerPointIntegration(import.meta.env.QUASAR_DEV === true);
  } catch (reason) {
    log.error(
      `Failed to apply PowerPoint integration change: ${String(reason)}`,
    );
    return { ...powerPointStatus(), error: String(reason) };
  }

  return powerPointStatus();
}

async function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: resolveElectronAssetsPath('icons/icon.png'), // tray icon
    width: 500,
    minWidth: CAST_MIN_WIDTH,
    height: 800,
    useContentSize: true,
    frame: false,
    webPreferences: {
      sandbox: true,
      contextIsolation: true,
      preload: path.join(import.meta.dirname, 'electron-preload.cjs'),
      backgroundThrottling: false,
    },
  });

  /**
   * Set permissions for buzzer devices
   */
  mainWindow.webContents.session.setDevicePermissionHandler((details) => {
    if (details.deviceType !== 'hid') {
      return false;
    }

    // NOTE: Devices need to be added in src/plugins/buzzer/hid/index.ts too.
    if (
      details.device.vendorId === 0x054c &&
      details.device.productId === 0x02
    ) {
      return true;
    }

    if (
      details.device.vendorId === 0x054c &&
      details.device.productId === 0x1000
    ) {
      return true;
    }

    // Add other devices here

    return false;
  });

  if (import.meta.env.QUASAR_DEV) {
    await mainWindow.loadURL(import.meta.env.QUASAR_APP_URL);
  } else {
    await mainWindow.loadFile('index.html');
  }

  if (import.meta.env.QUASAR_DEBUG) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools();
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow?.webContents.closeDevTools();
    });
  }
}

async function createCastWindow() {
  /**
   * Initial window options
   */
  if (!mainWindow) {
    throw new Error('Failed to create cast window: main window is not defined');
  }

  const window = new BrowserWindow({
    parent: mainWindow,
    icon: resolveElectronAssetsPath('icons/icon.png'), // tray icon
    width: 500,
    minWidth: CAST_MIN_WIDTH,
    height: 800,
    useContentSize: true,
    frame: false,
    transparent: true,
    webPreferences: {
      sandbox: true,
      contextIsolation: true,
      preload: path.join(import.meta.dirname, 'electron-preload.cjs'),
      backgroundThrottling: false,
    },
  });

  const defaultRoute = '#/cast';

  if (import.meta.env.QUASAR_DEV) {
    await window.loadURL(import.meta.env.QUASAR_APP_URL + defaultRoute);
  } else {
    await window
      .loadFile('index.html')
      .then(() =>
        window.webContents.executeJavaScript(
          `window.location.hash = '${defaultRoute}'`,
        ),
      );
  }

  if (import.meta.env.QUASAR_DEBUG) {
    // if on DEV or Production with debug enabled
    window.webContents.openDevTools();
  } else {
    // we're on production; no access to devtools pls
    window.webContents.on('devtools-opened', () => {
      window?.webContents.closeDevTools();
    });
  }

  window.setAlwaysOnTop(true, 'pop-up-menu', 1);

  return window;
}

app
  .whenReady()
  .then(async () => {
    registerQuasarRuntime();
    initAppApiHandler({
      powerPointStatus: () => Promise.resolve(powerPointStatus()),
      setPowerPointEnabled: (enabled) => setPowerPointIntegration(enabled),
    });
    initWindowApiHandler();
    const isDev = import.meta.env.QUASAR_DEV === true;
    castBroadcaster = initCastApiHandler(createCastWindow);

    await applyPowerPointIntegration(isDev);

    await createWindow();
  })
  .catch((reason: unknown) => {
    log.error(`Failed to start application: ${String(reason)}`);
  });

app.on('will-quit', () => {
  powerPointServer?.stop();
  powerPointServer = undefined;
});

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow().catch((reason) => {
      log.error(`Failed to create window: ${reason}`);
    });
  }
});
