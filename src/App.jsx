import React from 'react';
import { StoreProvider } from './state/store.jsx';
import AppRouter from './AppRouter.jsx';

export default function App() {
  return (
    <StoreProvider>
      <AppRouter />
    </StoreProvider>
  );
}
