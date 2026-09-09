import type {
  UpdateInfo,
  ProgressInfo,
  UpdateDownloadedEvent,
} from 'electron-updater';

export type AppAPI = {
  getVersion: () => Promise<string>;
  getLocale: () => Promise<string>;
  setLocale: (locale: string) => void;

  getPowerPointStatus: () => Promise<PowerPointIntegrationStatus>;
  setPowerPointEnabled: (
    enabled: boolean,
  ) => Promise<PowerPointIntegrationStatus>;

  onUpdateInfo: (callback: (data: AppUpdate) => void) => void;
  checkForUpdate: () => void;
  downloadUpdate: () => void;
  cancelUpdate: () => void;
  installUpdate: () => void;
};

/**
 * State of the PowerPoint integration.
 *
 * `enabled` is the user's choice; `serving` and `websocket` are what is actually
 * happening, which can differ — a machine with no certificate yet cannot serve
 * even when enabled, and a machine that was previously enabled keeps serving the
 * add-in page after being disabled so the element can explain itself.
 */
export interface PowerPointIntegrationStatus {
  enabled: boolean;
  /** The local HTTPS server is listening. */
  serving: boolean;
  /** The command and cast channel is accepting connections. */
  websocket: boolean;
  error?: string;
}

export type AppUpdate =
  | CheckingForUpdates
  | UpdateAvailable
  | UpdateNotAvailable
  | UpdateError
  | UpdateDownloadProgress
  | UpdateCanceled
  | UpdateDownloaded;

export interface CheckingForUpdates {
  name: 'checking-for-update';
}

export interface UpdateAvailable {
  name: 'update-available';
  info: UpdateInfo;
}

export interface UpdateNotAvailable {
  name: 'update-not-available';
  info: UpdateInfo;
}

export interface UpdateError {
  name: 'error';
  error: Error;
}

export interface UpdateDownloadProgress {
  name: 'download-progress';
  info: ProgressInfo;
}

export interface UpdateCanceled {
  name: 'update-cancelled';
  info: UpdateInfo;
}

export interface UpdateDownloaded {
  name: 'update-downloaded';
  info: UpdateDownloadedEvent;
}
