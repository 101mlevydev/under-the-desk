import React, { createContext, useContext, useReducer, useCallback, useRef } from 'react';

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
  const controllerRef = useRef(null); // HostRoom | JoinRoom (attached in later steps)

  const navigate = useCallback((screen) => dispatch({ type: 'NAV', screen }), []);
  const set = useCallback((patch) => dispatch({ type: 'SET', patch }), []);
  const setRoster = useCallback((roster) => dispatch({ type: 'SET_ROSTER', roster }), []);

  const toast = useCallback((msg) => {
    dispatch({ type: 'TOAST', toast: msg });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => dispatch({ type: 'TOAST', toast: null }), 2200);
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
