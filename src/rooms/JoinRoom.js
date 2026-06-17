import { removeFrom } from '../transport/Transport.js';

/* JoinRoom — a joiner's link to the host. Sends inputs, renders broadcast state. Exposes the
   PlayerLink shape ({ send, onMessage }) that game components consume, identical to the host's
   selfLink(), so a game never knows or cares whether it's the host or a joiner. */

export class JoinRoom {
  constructor(transport, { name = 'אנונימי', color = 'var(--poll)' } = {}) {
    this.t = transport;
    this.id = transport.id || null;
    this.name = name;
    this.color = color;
    this.isHost = false;
    this._cbs = [];
    this._unsub = transport.onMessage((msg) => {
      if (msg && msg.to && msg.to !== this.id) return; // targeted to another peer
      for (const cb of this._cbs.slice()) cb(msg);
    });
  }

  join() {
    this.t.send({ t: 'join', name: this.name, color: this.color });
  }

  // PlayerLink
  send(input) {
    this.t.send(input);
  }
  onMessage(cb) {
    this._cbs.push(cb);
    return () => removeFrom(this._cbs, cb);
  }

  leave() {
    this.t.send({ t: 'leave' });
  }

  destroy() {
    if (this._unsub) this._unsub();
    if (this.t && this.t.destroy) this.t.destroy();
    this._cbs = [];
  }
}
