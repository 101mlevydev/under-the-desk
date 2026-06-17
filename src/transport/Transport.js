/* The Transport interface — the seam that makes same-device the floor and live P2P a
   clean upgrade. EVERY game and room talks only to this shape; never to PeerJS directly.

   A Transport has a role ('host' | 'joiner') and the methods below. Two implementations:
     - LoopbackTransport  (same-device, in-memory, synchronous)   — the guaranteed path
     - PeerJSTransport    (WebRTC data channels via the public broker, star topology)

   Host transport:
     send(msg)            broadcast an authoritative message to all joiners
     onMessage(cb)        receive inputs from joiners; msg carries `_from` (sender id)
     onPeerChange(cb)     called with the current peer list whenever it changes
     getPeers()           current [{ id, name }] of connected joiners
     destroy()

   Joiner transport:
     send(msg)            send an input to the host
     onMessage(cb)        receive host broadcasts
     destroy()

   `onMessage`/`onPeerChange` return an unsubscribe function. Message envelope: { t, ... }.
   This file documents the contract; implementations live alongside it. */

export function removeFrom(arr, item) {
  const i = arr.indexOf(item);
  if (i >= 0) arr.splice(i, 1);
}

// A tiny base to share subscription bookkeeping between implementations.
export class TransportBase {
  constructor(role) {
    this.role = role;
    this._msgCbs = [];
    this._peerCbs = [];
  }
  onMessage(cb) {
    this._msgCbs.push(cb);
    return () => removeFrom(this._msgCbs, cb);
  }
  onPeerChange(cb) {
    this._peerCbs.push(cb);
    return () => removeFrom(this._peerCbs, cb);
  }
  _emitMessage(msg) {
    for (const cb of this._msgCbs.slice()) cb(msg);
  }
  _emitPeers(peers) {
    for (const cb of this._peerCbs.slice()) cb(peers);
  }
}
