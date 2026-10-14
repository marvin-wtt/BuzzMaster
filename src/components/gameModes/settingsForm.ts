/**
 * Shared contract for the extracted settings forms (plan §13).
 *
 * Each `*SettingsForm.vue` is store- and dialog-independent and exposes this, so
 * every consumer — the desktop dialogs and the PowerPoint add-in — treats them
 * uniformly.
 */
export interface SettingsFormApi {
  /** Run the form's own validation rules. */
  validate: () => Promise<boolean>;
  /**
   * Apply cross-field rules that only make sense once editing is finished.
   *
   * Exists because some of this logic used to live in a dialog's OK handler,
   * where the add-in could never reach it — the quiz zeroing its points in
   * survey mode being the real case. Callers must run it before persisting.
   */
  normalize: () => void;
}
