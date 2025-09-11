import React, { useState } from 'react';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Building, 
  Settings, 
  Zap,
  RefreshCw,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { addNotification } from '../../store/slices/uiSlice';
import { setGenerating } from '../../store/slices/timetableSlice';
import FacultyManagement from './FacultyManagement';
import BatchManagement from './BatchManagement';
import SubjectManagement from './SubjectManagement';
import RoomManagement from './RoomManagement';
import TimeSlotManagement from './TimeSlotManagement';

const AdminCRUDDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { faculty, batches, subjects, rooms, departments, timeSlots } = useAppSelector(state => state.data);
  const { isGenerating } = useAppSelector(state => state.timetable);
  
  const [activeTab, setActiveTab] = useState('faculty');

  const tabs = [
    { id: 'faculty', name: 'Faculty', icon: Users, count: faculty.length },
    { id: 'batches', name: 'Batches', icon: GraduationCap, count: batches.length },
    { id: 'subjects', name: 'Subjects', icon: BookOpen, count: subjects.length },
    { id: 'rooms', name: 'Rooms', icon: Building, count: rooms.length },
    { id: 'timeslots', name: 'Time Slots', icon: Clock, count: timeSlots.length },
  ];

  const handleRegenerateTimetable = async () => {
    dispatch(setGenerating(true));
    
    // Simulate timetable regeneration
    setTimeout(() => {
      dispatch(setGenerating(false));
      dispatch(addNotification({
        type: 'success',
        title: 'Timetable Regenerated',
        message: 'New timetable has been generated based on updated data',
      }));
    }, 3000);
  };

  const getSystemStatus = () => {
    const totalEntities = faculty.length + batches.length + subjects.length + rooms.length + timeSlots.length;
    const hasMinimumData = faculty.length >= 1 && batches.length >= 1 && subjects.length >= 1 && rooms.length >= 1 && timeSlots.length >= 1;
    
    return {
      totalEntities,
      hasMinimumData,
      status: hasMinimumData ? 'ready' : 'incomplete'
    };
  };

  const systemStatus = getSystemStatus();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'faculty':
        return <FacultyManagement />;
      case 'batches':
        return <BatchManagement />;
      case 'subjects':
        return <SubjectManagement />;
      case 'rooms':
        return <RoomManagement />;
      case 'timeslots':
        return <TimeSlotManagement />;
      default:
        return <FacultyManagement />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Settings className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Admin CRUD Dashboard</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
            systemStatus.status === 'ready' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">
              {systemStatus.status === 'ready' ? 'System Ready' : 'Setup Incomplete'}
            </span>
          </div>
          
          <button
            onClick={handleRegenerateTimetable}
            disabled={isGenerating || systemStatus.status !== 'ready'}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            <span>{isGenerating ? 'Regenerating...' : 'Regenerate Timetable'}</span>
          </button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <div key={tab.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{tab.name}</p>
                    <p className="text-2xl font-bold text-gray-800">{tab.count}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                  <span className={`
                    inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full
                    ${activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}
                  `}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
        
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* System Status */}
      {systemStatus.status !== 'ready' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Settings className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Setup Required</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Please ensure you have at least 1 faculty member, 1 batch, 1 subject, 1 room, and time slots configured before generating timetables.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCRUDDashboard;