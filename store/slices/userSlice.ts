import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';

interface UserState {
  user: User | null;
  guestPhone: string;
}

const initialState: UserState = {
  user: null,
  guestPhone: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    logout(state) {
      state.user = null;
    },
    hydrateUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
    },
    setGuestPhone(state, action: PayloadAction<string>) {
      state.guestPhone = action.payload;
    },
  },
});

export const userActions = userSlice.actions;
export default userSlice;
