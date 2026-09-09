/**
 * Minimal ambient declarations for the parts of Office.js the PowerPoint add-in
 * route uses.
 *
 * Deliberately partial. The full `@types/office-js` package is the right answer
 * once the add-in grows beyond this surface — swap it in and delete this file
 * then. Until then a hand-written subset keeps the dependency out and makes the
 * (small) API surface we actually depend on explicit.
 */
declare namespace Office {
  enum AsyncResultStatus {
    Succeeded = 0,
    Failed = 1,
  }

  enum HostType {
    PowerPoint = 'PowerPoint',
  }

  enum EventType {
    ActiveViewChanged = 'documentActiveViewChanged',
  }

  interface AsyncResult<T = unknown> {
    status: AsyncResultStatus;
    value: T;
    error?: { name: string; message: string; code: number };
  }

  interface Settings {
    get(name: string): unknown;
    set(name: string, value: unknown): void;
    remove(name: string): void;
    saveAsync(callback?: (result: AsyncResult<void>) => void): void;
  }

  interface Document {
    settings: Settings;
    getActiveViewAsync(callback: (result: AsyncResult<string>) => void): void;
    addHandlerAsync(
      eventType: EventType,
      handler: (args: { activeView: string }) => void,
      callback?: (result: AsyncResult<void>) => void,
    ): void;
  }

  interface Context {
    document: Document;
    displayLanguage: string;
  }

  interface HostInfo {
    host: HostType;
    platform: string;
  }

  const context: Context;

  function onReady(): Promise<HostInfo>;
  function onReady(callback: (info: HostInfo) => void): void;
}
