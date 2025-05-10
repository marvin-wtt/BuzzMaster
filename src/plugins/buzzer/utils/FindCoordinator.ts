import type { IController } from '../types';

export class FindCoordinator {
  public static readonly BLINK_INTERVAL_MS = 500;
  public static readonly BLINK_DURATION_MS = 5_000;

  private static cancel: (() => void) | null = null;

  /**
   * Start blinking the supplied controllers.
   * If another find is running, it is canceled automatically.
   */
  public static start(controllers: IController | IController[]) {
    controllers = Array.isArray(controllers) ? controllers : [controllers];

    FindCoordinator.stop();

    if (!controllers.length) {
      return;
    }

    this.cancel = this.makeBlinkJob(controllers);
  }

  public static stop() {
    if (!this.cancel) {
      return;
    }

    this.cancel();
    this.cancel = null;
  }

  private static makeBlinkJob(controllers: IController[]): () => void {
    let on = true;

    /* immediate visual feedback */
    controllers.forEach((c) => c.setLight(true));

    const interval = setInterval(() => {
      on = !on;
      controllers.forEach((c) => c.setLight(on));
    }, this.BLINK_INTERVAL_MS);

    const timeout = setTimeout(stop, this.BLINK_DURATION_MS);

    function stop() {
      clearInterval(interval);
      clearTimeout(timeout);
      controllers.forEach((c) => c.setLight(false));
    }

    return stop;
  }
}
