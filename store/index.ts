import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import uiSlice from './slices/uiSlice';
import cartSlice from './slices/cartSlice';
import locationSlice from './slices/locationSlice';
import userSlice from './slices/userSlice';
import { broadwayApi } from './apiSlice';

export const makeStore = () =>
  configureStore({
    reducer: {
      ui: uiSlice.reducer,
      cart: cartSlice.reducer,
      location: locationSlice.reducer,
      user: userSlice.reducer,
      [broadwayApi.reducerPath]: broadwayApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(broadwayApi.middleware),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

// Typed hooks — use these throughout the app instead of plain useDispatch/useSelector
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
