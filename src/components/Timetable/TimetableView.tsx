import React, { useState, useEffect } from 'react';
import { Calendar, Users, User, Building, Plus, Edit, Save, X } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { Session } from '../../types';

const TimetableView: React.FC = () => {
  const dispatch = useAppDispatch();
  const { sessions, conflicts } = useAppSelector(state => state.timetable);
  const { subjects, batches, faculty, rooms, timeSlots } = useAppSelector(state => state.data);
  const { user } = useAppSelector(state => state.auth);
  
  const [viewType, setViewType] = useState<'batch' | 'faculty' | 'room'>('batch');
  const [selectedId, setSelectedId] = useState<string>('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const [options, setOptions] = useState<any[]>([]);

  useEffect(() => {
    let newOptions: any[] = [];
    switch (viewType) {
      case 'batch':
        newOptions = batches;
        break;
      case 'faculty':
        newOptions = faculty;
        break;
      case 'room':
        newOptions = rooms;
        break;
    }
    setOptions(newOptions);
    if (newOptions.length > 0 && !selectedId) {
      setSelectedId(newOptions[0].id);
    }
  }, [viewType, batches, faculty, rooms]);

  const getFilteredSessions = () => {
    if (!selectedId) return [];
    
    return sessions.filter(session => {
      switch (viewType) {
        case 'batch':
          return session.batchId === selectedId;
        case 'faculty':
          return session.facultyId === selectedId;
        case 'room':
          return session.roomId === selectedId;
        default:
          return false;
      }
    });
  };

  const getCalendarEvents = () => {
    const filteredSessions = getFilteredSessions();
    
    return filteredSessions.map(session => {
      const subject = subjects.find(s => s.id === session.subjectId);
      const batch = batches.find(b => b.id === session.batchId);
      const facultyMember = faculty.find(f => f.id === session.facultyId);
      const room = rooms.find(r => r.id === session.roomId);
      const timeSlot = timeSlots.find(t => t.id === session.timeSlotId);
      
      if (!timeSlot || !subject) return null;

      // Convert day and time to calendar event format
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + (timeSlot.day - eventDate.getDay()));
      
      const [startHour, startMinute] = timeSlot.startTime.split(':').map(Number);
      const [endHour, endMinute] = timeSlot.endTime.split(':').map(Number);
      
      const start = new Date(eventDate);
      start.setHours(startHour, startMinute, 0);
      
      const end = new Date(eventDate);
      end.setHours(endHour, endMinute, 0);

      const hasConflict = conflicts.some(conflict => 
        conflict.sessionIds.includes(session.id)
      );

      return {
        id: session.id,
        title: `${subject.name} - ${batch?.name}`,
        start,
        end,
        backgroundColor: hasConflict ? '#ef4444' : session.type === 'lab' ? '#f59e0b' : '#3b82f6',
        borderColor: hasConflict ? '#dc2626' : session.type === 'lab' ? '#d97706' : '#2563eb',
        extendedProps: {
          session,
          subject,
          batch,
          faculty: facultyMember,
          room,
          hasConflict,
        },
      };
    }).filter(Boolean);
  };

  const handleEventClick = (info: any) => {
    if (user?.role === 'admin') {
      setSelectedSession(info.event.extendedProps.session);
      setEditDialogOpen(true);
    }
  };

  const handleSaveSession = () => {
    // In production, this would update the session via API
    setEditDialogOpen(false);
    setSelectedSession(null);
  };

  const getTimetableStats = () => {
    const filteredSessions = getFilteredSessions();
    const totalHours = filteredSessions.reduce((sum, session) => {
      const subject = subjects.find(s => s.id === session.subjectId);
      return sum + (subject?.sessionDuration || 60) / 60;
    }, 0);

    const conflictingSessions = filteredSessions.filter(session =>
      conflicts.some(conflict => conflict.sessionIds.includes(session.id))
    ).length;

    return {
      totalSessions: filteredSessions.length,
      totalHours: Math.round(totalHours * 10) / 10,
      conflicts: conflictingSessions,
      utilization: Math.round((totalHours / 40) * 100), // Assuming 40 hours per week max
    };
  };

  const stats = getTimetableStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Calendar className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Timetable View</h1>
        </div>
        
        {user?.role === 'admin' && (
          <button
            onClick={() => setEditDialogOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Session</span>
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">View Type</label>
          <select
            value={viewType}
            onChange={(e) => setViewType(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="batch">By Batch</option>
            <option value="faculty">By Faculty</option>
            <option value="room">By Room</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select {viewType}</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {options.map(option => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.totalSessions}</p>
          <p className="text-sm text-gray-600">Total Sessions</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.totalHours}h</p>
          <p className="text-sm text-gray-600">Total Hours</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{stats.conflicts}</p>
          <p className="text-sm text-gray-600">Conflicts</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{stats.utilization}%</p>
          <p className="text-sm text-gray-600">Utilization</p>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          events={getCalendarEvents()}
          eventClick={handleEventClick}
          height="600px"
          slotMinTime="08:00:00"
          slotMaxTime="18:00:00"
          allDaySlot={false}
          eventDisplay="block"
          dayHeaderFormat={{ weekday: 'long' }}
        />
      </div>

      {/* Edit Dialog */}
      {editDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                {selectedSession ? 'Edit Session' : 'Add Session'}
              </h2>
              <button
                onClick={() => setEditDialogOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Batch</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select Batch</option>
                    {batches.map(batch => (
                      <option key={batch.id} value={batch.id}>
                        {batch.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Faculty</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select Faculty</option>
                    {faculty.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Room</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select Room</option>
                    {rooms.map(room => (
                      <option key={room.id} value={room.id}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 p-6 border-t">
              <button
                onClick={() => setEditDialogOpen(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSession}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableView;