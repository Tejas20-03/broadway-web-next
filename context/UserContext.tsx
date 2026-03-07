'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { userActions } from '../store/slices/userSlice';
import type { User } from '../types';

export function useUser() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);

  return {
    user,
    isLoggedIn: !!user,
    login: useCallback((u: User) => dispatch(userActions.login(u)), [dispatch]),
    logout: useCallback(() => dispatch(userActions.logout()), [dispatch]),
  };
}

// Kept for any imports that reference the provider — StoreProvider in layout.tsx handles this now
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);

