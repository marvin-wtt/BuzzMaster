import type { CastEvent } from '@/../src-electron/castAPI/CastBroadcaster';
import type { PowerPointServerMessage } from '@/../common/powerpoint/PowerPointProtocol';

/**
 * Translate a cast broadcaster event into a wire message.
 *
 * Kept out of `electron-main.ts` so it can be tested: this is the seam where an
 * internal event shape becomes a published protocol, and a mistake here shows up
 * as a cast surface that silently stops updating.
 */
export function castEventToMessage(event: CastEvent): PowerPointServerMessage {
  switch (event.kind) {
    case 'gameState':
      // `exactOptionalPropertyTypes`: a reset game omits the key rather than
      // sending an explicit null, matching how the snapshot represents it.
      return event.state === undefined
        ? { type: 'cast.gameState' }
        : { type: 'cast.gameState', state: event.state };

    case 'gameSettings':
      return { type: 'cast.gameSettings', settings: event.settings };

    case 'controllers':
      return { type: 'cast.controllers', controllers: event.controllers };

    case 'locale':
      return { type: 'cast.locale', locale: event.locale };
  }
}
