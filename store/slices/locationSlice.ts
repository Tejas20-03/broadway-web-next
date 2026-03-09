import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LocationState, OrderType } from '../../types';

const DEFAULT_LOCATION: LocationState = {
  orderType: 'delivery',
  city: 'Karachi',
  area: 'Bahadurabad',
  outlet: '',
  outletId: '',
  deliveryFee: 0,
  deliveryTax: 0,
};

interface LocationSliceState {
  data: LocationState;
  isHydrated: boolean;
  hasSetLocation: boolean;
}

const initialState: LocationSliceState = {
  data: DEFAULT_LOCATION,
  isHydrated: false,
  hasSetLocation: false,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setOrderType(state, action: PayloadAction<OrderType>) {
      state.data.orderType = action.payload;
    },
    setCity(state, action: PayloadAction<string>) {
      state.data = { ...state.data, city: action.payload, area: '', outlet: '', outletId: '' };
    },
    setArea(state, action: PayloadAction<string>) {
      state.data.area = action.payload;
      state.hasSetLocation = true;
    },
    setOutlet(state, action: PayloadAction<{ name: string; id: string }>) {
      state.data.outlet = action.payload.name;
      state.data.outletId = action.payload.id;
      state.hasSetLocation = true;
    },
    setDeliveryFees(state, action: PayloadAction<{ fee: number; tax: number }>) {
      state.data.deliveryFee = action.payload.fee;
      state.data.deliveryTax = action.payload.tax;
    },
    resetLocation(state) {
      state.data = DEFAULT_LOCATION;
      state.hasSetLocation = false;
    },
    hydrateLocation(state, action: PayloadAction<LocationState>) {
      state.data = { ...DEFAULT_LOCATION, ...action.payload };
      state.isHydrated = true;
      state.hasSetLocation = true;
    },
    setHydrated(state) {
      state.isHydrated = true;
    },
  },
});

export const locationActions = locationSlice.actions;
export default locationSlice;
