import React, { createContext, useContext, useReducer, useCallback, useRef } from 'react';
import { RoomController } from '../rooms/RoomController.js';
import { GAME_META } from '../games/gameRegistry.js';

/* Central app store: navigation + room/session state.
   Transport/room wiring (host/join controller) is attached in Step 04/08;
   here we hold the shape and the navigation + roster reducers it will drive. */

const AVATAR_COLORS = ['var(--bingo)', 'var(--poll)', 'var(--counter)', 'var(--trivia)', 'var(--reaction)', 'var(--predict)'];

const initialState = {
  screen: 'home',          // home | pick | customize | invite | lobby | game | results
  role: null,              // 'host' | 'join'
  mode: null,              // 'loopback' | 'peerjs'
  selectedGame: null,      // game id
  config: {},              // per-game content config keyed by game id
  roster: [],              // [{ id, name, color, isHost }]
  connection: 'idle',      // idle | opening | waiting | connecting | connected | peer-left | failed
  roomCode: null,
  results: null,
  freshJoinId: null,       // id of the player who just joined (for the pop animation)
  toast: null,
  me: { id: null, name: '', color: AVATAR_COLORS[0] },
};

function reducer(state, action) {
  switch (action.type) {
    case 'NAV':
      return { ...state, screen: action.screen };
    case 'SET':
      return { ...state, ...action.patch };
    case 'SET_ROSTER': {
      const prev = new Set(state.roster.map((p) => p.id));
      const fresh = action.roster.find((p) => !prev.has(p.id));
      return { ...state, roster: action.roster, freshJoinId: fresh ? fresh.id : state.freshJoinId };
    }
    case 'CLEAR_FRESH':
      return { ...state, freshJoinId: null };
    case 'TOAST':
      return { ...state, toast: action.toast };
    case 'RESET_SESSION':
      return {
        ...initialState,
        screen: 'home',
        me: state.me, // keep player identity
      };
    default:
      return state;
  }
}

const StoreCtx = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const toastTimer = useRef(null);
  const controllerRef = useRef(null); // RoomController for the active session
  const stateRef = useRef(state);
  stateRef.current = state;

  const navigate = useCallback((screen) => dispatch({ type: 'NAV', screen }), []);
  const set = useCallback((patch) => dispatch({ type: 'SET', patch }), []);
  const setRoster = useCallback((roster) => dispatch({ type: 'SET_ROSTER', roster }), []);

  const toast = useCallback((msg) => {
    dispatch({ type: 'TOAST', toast: msg });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => dispatch({ type: 'TOAST', toast: null }), 2200);
  }, []);

  // Centralized session listener: roster, game start/end, navigation. Subscribing does not
  // dispatch synchronously; the one-time initial roster is deferred to a microtask so this is
  // safe even when first reached during render. Guarded so a controller is wired once.
  const wireSession = useCallback((ctrl) => {
    if (!ctrl || ctrl._wired) return;
    ctrl._wired = true;
    ctrl.link.onMessage((msg) => {
      if (msg.t === 'roster') {
        dispatch({ type: 'SET_ROSTER', roster: msg.players });
      } else if (msg.t === 'start') {
        dispatch({
          type: 'SET',
          patch: {
            selectedGame: msg.game,
            config: { ...stateRef.current.config, [msg.game]: msg.config },
          },
        });
        if (stateRef.current.role === 'join') dispatch({ type: 'NAV', screen: 'game' });
      } else if (msg.t === 'end') {
        if (ctrl.stopBots) ctrl.stopBots();
        const gid = stateRef.current.selectedGame;
        const meta = GAME_META[gid] || {};
        dispatch({
          type: 'SET',
          patch: { results: { game: gid, accent: gid, title: meta.title, icon: meta.icon, ...msg.results } },
        });
        dispatch({ type: 'NAV', screen: 'results' });
      }
    });
    queueMicrotask(() => {
      const init = ctrl.getInitialRoster ? ctrl.getInitialRoster() : [];
      if (init.length) dispatch({ type: 'SET_ROSTER', roster: init });
    });
  }, []);

  // Lazily create the HOST session controller (loopback = same-device, peerjs = open a room).
  const ensureHost = useCallback(() => {
    if (!controllerRef.current) {
      const me = {
        id: 'host',
        name: stateRef.current.me.name || 'מנחה',
        color: stateRef.current.me.color,
      };
      controllerRef.current = new RoomController({
        role: 'host',
        mode: stateRef.current.mode || 'loopback',
        me,
        roomCode: stateRef.current.roomCode,
        onStatus: (status) => dispatch({ type: 'SET', patch: { connection: status, roomCode: controllerRef.current ? controllerRef.current.roomCode : null } }),
      });
    }
    wireSession(controllerRef.current);
    return controllerRef.current;
  }, [wireSession]);

  // Create a JOINER controller and connect to a host by code.
  const joinAsPlayer = useCallback((code, name) => {
    if (controllerRef.current && controllerRef.current.destroy) controllerRef.current.destroy();
    const me = {
      id: null,
      name: (name || stateRef.current.me.name || '').trim() || 'אורח/ת',
      color: stateRef.current.me.color,
    };
    const ctrl = new RoomController({
      role: 'join',
      mode: 'peerjs',
      me,
      roomCode: code,
      onStatus: (status) => dispatch({ type: 'SET', patch: { connection: status } }),
    });
    controllerRef.current = ctrl;
    wireSession(ctrl);
    dispatch({ type: 'SET', patch: { role: 'join', mode: 'peerjs', roomCode: code, connection: 'connecting' } });
    dispatch({ type: 'NAV', screen: 'lobby' });
  }, [wireSession]);

  // Drop the network session and fall back to same-device — never a dead-end.
  const fallbackToSoloMode = useCallback(() => {
    if (controllerRef.current && controllerRef.current.destroy) controllerRef.current.destroy();
    controllerRef.current = null;
    dispatch({ type: 'SET', patch: { role: 'host', mode: 'loopback', connection: 'connected', roomCode: null, roster: [] } });
    dispatch({ type: 'NAV', screen: stateRef.current.selectedGame ? 'game' : 'pick' });
  }, []);

  const resetSession = useCallback(() => {
    if (controllerRef.current && controllerRef.current.destroy) {
      controllerRef.current.destroy();
    }
    controllerRef.current = null;
    dispatch({ type: 'RESET_SESSION' });
  }, []);

  const value = {
    state,
    dispatch,
    navigate,
    set,
    setRoster,
    toast,
    resetSession,
    ensureHost,
    joinAsPlayer,
    fallbackToSoloMode,
    controllerRef,
    AVATAR_COLORS,
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export { AVATAR_COLORS };
