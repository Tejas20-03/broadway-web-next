import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LocationState, OrderType } from '../../types';

const DEFAULT_LOCATION: LocationState = {
  orderType: 'delivery',
  city: 'Karachi',
  area: 'Bahadurabad',
  outlet: '',
  outletId: '',
};

interface LocationSliceState {
  data: LocationState;
  isHydrated: boolean;
}

const initialState: LocationSliceState = {
  data: DEFAULT_LOCATION,
  isHydrated: false,
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
    },
    setOutlet(state, action: PayloadAction<{ name: string; id: string }>) {
      state.data.outlet = action.payload.name;
      state.data.outletId = action.payload.id;
    },
    resetLocation(state) {
      state.data = DEFAULT_LOCATION;
    },
    hydrateLocation(state, action: PayloadAction<LocationState>) {
      state.data = action.payload;
      state.isHydrated = true;
    },
    setHydrated(state) {
      state.isHydrated = true;
    },
  },
});

export const locationActions = locationSlice.actions;
export default locationSlice;
