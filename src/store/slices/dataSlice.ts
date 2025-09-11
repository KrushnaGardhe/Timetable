import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Department, Course, Subject, Batch, Faculty, Room, TimeSlot } from '../../types';

interface DataState {
  departments: Department[];
  courses: Course[];
  subjects: Subject[];
  batches: Batch[];
  faculty: Faculty[];
  rooms: Room[];
  timeSlots: TimeSlot[];
  isLoading: boolean;
  error: string | null;
}

const initialState: DataState = {
  departments: [],
  courses: [],
  subjects: [],
  batches: [],
  faculty: [],
  rooms: [],
  timeSlots: [],
  isLoading: false,
  error: null,
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setDepartments: (state, action: PayloadAction<Department[]>) => {
      state.departments = action.payload;
    },
    setCourses: (state, action: PayloadAction<Course[]>) => {
      state.courses = action.payload;
    },
    setSubjects: (state, action: PayloadAction<Subject[]>) => {
      state.subjects = action.payload;
    },
    setBatches: (state, action: PayloadAction<Batch[]>) => {
      state.batches = action.payload;
    },
    setFaculty: (state, action: PayloadAction<Faculty[]>) => {
      state.faculty = action.payload;
    },
    setRooms: (state, action: PayloadAction<Room[]>) => {
      state.rooms = action.payload;
    },
    setTimeSlots: (state, action: PayloadAction<TimeSlot[]>) => {
      state.timeSlots = action.payload;
    },
    addDepartment: (state, action: PayloadAction<Department>) => {
      state.departments.push(action.payload);
    },
    updateDepartment: (state, action: PayloadAction<Department>) => {
      const index = state.departments.findIndex(d => d.id === action.payload.id);
      if (index !== -1) {
        state.departments[index] = action.payload;
      }
    },
    deleteDepartment: (state, action: PayloadAction<string>) => {
      state.departments = state.departments.filter(d => d.id !== action.payload);
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
  setDepartments,
  setCourses,
  setSubjects,
  setBatches,
  setFaculty,
  setRooms,
  setTimeSlots,
  addDepartment,
  updateDepartment,
  deleteDepartment,
  setLoading,
  setError,
} = dataSlice.actions;

export default dataSlice.reducer;