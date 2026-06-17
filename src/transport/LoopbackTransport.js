import { TransportBase } from './Transport.js';

/* LoopbackTransport — same-device, in-memory, synchronous.
   One device hosts AND plays; extra "seats" (virtual players, optionally bot-driven) are
   added as joiners on the same hub. Identical Transport interface as PeerJSTransport, so the
   room/game code is byte-for-byte the same — only the transport swaps. Zero network. */

let seq = 0;
export function loopbackId(prefix = 'p') {
  seq += 1;
  return `${prefix}${seq}`;
}

class LoopbackHostTransport extends TransportBase {
  constructor(hub) {
    super('host');
    this._hub = hub;
  }
  // host → all joiners
  send(msg) {
    for (const j of this._hub._joiners.values()) j._emitMessage(msg);
  }
  getPeers() {
    return [...this._hub._joiners.values()].map((j) => ({ id: j.id, name: j.name }));
  }
  destroy() {
    this._hub._joiners.clear();
    this._msgCbs = [];
    this._peerCbs = [];
  }
}

class LoopbackJoinerTransport extends TransportBase {
  constructor(hub, id, name) {
    super('joiner');
    this._hub = hub;
    this.id = id;
    this.name = name;
  }
  // joiner → host (tagged with sender id)
  send(msg) {
    this._hub._host._emitMessage({ ...msg, _from: this.id });
  }
  destroy() {
    this._hub.removeJoiner(this.id);
    this._msgCbs = [];
  }
}

export function createLoopbackHub() {
  const hub = {
    _joiners: new Map(),
    _host: null,
    _notifyPeers() {
      this._host._emitPeers(this._host.getPeers());
    },
    addJoiner({ id = loopbackId(), name = '' } = {}) {
      const j = new LoopbackJoinerTransport(this, id, name);
      this._joiners.set(id, j);
      this._notifyPeers();
      return j;
    },
    removeJoiner(id) {
      if (this._joiners.delete(id)) this._notifyPeers();
    },
    setJoinerName(id, name) {
      const j = this._joiners.get(id);
      if (j) {
        j.name = name;
        this._notifyPeers();
      }
    },
    destroy() {
      this._host.destroy();
    },
  };
  hub._host = new LoopbackHostTransport(hub);
  return hub;
}
