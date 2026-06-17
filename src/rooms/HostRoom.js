import { removeFrom } from '../transport/Transport.js';

/* HostRoom — the single source of truth. Holds the roster, relays/validates inputs, and runs
   the active game's host logic. Talks ONLY to a Transport (loopback or PeerJS). The host is
   also a player: `selfLink()` returns a PlayerLink (the same shape JoinRoom exposes) so the
   host's own game UI is wired identically to a joiner's. */

export class HostRoom {
  constructor(transport, { hostId = 'host', hostName = 'מנחה', color = 'var(--bingo)' } = {}) {
    this.t = transport;
    this.hostId = hostId;
    this.players = new Map([[hostId, { id: hostId, name: hostName, color, isHost: true }]]);
    this.gameId = null;
    this.config = null;
    this.logic = null;

    this._localCbs = []; // host self-player broadcast listeners
    this._rosterCbs = []; // controller roster subscribers
    this._peerLeftCbs = [];

    this._unsubMsg = transport.onMessage((msg) => this._onInput(msg._from, msg));
    this._unsubPeers = transport.onPeerChange((peers) => this._onPeers(peers));
  }

  // ---- inbound ----
  _onInput(fromId, msg) {
    if (!msg || !msg.t) return;
    switch (msg.t) {
      case 'join':
        this.players.set(fromId, {
          id: fromId,
          name: msg.name || 'אנונימי',
          color: msg.color || 'var(--poll)',
          isHost: false,
        });
        this._broadcastRoster();
        // if a game is mid-flight, bring the (re)joiner up to date
        if (this.gameId) {
          this.broadcast({ t: 'start', game: this.gameId, config: this.config });
          if (this.logic && this.logic.snapshot) this.broadcast(this.logic.snapshot());
        }
        break;
      case 'leave':
        if (this.players.delete(fromId)) this._broadcastRoster();
        break;
      default:
        if (this.logic && this.logic.onInput) this.logic.onInput(fromId, msg);
    }
  }

  _onPeers(peers) {
    const live = new Set(peers.map((p) => p.id));
    let changed = false;
    for (const id of [...this.players.keys()]) {
      if (id === this.hostId) continue;
      if (!live.has(id)) {
        const gone = this.players.get(id);
        this.players.delete(id);
        changed = true;
        for (const cb of this._peerLeftCbs.slice()) cb(gone);
      }
    }
    if (changed) this._broadcastRoster();
  }

  // ---- outbound ----
  broadcast(msg) {
    this.t.send(msg); // → joiners
    for (const cb of this._localCbs.slice()) cb(msg); // → host self-player
  }

  _broadcastRoster() {
    const players = this.getRoster();
    this.broadcast({ t: 'roster', players });
    for (const cb of this._rosterCbs.slice()) cb(players);
  }

  getRoster() {
    return [...this.players.values()];
  }

  // ---- game lifecycle ----
  startGame(gameId, config, hostLogicFactory) {
    this.gameId = gameId;
    this.config = config;
    const ctx = {
      broadcast: (m) => this.broadcast(m),
      end: (results) => this.endGame(results),
      getPlayers: () => this.getRoster(),
      hostId: this.hostId,
    };
    this.logic = hostLogicFactory ? hostLogicFactory(config, ctx) : null;
    this.broadcast({ t: 'start', game: gameId, config });
    if (this.logic && this.logic.start) this.logic.start();
  }

  endGame(results) {
    if (this.logic && this.logic.stop) this.logic.stop();
    this.logic = null;
    this.gameId = null;
    this.broadcast({ t: 'end', results });
  }

  // ---- the host's own player link (mirrors JoinRoom's PlayerLink) ----
  selfLink() {
    const room = this;
    return {
      isHost: true,
      send(input) {
        room._onInput(room.hostId, input);
      },
      onMessage(cb) {
        room._localCbs.push(cb);
        return () => removeFrom(room._localCbs, cb);
      },
    };
  }

  onRoster(cb) {
    this._rosterCbs.push(cb);
    cb(this.getRoster());
    return () => removeFrom(this._rosterCbs, cb);
  }

  onPeerLeft(cb) {
    this._peerLeftCbs.push(cb);
    return () => removeFrom(this._peerLeftCbs, cb);
  }

  destroy() {
    if (this._unsubMsg) this._unsubMsg();
    if (this._unsubPeers) this._unsubPeers();
    if (this.logic && this.logic.stop) this.logic.stop();
    if (this.t && this.t.destroy) this.t.destroy();
    this._localCbs = [];
    this._rosterCbs = [];
    this._peerLeftCbs = [];
  }
}
