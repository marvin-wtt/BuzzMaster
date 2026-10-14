/**
 * Narrowest width the cast is designed to render at.
 *
 * This is the cast window's `minWidth`: below it the cast pages have not been
 * designed to hold together, so Electron refuses to let the window get smaller.
 *
 * A PowerPoint element has no such floor — it is sized by dragging a handle on a
 * slide, and can be made arbitrarily small. The same number is therefore used to
 * warn the author while they are building the slide, so both surfaces agree on
 * what "too small" means.
 */
export const CAST_MIN_WIDTH = 400;
