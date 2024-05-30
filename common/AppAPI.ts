import type {
  UpdateInfo,
  ProgressInfo,
  UpdateDownloadedEvent,
} from 'electron-updater';

export type AppAPI = {
  getVersion: () => Promise<string>;

  onUpdateInfo: (callback: (data: AppUpdate) => void) => void;
  checkForUpdate: () => void;
  downloadUpdate: () => void;
  cancelUpdate: () => void;
  installUpdate: () => void;
};

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
