import Peer from 'peerjs';
import { TransportBase } from './Transport.js';
import { toPeerId, generateCode } from './roomCode.js';

/* PeerJS data channels over the free public broker (star topology, host-authoritative).
   Same Transport interface as LoopbackTransport, so HostRoom/JoinRoom/games are untouched.
   The broker is used ONLY to introduce peers by a namespaced room id; gameplay is P2P.
   Any broker/connection failure surfaces status 'failed' → the app routes to same-device. */

const OPEN_TIMEOUT = 9000;

export class PeerJSHostTransport extends TransportBase {
  constructor(initialCode, { onStatus = () => {}, onCodeChange = () => {} } = {}) {
    super('host');
    this.code = initialCode || generateCode();
    this._onStatus = onStatus;
    this._onCodeChange = onCodeChange;
    this._conns = new Map(); // peerId -> DataConnection
    this._collisions = 0;
    this._destroyed = false;
    this._open(this.code);
  }

  _open(code) {
    this.code = code;
    this._onStatus('opening');
    const peer = new Peer(toPeerId(code), { debug: 1 });
    this.peer = peer;

    this._openTimer = setTimeout(() => {
      if (!this._destroyed && !this._isOpen) this._fail('timeout');
    }, OPEN_TIMEOUT);

    peer.on('open', () => {
      this._isOpen = true;
      clearTimeout(this._openTimer);
      this._onCodeChange(this.code);
      this._onStatus('waiting');
    });

    peer.on('connection', (conn) => {
      conn.on('open', () => {
        this._conns.set(conn.peer, conn);
        this._emitPeers(this.getPeers());
        this._onStatus('connected');
      });
      conn.on('data', (data) => {
        if (data && typeof data === 'object') this._emitMessage({ ...data, _from: conn.peer });
      });
      const drop = () => {
        if (this._conns.delete(conn.peer)) this._emitPeers(this.getPeers());
      };
      conn.on('close', drop);
      conn.on('error', drop);
    });

    peer.on('error', (err) => {
      const t = err && err.type;
      if (t === 'unavailable-id' && this._collisions < 5) {
        // room code already taken on the broker — regenerate and retry
        this._collisions += 1;
        try { peer.destroy(); } catch { /* */ }
        this._open(generateCode());
        return;
      }
      if (t === 'peer-unavailable') return; // a joiner vanished; not fatal for the host
      this._fail(t || 'error');
    });
  }

  _fail(reason) {
    clearTimeout(this._openTimer);
    this._onStatus('failed', reason);
  }

  send(msg) {
    for (const conn of this._conns.values()) {
      if (conn.open) conn.send(msg);
    }
  }

  getPeers() {
    return [...this._conns.keys()].map((id) => ({ id, name: '' }));
  }

  destroy() {
    this._destroyed = true;
    clearTimeout(this._openTimer);
    try { if (this.peer) this.peer.destroy(); } catch { /* */ }
    this._msgCbs = [];
    this._peerCbs = [];
    this._conns.clear();
  }
}

// Reconnect backoff schedule (ms). After the last attempt fails we surface 'failed' and the app
// offers the same-device fallback — never a silent dead-end.
const RECONNECT_DELAYS = [2000, 4000, 8000];

export class PeerJSJoinerTransport extends TransportBase {
  constructor(code, { onStatus = () => {} } = {}) {
    super('joiner');
    this.code = code;
    this._onStatus = onStatus;
    this._destroyed = false;
    this._connected = false;
    this._attempt = 0;          // index into RECONNECT_DELAYS
    this._everConnected = false; // we made it once → drops are transient, retry
    this.id = null;

    this._connect(true);
  }

  // Open a fresh Peer + data channel to the host. `initial` distinguishes the very first attempt
  // (status 'connecting') from a recovery attempt (status 'reconnecting').
  _connect(initial) {
    if (this._destroyed) return;
    this._connected = false;
    this._onStatus(initial ? 'connecting' : 'reconnecting');

    try { if (this.peer) this.peer.destroy(); } catch { /* */ }

    const peer = new Peer({ debug: 1 });
    this.peer = peer;

    clearTimeout(this._timer);
    this._timer = setTimeout(() => {
      if (!this._destroyed && !this._connected) this._retryOrFail('timeout');
    }, OPEN_TIMEOUT);

    peer.on('open', (id) => {
      this.id = id;
      const conn = peer.connect(toPeerId(this.code), { reliable: true });
      this.conn = conn;
      conn.on('open', () => {
        this._connected = true;
        this._everConnected = true;
        this._attempt = 0; // reset the backoff after any success
        clearTimeout(this._timer);
        this._onStatus('connected');
      });
      conn.on('data', (data) => {
        if (data && typeof data === 'object') this._emitMessage(data);
      });
      // a drop after we were connected is recoverable — retry with backoff
      conn.on('close', () => { if (!this._destroyed) this._retryOrFail('peer-left'); });
      conn.on('error', () => { if (!this._destroyed) this._retryOrFail('conn-error'); });
    });

    peer.on('error', (err) => {
      const t = (err && err.type) || 'error';
      // peer-unavailable on the first attempt = wrong/closed room code → fail fast, don't grind.
      if (t === 'peer-unavailable' && !this._everConnected) { this._fail(t); return; }
      this._retryOrFail(t);
    });
  }

  // Schedule the next backoff attempt, or give up after the schedule is exhausted.
  _retryOrFail(reason) {
    if (this._destroyed || this._connected) return;
    clearTimeout(this._timer);
    if (this._attempt >= RECONNECT_DELAYS.length) {
      this._fail(reason);
      return;
    }
    const delay = RECONNECT_DELAYS[this._attempt];
    this._attempt += 1;
    this._onStatus('reconnecting');
    this._retryTimer = setTimeout(() => this._connect(false), delay);
  }

  _fail(reason) {
    clearTimeout(this._timer);
    clearTimeout(this._retryTimer);
    this._onStatus('failed', reason);
  }

  send(msg) {
    if (this.conn && this.conn.open) this.conn.send(msg);
  }

  destroy() {
    this._destroyed = true;
    clearTimeout(this._timer);
    clearTimeout(this._retryTimer);
    try { if (this.peer) this.peer.destroy(); } catch { /* */ }
    this._msgCbs = [];
  }
}
