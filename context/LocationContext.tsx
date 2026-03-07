'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { locationActions } from '../store/slices/locationSlice';
import type { LocationState, OrderType } from '../types';

export function useLocation() {
  const dispatch = useAppDispatch();
  const { data: location, isHydrated } = useAppSelector((state) => state.location);

  return {
    location,
    isHydrated,
    setOrderType: useCallback((type: OrderType) => dispatch(locationActions.setOrderType(type)), [dispatch]),
    setCity: useCallback((city: string) => dispatch(locationActions.setCity(city)), [dispatch]),
    setArea: useCallback((area: string) => dispatch(locationActions.setArea(area)), [dispatch]),
    setOutlet: useCallback((name: string, id: string) => dispatch(locationActions.setOutlet({ name, id })), [dispatch]),
    resetLocation: useCallback(() => dispatch(locationActions.resetLocation()), [dispatch]),
  };
}

// Kept for any imports that reference the provider — StoreProvider in layout.tsx handles this now
export function LocationProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
