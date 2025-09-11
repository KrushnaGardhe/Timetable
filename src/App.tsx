import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppSelector, useAppDispatch } from './hooks/redux';
import AppLayout from './components/Layout/AppLayout';
import LoginForm from './components/Auth/LoginForm';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import TimetableView from './components/Timetable/TimetableView';
import DynamicGeneratorPage from './components/TimetableGenerator/DynamicGeneratorPage';
import AdminCRUDDashboard from './components/Admin/AdminCRUDDashboard';
import AnalyticsPage from './components/Analytics/AnalyticsPage';
import { 
  setDepartments, 
  setCourses, 
  setSubjects, 
  setBatches, 
  setFaculty, 
  setRooms, 
  setTimeSlots 
} from './store/slices/dataSlice';
import { 
  mockDepartments, 
  mockCourses, 
  mockSubjects, 
  mockBatches, 
  mockFaculty, 
  mockRooms, 
  mockTimeSlots 
} from './services/mockData';

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);

  useEffect(() => {
    // Load mock data when app starts
    dispatch(setDepartments(mockDepartments));
    dispatch(setCourses(mockCourses));
    dispatch(setSubjects(mockSubjects));
    dispatch(setBatches(mockBatches));
    dispatch(setFaculty(mockFaculty));
    dispatch(setRooms(mockRooms));
    dispatch(setTimeSlots(mockTimeSlots));
  }, [dispatch]);

  if (!user) {
    return <LoginForm />;
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/admin" element={<AdminCRUDDashboard />} />
        <Route path="/timetables" element={<TimetableView />} />
        <Route path="/generator" element={<DynamicGeneratorPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppLayout>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
};

export default App;