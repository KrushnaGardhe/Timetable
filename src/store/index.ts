import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import dataSlice from './slices/dataSlice';
import timetableSlice from './slices/timetableSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    data: dataSlice,
    timetable: timetableSlice,
    ui: uiSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;