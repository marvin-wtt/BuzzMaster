import type { GamePreset } from '@/../common/gamePreset/GamePreset';

export interface ActivationRequest {
  requestId: string;
  instanceId: string;
  preset: GamePreset;
}

export interface ActivationOutcome {
  requestId: string;
  success: boolean;
  error?: string;
}

/**
 * Bridge for PowerPoint-originated commands.
 *
 * Separate from `CastAPI` because it runs the other way: cast state flows out to
 * surfaces, whereas this carries a request in from an external application and
 * needs a reply. Keeping them apart makes the trust boundary visible — one of
 * these is untrusted input, the other is not.
 */
export interface PowerPointAPI {
  /** Called in the main window when an add-in requests activation. */
  onActivationRequest: (callback: (request: ActivationRequest) => void) => void;
  /** Report the outcome back so the add-in can stop waiting. */
  reportActivationResult: (outcome: ActivationOutcome) => void;
}
