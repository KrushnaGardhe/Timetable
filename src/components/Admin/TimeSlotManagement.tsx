import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Clock, Calendar } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { TimeSlot } from '../../types';
import { setTimeSlots } from '../../store/slices/dataSlice';
import { addNotification } from '../../store/slices/uiSlice';

const TimeSlotManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { timeSlots } = useAppSelector(state => state.data);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTimeSlot, setEditingTimeSlot] = useState<TimeSlot | null>(null);
  const [formData, setFormData] = useState<Partial<TimeSlot>>({
    day: 0,
    startTime: '09:00',
    endTime: '10:00',
    shift: 'morning',
  });

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const shifts = ['morning', 'afternoon', 'evening'] as const;

  const handleAdd = () => {
    setFormData({
      day: 0,
      startTime: '09:00',
      endTime: '10:00',
      shift: 'morning',
    });
    setIsAddModalOpen(true);
  };

  const handleEdit = (timeSlot: TimeSlot) => {
    setFormData(timeSlot);
    setEditingTimeSlot(timeSlot);
    setIsAddModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.startTime || !formData.endTime) {
      dispatch(addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all required fields',
      }));
      return;
    }

    // Validate time order
    if (formData.startTime! >= formData.endTime!) {
      dispatch(addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'End time must be after start time',
      }));
      return;
    }

    const newTimeSlot: TimeSlot = {
      id: editingTimeSlot?.id || Date.now().toString(),
      day: formData.day || 0,
      startTime: formData.startTime!,
      endTime: formData.endTime!,
      shift: formData.shift as 'morning' | 'afternoon' | 'evening',
    };

    let updatedTimeSlots;
    if (editingTimeSlot) {
      updatedTimeSlots = timeSlots.map(t => t.id === editingTimeSlot.id ? newTimeSlot : t);
    } else {
      updatedTimeSlots = [...timeSlots, newTimeSlot];
    }

    // Sort by day and start time
    updatedTimeSlots.sort((a, b) => {
      if (a.day !== b.day) return a.day - b.day;
      return a.startTime.localeCompare(b.startTime);
    });

    dispatch(setTimeSlots(updatedTimeSlots));
    dispatch(addNotification({
      type: 'success',
      title: 'Time Slot Updated',
      message: `Time slot has been ${editingTimeSlot ? 'updated' : 'added'} successfully`,
    }));

    setIsAddModalOpen(false);
    setEditingTimeSlot(null);
  };

  const handleDelete = (timeSlotId: string) => {
    const updatedTimeSlots = timeSlots.filter(t => t.id !== timeSlotId);
    
    dispatch(setTimeSlots(updatedTimeSlots));
    dispatch(addNotification({
      type: 'success',
      title: 'Time Slot Deleted',
      message: 'Time slot has been removed successfully',
    }));
  };

  const getShiftColor = (shift: string) => {
    switch (shift) {
      case 'morning': return 'bg-blue-100 text-blue-800';
      case 'afternoon': return 'bg-orange-100 text-orange-800';
      case 'evening': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const generateDefaultTimeSlots = () => {
    const defaultSlots: TimeSlot[] = [];
    const morningSlots = [
      { start: '09:00', end: '10:00' },
      { start: '10:00', end: '11:00' },
      { start: '11:15', end: '12:15' },
      { start: '12:15', end: '13:15' },
    ];
    const afternoonSlots = [
      { start: '14:00', end: '15:00' },
      { start: '15:00', end: '16:00' },
      { start: '16:15', end: '17:15' },
      { start: '17:15', end: '18:15' },
    ];

    // Generate for Monday to Friday
    for (let day = 0; day < 5; day++) {
      morningSlots.forEach((slot, index) => {
        defaultSlots.push({
          id: `${day * 8 + index + 1}`,
          day,
          startTime: slot.start,
          endTime: slot.end,
          shift: 'morning',
        });
      });
      
      afternoonSlots.forEach((slot, index) => {
        defaultSlots.push({
          id: `${day * 8 + index + 5}`,
          day,
          startTime: slot.start,
          endTime: slot.end,
          shift: 'afternoon',
        });
      });
    }

    dispatch(setTimeSlots(defaultSlots));
    dispatch(addNotification({
      type: 'success',
      title: 'Default Time Slots Generated',
      message: 'Standard time slots for Monday-Friday have been created',
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Clock className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Time Slot Management</h2>
        </div>
        <div className="flex items-center space-x-3">
          {timeSlots.length === 0 && (
            <button
              onClick={generateDefaultTimeSlots}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Generate Default Slots</span>
            </button>
          )}
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Time Slot</span>
          </button>
        </div>
      </div>

      {/* Time Slot List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {timeSlots.map((timeSlot) => {
                const duration = new Date(`1970-01-01T${timeSlot.endTime}:00`) - new Date(`1970-01-01T${timeSlot.startTime}:00`);
                const durationMinutes = duration / (1000 * 60);
                
                return (
                  <tr key={timeSlot.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{dayNames[timeSlot.day]}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{timeSlot.startTime} - {timeSlot.endTime}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {durationMinutes} minutes
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getShiftColor(timeSlot.shift)}`}>
                        {timeSlot.shift}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(timeSlot)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(timeSlot.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {timeSlots.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No time slots configured</p>
            <button
              onClick={generateDefaultTimeSlots}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Generate Default Time Slots
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingTimeSlot ? 'Edit Time Slot' : 'Add Time Slot'}
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Day</label>
                <select
                  value={formData.day || 0}
                  onChange={(e) => setFormData({ ...formData, day: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {dayNames.map((day, index) => (
                    <option key={index} value={index}>{day}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
                  <input
                    type="time"
                    value={formData.startTime || ''}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
                  <input
                    type="time"
                    value={formData.endTime || ''}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shift</label>
                <select
                  value={formData.shift || 'morning'}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {shifts.map(shift => (
                    <option key={shift} value={shift}>
                      {shift.charAt(0).toUpperCase() + shift.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 p-6 border-t">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
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

export default TimeSlotManagement;
