import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem } from '../../types';

export interface LastOrder {
  items: CartItem[];
  subtotal: number;
  taxBreakdown: number;    // GST extracted for display — already included in prices
  preTaxSubtotal: number; // subtotal - taxBreakdown (sent as orderamount to API)
  deliveryFee: number;
  total: number;
  discountAmount?: number; // voucher discount amount
  voucher?: string;        // voucher code applied
  orderId?: string;
  encOrderId?: string;
  deliveryTime?: string;
  orderAddress?: string;
  orderType?: string;
  paymentType?: string;
}

interface UiState {
  isDark: boolean;
  isMenuOpen: boolean;
  isLocationOpen: boolean;
  isCheckoutOpen: boolean;
  isOrderConfirmed: boolean;
  lastOrder: LastOrder | null;
  checkoutVoucher: { code: string; amount: number };
  isLoginOpen: boolean;
  isContactOpen: boolean;
  isFranchiseOpen: boolean;
  isBirthdayOpen: boolean;
  isFeedbackOpen: boolean;
  isSpinOpen: boolean;
}

const initialState: UiState = {
  isDark: true,
  isMenuOpen: false,
  isLocationOpen: false,
  isCheckoutOpen: false,
  isOrderConfirmed: false,
  lastOrder: null,
  checkoutVoucher: { code: '', amount: 0 },
  isLoginOpen: false,
  isContactOpen: false,
  isFranchiseOpen: false,
  isBirthdayOpen: false,
  isFeedbackOpen: false,
  isSpinOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setDark(state, action: PayloadAction<boolean>) {
      state.isDark = action.payload;
    },
    toggleTheme(state) {
      state.isDark = !state.isDark;
    },
    openMenu(state) { state.isMenuOpen = true; },
    closeMenu(state) { state.isMenuOpen = false; },
    openLocation(state) { state.isLocationOpen = true; },
    closeLocation(state) { state.isLocationOpen = false; },
    openCheckout(state) { state.isCheckoutOpen = true; },
    closeCheckout(state) { state.isCheckoutOpen = false; },
    confirmOrder(state) {
      state.isCheckoutOpen = false;
      state.isOrderConfirmed = true;
    },
    closeOrderConfirmation(state) {
      state.isOrderConfirmed = false;
      state.lastOrder = null;
    },
    setLastOrder(state, action: PayloadAction<LastOrder | null>) {
      state.lastOrder = action.payload;
    },
    setCheckoutVoucher(state, action: PayloadAction<{ code: string; amount: number }>) {
      state.checkoutVoucher = action.payload;
    },
    openLogin(state) { state.isLoginOpen = true; },
    closeLogin(state) { state.isLoginOpen = false; },
    openContact(state) { state.isContactOpen = true; },
    closeContact(state) { state.isContactOpen = false; },
    openFranchise(state) { state.isFranchiseOpen = true; },
    closeFranchise(state) { state.isFranchiseOpen = false; },
    openBirthday(state) { state.isBirthdayOpen = true; },
    closeBirthday(state) { state.isBirthdayOpen = false; },
    openFeedback(state) { state.isFeedbackOpen = true; },
    closeFeedback(state) { state.isFeedbackOpen = false; },
    openSpin(state) { state.isSpinOpen = true; },
    closeSpin(state) { state.isSpinOpen = false; },
  },
});

export const uiActions = uiSlice.actions;
export default uiSlice;
