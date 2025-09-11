import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Timetable, Session, ConflictInfo, AnalyticsData } from '../../types';

interface TimetableState {
  timetables: Timetable[];
  currentTimetable: Timetable | null;
  sessions: Session[];
  conflicts: ConflictInfo[];
  analytics: AnalyticsData | null;
  isGenerating: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: TimetableState = {
  timetables: [],
  currentTimetable: null,
  sessions: [],
  conflicts: [],
  analytics: null,
  isGenerating: false,
  isLoading: false,
  error: null,
};

const timetableSlice = createSlice({
  name: 'timetable',
  initialState,
  reducers: {
    setTimetables: (state, action: PayloadAction<Timetable[]>) => {
      state.timetables = action.payload;
    },
    setCurrentTimetable: (state, action: PayloadAction<Timetable | null>) => {
      state.currentTimetable = action.payload;
    },
    setSessions: (state, action: PayloadAction<Session[]>) => {
      state.sessions = action.payload;
    },
    addSession: (state, action: PayloadAction<Session>) => {
      state.sessions.push(action.payload);
    },
    updateSession: (state, action: PayloadAction<Session>) => {
      const index = state.sessions.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.sessions[index] = action.payload;
      }
    },
    deleteSession: (state, action: PayloadAction<string>) => {
      state.sessions = state.sessions.filter(s => s.id !== action.payload);
    },
    setConflicts: (state, action: PayloadAction<ConflictInfo[]>) => {
      state.conflicts = action.payload;
    },
    setAnalytics: (state, action: PayloadAction<AnalyticsData>) => {
      state.analytics = action.payload;
    },
    setGenerating: (state, action: PayloadAction<boolean>) => {
      state.isGenerating = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setTimetables,
  setCurrentTimetable,
  setSessions,
  addSession,
  updateSession,
  deleteSession,
  setConflicts,
  setAnalytics,
  setGenerating,
  setLoading,
  setError,
} = timetableSlice.actions;

export default timetableSlice.reducer;