'use client';

import { useRef, useEffect } from 'react';
import { Provider } from 'react-redux';
import { setupListeners } from '@reduxjs/toolkit/query';
import { makeStore, AppStore } from './index';
import { uiActions } from './slices/uiSlice';
import { cartActions } from './slices/cartSlice';
import { locationActions } from './slices/locationSlice';
import { userActions } from './slices/userSlice';
import type { LocationState, User } from '../types';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  useEffect(() => {
    const store = storeRef.current!;

    // ── Hydrate from localStorage (client-only) ────────────────────────────
    try {
      const theme = localStorage.getItem('broadway-theme');
      if (theme) store.dispatch(uiActions.setDark(theme === 'dark'));

      const cartRaw = localStorage.getItem('broadway-cart');
      if (cartRaw) store.dispatch(cartActions.hydrateCart(JSON.parse(cartRaw)));

      const locationRaw = localStorage.getItem('broadway-location');
      if (locationRaw) store.dispatch(locationActions.hydrateLocation(JSON.parse(locationRaw) as LocationState));
      else store.dispatch(locationActions.setHydrated());

      const userRaw = localStorage.getItem('broadway-user');
      if (userRaw) store.dispatch(userActions.hydrateUser(JSON.parse(userRaw) as User));
    } catch {
      store.dispatch(locationActions.setHydrated());
    }

    // ── Persist state to localStorage + sync dark-mode class ──────────────
    const unsubscribe = store.subscribe(() => {
      const state = store.getState();
      document.documentElement.classList.toggle('dark', state.ui.isDark);
      try {
        localStorage.setItem('broadway-theme', state.ui.isDark ? 'dark' : 'light');
        localStorage.setItem('broadway-cart', JSON.stringify(state.cart));
        localStorage.setItem('broadway-location', JSON.stringify(state.location.data));
        if (state.user.user) {
          localStorage.setItem('broadway-user', JSON.stringify(state.user.user));
        } else {
          localStorage.removeItem('broadway-user');
        }
      } catch { /* storage unavailable */ }
    });

    // ── Enable RTK Query background refetch on focus / reconnect ──────────
    const unsubListeners = setupListeners(store.dispatch);

    return () => {
      unsubscribe();
      unsubListeners();
    };
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
