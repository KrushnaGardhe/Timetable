import React, { useState, useEffect } from 'react';
import { Calendar, Users, Building, BookOpen, Filter, Download, Edit, Save, X } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { Session } from '../../types';

const TimetableView: React.FC = () => {
  const dispatch = useAppDispatch();
  const { sessions, conflicts } = useAppSelector(state => state.timetable);
  const { subjects, batches, faculty, rooms, timeSlots } = useAppSelector(state => state.data);
  
  const [viewType, setViewType] = useState<'batch' | 'faculty' | 'room'>('batch');
  const [selectedEntity, setSelectedEntity] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlotsByDay = timeSlots.reduce((acc, slot) => {
    if (slot.day < 5) { // Only weekdays
      if (!acc[slot.day]) acc[slot.day] = [];
      acc[slot.day].push(slot);
    }
    return acc;
  }, {} as Record<number, typeof timeSlots>);

  // Sort time slots by start time for each day
  Object.keys(timeSlotsByDay).forEach(day => {
    timeSlotsByDay[parseInt(day)].sort((a, b) => a.startTime.localeCompare(b.startTime));
  });

  const getEntityOptions = () => {
    switch (viewType) {
      case 'batch':
        return batches.map(b => ({ id: b.id, name: b.name }));
      case 'faculty':
        return faculty.map(f => ({ id: f.id, name: f.name }));
      case 'room':
        return rooms.map(r => ({ id: r.id, name: r.name }));
      default:
        return [];
    }
  };

  const getFilteredSessions = () => {
    if (!selectedEntity) return sessions;
    
    return sessions.filter(session => {
      switch (viewType) {
        case 'batch':
          return session.batchId === selectedEntity;
        case 'faculty':
          return session.facultyId === selectedEntity;
        case 'room':
          return session.roomId === selectedEntity;
        default:
          return true;
      }
    });
  };

  const getSessionForSlot = (day: number, timeSlotId: string) => {
    const filteredSessions = getFilteredSessions();
    return filteredSessions.find(session => session.timeSlotId === timeSlotId);
  };

  const getSessionDetails = (session: Session) => {
    const subject = subjects.find(s => s.id === session.subjectId);
    const batch = batches.find(b => b.id === session.batchId);
    const facultyMember = faculty.find(f => f.id === session.facultyId);
    const room = rooms.find(r => r.id === session.roomId);

    return {
      subject: subject?.name || 'Unknown Subject',
      subjectCode: subject?.code || '',
      batch: batch?.name || 'Unknown Batch',
      faculty: facultyMember?.name || 'Unknown Faculty',
      room: room?.name || 'Unknown Room',
      type: subject?.type || 'theory'
    };
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'theory': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'lab': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'elective': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const hasConflict = (session: Session) => {
    return conflicts.some(conflict => conflict.sessionIds.includes(session.id));
  };

  const entityOptions = getEntityOptions();

  useEffect(() => {
    if (entityOptions.length > 0 && !selectedEntity) {
      setSelectedEntity(entityOptions[0].id);
    }
  }, [viewType, entityOptions.length]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <Calendar className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Weekly Timetable</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <select
              value={viewType}
              onChange={(e) => setViewType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="batch">By Batch</option>
              <option value="faculty">By Faculty</option>
              <option value="room">By Room</option>
            </select>
          </div>
          
          <select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-w-[200px]"
          >
            {entityOptions.map(option => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
          
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center space-x-2 text-sm"
          >
            {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
            <span>{isEditing ? 'Stop Editing' : 'Edit'}</span>
          </button>
          
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 text-sm">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-600">{getFilteredSessions().length}</p>
              <p className="text-sm text-gray-600">Total Sessions</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-600">{faculty.length}</p>
              <p className="text-sm text-gray-600">Faculty</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <Building className="w-5 h-5 text-orange-600" />
            <div>
              <p className="text-2xl font-bold text-orange-600">{rooms.length}</p>
              <p className="text-sm text-gray-600">Rooms</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-red-600">{conflicts.length}</p>
              <p className="text-sm text-gray-600">Conflicts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Timetable Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Weekly Schedule - {entityOptions.find(e => e.id === selectedEntity)?.name}
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header */}
            <div className="grid grid-cols-6 bg-gray-50 border-b border-gray-200">
              <div className="p-3 font-medium text-gray-700 border-r border-gray-200">Time</div>
              {dayNames.map((day, index) => (
                <div key={index} className="p-3 font-medium text-gray-700 text-center border-r border-gray-200 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Time Slots */}
            {timeSlotsByDay[0]?.map((timeSlot, slotIndex) => (
              <div key={timeSlot.id} className="grid grid-cols-6 border-b border-gray-200 min-h-[80px]">
                <div className="p-3 bg-gray-50 border-r border-gray-200 flex flex-col justify-center">
                  <div className="text-sm font-medium text-gray-800">
                    {timeSlot.startTime} - {timeSlot.endTime}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">{timeSlot.shift}</div>
                </div>
                
                {dayNames.map((day, dayIndex) => {
                  const dayTimeSlot = timeSlotsByDay[dayIndex]?.[slotIndex];
                  const session = dayTimeSlot ? getSessionForSlot(dayIndex, dayTimeSlot.id) : null;
                  
                  return (
                    <div key={dayIndex} className="p-2 border-r border-gray-200 last:border-r-0 min-h-[80px]">
                      {session ? (
                        <div className={`
                          h-full rounded-lg border-2 p-2 cursor-pointer transition-all hover:shadow-md
                          ${getTypeColor(getSessionDetails(session).type)}
                          ${hasConflict(session) ? 'ring-2 ring-red-500' : ''}
                          ${isEditing ? 'hover:scale-105' : ''}
                        `}>
                          <div className="text-xs font-semibold truncate">
                            {getSessionDetails(session).subjectCode}
                          </div>
                          <div className="text-xs truncate mt-1">
                            {getSessionDetails(session).subject}
                          </div>
                          {viewType !== 'faculty' && (
                            <div className="text-xs text-gray-600 truncate mt-1">
                              {getSessionDetails(session).faculty}
                            </div>
                          )}
                          {viewType !== 'room' && (
                            <div className="text-xs text-gray-600 truncate">
                              {getSessionDetails(session).room}
                            </div>
                          )}
                          {viewType !== 'batch' && (
                            <div className="text-xs text-gray-600 truncate">
                              {getSessionDetails(session).batch}
                            </div>
                          )}
                          {hasConflict(session) && (
                            <div className="text-xs text-red-600 font-medium mt-1">
                              Conflict!
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className={`
                          h-full rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center
                          ${isEditing ? 'hover:border-blue-400 hover:bg-blue-50 cursor-pointer' : ''}
                        `}>
                          {isEditing && (
                            <span className="text-xs text-gray-400">Drop here</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h4 className="text-sm font-medium text-gray-800 mb-3">Legend</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-blue-100 border border-blue-200"></div>
            <span className="text-sm text-gray-600">Theory</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-orange-100 border border-orange-200"></div>
            <span className="text-sm text-gray-600">Lab</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-green-100 border border-green-200"></div>
            <span className="text-sm text-gray-600">Elective</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded border-2 border-red-500"></div>
            <span className="text-sm text-gray-600">Conflict</span>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Edit className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-800">Editing Mode Active</h4>
              <p className="text-sm text-blue-700 mt-1">
                Drag and drop sessions to reschedule them. The system will validate all constraints automatically.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableView;
