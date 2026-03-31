import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, ProductOption, ProductSize } from '../../types';

export interface AddToCartPayload {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  category?: string;
  selectedSize?: ProductSize;
  selectedOptions?: { [groupId: string]: ProductOption[] };
  selectedOptionGroupNames?: { [groupId: string]: string };
  minimumDelivery?: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

const initialState: CartState = {
  items: [],
  isOpen: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<AddToCartPayload>) {
      const item = action.payload;
      const optionsKey = item.selectedOptions
        ? Object.values(item.selectedOptions).flat().map(o => o.id).sort().join('-')
        : 'no-opts';
      const cartId = `${item.productId}-${item.selectedSize?.id ?? 'def'}-${optionsKey}`;
      const existing = state.items.find(i => i.cartId === cartId);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        state.items.push({ ...item, cartId });
      }
      state.isOpen = true;
    },
    updateQuantity(state, action: PayloadAction<{ cartId: string; delta: number }>) {
      const { cartId, delta } = action.payload;
      const idx = state.items.findIndex(i => i.cartId === cartId);
      if (idx !== -1) {
        state.items[idx].quantity = Math.max(0, state.items[idx].quantity + delta);
        if (state.items[idx].quantity === 0) state.items.splice(idx, 1);
      }
    },
    clearCart(state) {
      state.items = [];
    },
    openCart(state) { state.isOpen = true; },
    closeCart(state) { state.isOpen = false; },
    hydrateCart(state, action: PayloadAction<CartState>) {
      state.items = action.payload.items ?? [];
      state.isOpen = false;
    },
  },
});

export const cartActions = cartSlice.actions;
export default cartSlice;
