import { createServer, type Server as HttpsServer } from 'node:https';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import log from 'electron-log';
import { WebSocketServer, type RawData, type WebSocket } from 'ws';
import {
  POWERPOINT_DEV_WS_PORT,
  POWERPOINT_PORT,
  POWERPOINT_PROTOCOL_VERSION,
  POWERPOINT_WS_PATH,
  POWERPOINT_STATUS_PATH as STATUS_PATH,
  isAllowedOrigin,
  isCompatibleProtocol,
  parseClientMessage,
  type ClientActivate,
  type PowerPointServerMessage,
} from '@/../common/powerpoint/PowerPointProtocol';
import type { CastSnapshot } from '@/../common/CastSnapshot';
import type {
  ActivationOutcome,
  ActivationRequest,
} from '@/../common/PowerPointAPI';
import { resolveCertificate } from '@/../src-electron/powerpoint/certificate';

const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

/**
 * Decode a WebSocket frame to text.
 *
 * `ws` hands back a Buffer, an ArrayBuffer, or an array of Buffers for a
 * fragmented message. Calling `.toString()` blindly would yield
 * '[object ArrayBuffer]' or a comma-joined mess for those cases, so a large
 * message split across frames would be rejected as malformed rather than parsed.
 */
function decodeFrame(raw: RawData): string {
  if (Array.isArray(raw)) {
    return Buffer.concat(raw).toString('utf8');
  }
  if (raw instanceof ArrayBuffer) {
    return Buffer.from(raw).toString('utf8');
  }
  return raw.toString('utf8');
}

export interface PowerPointClient {
  socket: WebSocket;
  instanceId: string;
}

export interface PowerPointServerOptions {
  isDev: boolean;
  appVersion: string;
  /** Directory holding the built renderer. Unused in dev (Vite serves it). */
  staticRoot?: string;
  /**
   * Current cast state, read when a client completes its handshake.
   *
   * A function rather than a value because a client may connect at any point in
   * a game - or reconnect mid-round - and must receive the state as it is then,
   * not as it was when the server started (plan section 18).
   */
  snapshot?: () => CastSnapshot;
  /**
   * Whether the command and cast channel accepts connections.
   *
   * Read on every upgrade rather than captured once, so toggling the setting
   * takes effect without restarting the app.
   */
  websocketEnabled?: () => boolean;
  /**
   * Handle an activation request. Resolves once BuzzMaster has applied the
   * preset, or rejects/return false with a reason the add-in can display.
   */
  activate?: (request: ActivationRequest) => Promise<ActivationOutcome>;
}

/**
 * Local HTTPS + WebSocket server for the PowerPoint add-in.
 *
 * Exists because PowerPoint cannot reach Electron IPC (plan section 31). It is
 * the only externally reachable surface BuzzMaster has, so its security posture
 * is deliberately narrow:
 *
 *  - bound to loopback only, never 0.0.0.0 (plan section 22);
 *  - every control connection must present an allowlisted Origin (section 26.2);
 *  - no CORS headers are ever sent, so a web page cannot read served content;
 *  - every inbound message is validated at runtime (section 26.6).
 *
 * There is deliberately no authentication token. See plan section 26.1 — the
 * add-in loads its own HTML from this server, so any token would be readable by
 * anything that could otherwise reach the socket. That decision holds only while
 * the command surface stays as small as it is; see section 19.1.
 */
export class PowerPointServer {
  #https: HttpsServer | undefined;
  #wss: WebSocketServer | undefined;
  #clients = new Set<PowerPointClient>();
  #options: PowerPointServerOptions;
  #retryTimer: NodeJS.Timeout | undefined;

  constructor(options: PowerPointServerOptions) {
    this.#options = options;
  }

  get #port(): number {
    return this.#options.isDev ? POWERPOINT_DEV_WS_PORT : POWERPOINT_PORT;
  }

  get clientCount(): number {
    return this.#clients.size;
  }

  get listening(): boolean {
    return this.#https?.listening ?? false;
  }

  start(): void {
    if (this.#https) {
      return;
    }

    const certificate = resolveCertificate(this.#options.isDev);

    if (!certificate) {
      // Not fatal to the app: BuzzMaster works fine without PowerPoint. The
      // add-in simply never connects, and section 27 renders that state.
      log.warn('PowerPoint server not started: no certificate available.');
      return;
    }

    const server = createServer(
      { pfx: certificate.pfx, passphrase: certificate.passphrase },
      (req, res) => this.#handleHttp(req, res),
    );

    server.on('error', (error: NodeJS.ErrnoException) =>
      this.#handleListenError(error),
    );

    this.#wss = new WebSocketServer({
      server,
      path: POWERPOINT_WS_PATH,
      verifyClient: ({ origin, req }, done) => {
        // The integration can be switched off while the static server keeps
        // running, so an add-in already embedded in a deck can load and explain
        // itself rather than failing with a bare browser error.
        if (this.#options.websocketEnabled?.() === false) {
          done(false, 503, 'PowerPoint integration is disabled');
          return;
        }

        // Refuse before the handshake completes rather than accepting and
        // closing: a rejected upgrade is what stops a malicious page from ever
        // holding a socket.
        if (!isAllowedOrigin(origin, POWERPOINT_PORT)) {
          log.warn(
            `PowerPoint protocol mismatch: rejected socket from origin ${origin ?? '(none)'} (${req.socket.remoteAddress ?? '?'})`,
          );
          done(false, 403, 'Forbidden origin');
          return;
        }
        done(true);
      },
    });

    this.#wss.on('connection', (socket) => this.#handleConnection(socket));

    // Loopback only. Never 0.0.0.0 - see plan section 22.
    server.listen(this.#port, '127.0.0.1', () => {
      log.info(
        `PowerPoint server started on https://localhost:${this.#port} (loopback only)` +
          (this.#options.isDev ? ' [dev: Vite proxies /ws here]' : ''),
      );
    });

    this.#https = server;
  }

  stop(): void {
    if (this.#retryTimer) {
      clearTimeout(this.#retryTimer);
      this.#retryTimer = undefined;
    }

    for (const client of this.#clients) {
      client.socket.close(1001, 'BuzzMaster is shutting down');
    }
    this.#clients.clear();

    this.#wss?.close();
    this.#wss = undefined;

    this.#https?.close();
    this.#https = undefined;

    log.info('PowerPoint server stopped');
  }

  /** Send a message to every connected add-in instance. */
  broadcast(message: PowerPointServerMessage): void {
    const payload = JSON.stringify(message);

    for (const client of this.#clients) {
      if (client.socket.readyState === client.socket.OPEN) {
        client.socket.send(payload);
      }
    }
  }

  // -------------------------------------------------------------------------

  #handleListenError(error: NodeJS.ErrnoException): void {
    if (error.code !== 'EADDRINUSE') {
      log.error(`PowerPoint server error: ${error.message}`);
      return;
    }

    // Plan section 22.1: the port is baked into an already-registered manifest,
    // so there is nothing to negotiate. Diagnose it properly and keep retrying -
    // the usual cause is a previous BuzzMaster that did not shut down cleanly,
    // and the add-in's own reconnect loop will pick us up with no user action.
    log.error(
      `PowerPoint server: port ${this.#port} is already in use by another process. ` +
        'The most likely cause is a previous BuzzMaster instance that did not exit cleanly. ' +
        'The PowerPoint add-in will not connect until that process releases the port. Retrying in 10s.',
    );

    this.#https = undefined;
    this.#wss = undefined;

    this.#retryTimer = setTimeout(() => {
      this.#retryTimer = undefined;
      this.start();
    }, 10_000);
  }

  #handleConnection(socket: WebSocket): void {
    let client: PowerPointClient | undefined;

    socket.on('message', (raw) => {
      const result = parseClientMessage(decodeFrame(raw));

      if (!result.ok) {
        log.warn(`PowerPoint protocol mismatch: ${result.reason}`);
        this.#send(socket, {
          type: 'error',
          code: 'invalid-message',
          message: result.reason,
        });
        return;
      }

      const message = result.message;

      if (message.type === 'game.activate') {
        // Commands are refused before a handshake. Not a security control - the
        // Origin allowlist is that (§26.2) - but it keeps the protocol honest:
        // a client that never agreed a version cannot issue commands.
        if (!client) {
          this.#send(socket, {
            type: 'error',
            code: 'invalid-message',
            message: 'hello required before game.activate',
          });
          return;
        }
        void this.#handleActivate(socket, message);
        return;
      }

      if (!isCompatibleProtocol(message.protocolVersion)) {
        log.warn(
          `PowerPoint protocol mismatch: client speaks v${message.protocolVersion}, this build speaks v${POWERPOINT_PROTOCOL_VERSION}`,
        );
        this.#send(socket, {
          type: 'error',
          code: 'incompatible-protocol',
          message: `This BuzzMaster speaks protocol v${POWERPOINT_PROTOCOL_VERSION}.`,
        });
        socket.close(1002, 'Incompatible protocol');
        return;
      }

      client = { socket, instanceId: message.instanceId };
      this.#clients.add(client);

      log.info(`PowerPoint client connected: ${message.instanceId}`);

      this.#send(socket, {
        type: 'hello',
        protocolVersion: POWERPOINT_PROTOCOL_VERSION,
        appVersion: this.#options.appVersion,
      });

      // Full state immediately after the handshake, so a client that connects
      // mid-game - or reconnects after a drop - never has to reconstruct state
      // from events it did not see (plan section 18).
      const snapshot = this.#options.snapshot?.();
      if (snapshot) {
        this.#send(socket, { type: 'cast.snapshot', snapshot });
      }
    });

    socket.on('close', () => {
      if (client) {
        this.#clients.delete(client);
        log.info(`PowerPoint client disconnected: ${client.instanceId}`);
      }
    });

    socket.on('error', (error) => {
      log.warn(`PowerPoint client socket error: ${error.message}`);
    });
  }

  /** Track which add-in most recently activated a game (plan section 20). */
  #activeInstanceId: string | undefined;

  get activeInstanceId(): string | undefined {
    return this.#activeInstanceId;
  }

  async #handleActivate(
    socket: WebSocket,
    message: ClientActivate,
  ): Promise<void> {
    log.info(
      `PowerPoint preset activation requested: ${message.preset.game} by ${message.instanceId}`,
    );

    if (!this.#options.activate) {
      this.#send(socket, {
        type: 'game.activationResult',
        requestId: message.requestId,
        success: false,
        error: 'BuzzMaster cannot activate games right now.',
      });
      return;
    }

    try {
      const outcome = await this.#options.activate({
        requestId: message.requestId,
        instanceId: message.instanceId,
        preset: message.preset,
      });

      if (outcome.success) {
        this.#activeInstanceId = message.instanceId;
        log.info(
          `PowerPoint preset activation succeeded: ${message.preset.game} by ${message.instanceId}`,
        );
      } else {
        log.warn(
          `PowerPoint preset activation failed: ${outcome.error ?? 'unknown reason'}`,
        );
      }

      this.#send(socket, { type: 'game.activationResult', ...outcome });
    } catch (error) {
      log.error(`PowerPoint preset activation failed: ${String(error)}`);
      this.#send(socket, {
        type: 'game.activationResult',
        requestId: message.requestId,
        success: false,
        error: String(error),
      });
    }
  }

  #send(socket: WebSocket, message: PowerPointServerMessage): void {
    if (socket.readyState === socket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }

  #handleHttp(req: IncomingMessage, res: ServerResponse): void {
    // Deliberately NO Access-Control-Allow-Origin. Plan section 26.2 depends on
    // its absence: it is what stops a web page reading what this server serves.
    const path_ = (req.url ?? '/').split('?')[0] ?? '/';

    /**
     * Lets the add-in tell "BuzzMaster is not running" apart from "the
     * integration is switched off" — two states that look identical from a
     * failed WebSocket handshake, but need completely different advice.
     */
    if (path_ === STATUS_PATH) {
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
      res.end(
        JSON.stringify({
          websocket: this.#options.websocketEnabled?.() !== false,
          appVersion: this.#options.appVersion,
        }),
      );
      return;
    }

    if (this.#options.isDev) {
      // Vite serves the renderer in development; this server exists only for the
      // WebSocket and the status endpoint then.
      res.writeHead(404).end('Served by the Vite dev server in development.');
      return;
    }

    const root = this.#options.staticRoot;

    if (!root) {
      res.writeHead(500).end('No static root configured');
      return;
    }

    const requested = (req.url ?? '/').split('?')[0] ?? '/';

    const relative = requested === '/' ? 'index.html' : requested.slice(1);
    const resolved = path.resolve(root, relative);

    // Containment check: never serve outside the renderer directory.
    if (!resolved.startsWith(path.resolve(root))) {
      res.writeHead(403).end('Forbidden');
      return;
    }

    const file =
      existsSync(resolved) && statSync(resolved).isFile()
        ? resolved
        : // SPA fallback: the add-in is a hash route, but a deep path should
          // still land on the app rather than a 404.
          path.resolve(root, 'index.html');

    if (!existsSync(file)) {
      res.writeHead(404).end('Not found');
      return;
    }

    res.writeHead(200, {
      'content-type':
        CONTENT_TYPES[path.extname(file)] ?? 'application/octet-stream',
    });
    res.end(readFileSync(file));
  }
}
