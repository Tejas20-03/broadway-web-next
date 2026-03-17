'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { uiActions } from '../store/slices/uiSlice';
import type { LastOrder } from '../store/slices/uiSlice';

export type { LastOrder };

export function useApp() {
  const dispatch = useAppDispatch();
  const ui = useAppSelector((state) => state.ui);

  return {
    isDark: ui.isDark,
    toggleTheme: useCallback(() => dispatch(uiActions.toggleTheme()), [dispatch]),

    isMenuOpen: ui.isMenuOpen,
    openMenu: useCallback(() => dispatch(uiActions.openMenu()), [dispatch]),
    closeMenu: useCallback(() => dispatch(uiActions.closeMenu()), [dispatch]),

    isLocationOpen: ui.isLocationOpen,
    openLocation: useCallback(() => dispatch(uiActions.openLocation()), [dispatch]),
    closeLocation: useCallback(() => dispatch(uiActions.closeLocation()), [dispatch]),

    isCheckoutOpen: ui.isCheckoutOpen,
    openCheckout: useCallback(() => dispatch(uiActions.openCheckout()), [dispatch]),
    closeCheckout: useCallback(() => dispatch(uiActions.closeCheckout()), [dispatch]),

    isOrderConfirmed: ui.isOrderConfirmed,
    confirmOrder: useCallback(() => dispatch(uiActions.confirmOrder()), [dispatch]),
    closeOrderConfirmation: useCallback(() => dispatch(uiActions.closeOrderConfirmation()), [dispatch]),
    lastOrder: ui.lastOrder,
    setLastOrder: useCallback((order: LastOrder | null) => dispatch(uiActions.setLastOrder(order)), [dispatch]),

    isLoginOpen: ui.isLoginOpen,
    openLogin: useCallback(() => dispatch(uiActions.openLogin()), [dispatch]),
    closeLogin: useCallback(() => dispatch(uiActions.closeLogin()), [dispatch]),

    isContactOpen: ui.isContactOpen,
    openContact: useCallback(() => dispatch(uiActions.openContact()), [dispatch]),
    closeContact: useCallback(() => dispatch(uiActions.closeContact()), [dispatch]),

    isCateringOpen: ui.isCateringOpen,
    openCatering: useCallback(() => dispatch(uiActions.openCatering()), [dispatch]),
    closeCatering: useCallback(() => dispatch(uiActions.closeCatering()), [dispatch]),

    isCorporateOpen: ui.isCorporateOpen,
    openCorporate: useCallback(() => dispatch(uiActions.openCorporate()), [dispatch]),
    closeCorporate: useCallback(() => dispatch(uiActions.closeCorporate()), [dispatch]),

    isFranchiseOpen: ui.isFranchiseOpen,
    openFranchise: useCallback(() => dispatch(uiActions.openFranchise()), [dispatch]),
    closeFranchise: useCallback(() => dispatch(uiActions.closeFranchise()), [dispatch]),

    isBirthdayOpen: ui.isBirthdayOpen,
    openBirthday: useCallback(() => dispatch(uiActions.openBirthday()), [dispatch]),
    closeBirthday: useCallback(() => dispatch(uiActions.closeBirthday()), [dispatch]),

    isFeedbackOpen: ui.isFeedbackOpen,
    openFeedback: useCallback(() => dispatch(uiActions.openFeedback()), [dispatch]),
    closeFeedback: useCallback(() => dispatch(uiActions.closeFeedback()), [dispatch]),

    isSpinOpen: ui.isSpinOpen,
    openSpin: useCallback(() => dispatch(uiActions.openSpin()), [dispatch]),
    closeSpin: useCallback(() => dispatch(uiActions.closeSpin()), [dispatch]),
  };
}

// Kept for any imports that reference the provider � StoreProvider in layout.tsx handles this now
export function AppProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
