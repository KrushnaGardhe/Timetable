import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Users, Clock, Calendar } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { Faculty } from '../../types';
import { setFaculty } from '../../store/slices/dataSlice';
import { addNotification } from '../../store/slices/uiSlice';

const FacultyManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { faculty, subjects, departments } = useAppSelector(state => state.data);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [formData, setFormData] = useState<Partial<Faculty>>({
    name: '',
    email: '',
    password: '',
    departmentId: '',
    subjects: [],
    maxClassesPerDay: 6,
    maxClassesPerWeek: 24,
    availability: Array(7).fill(null).map(() => Array(10).fill(true)),
    averageLeaves: 2,
  });

  const handleAdd = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      departmentId: '',
      subjects: [],
      maxClassesPerDay: 6,
      maxClassesPerWeek: 24,
      availability: Array(7).fill(null).map(() => Array(10).fill(true)),
      averageLeaves: 2,
    });
    setIsAddModalOpen(true);
  };

  const handleEdit = (facultyMember: Faculty) => {
    setFormData(facultyMember);
    setEditingFaculty(facultyMember);
    setIsAddModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.email || !formData.departmentId || (!editingFaculty && !formData.password)) {
      dispatch(addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all required fields including password for new faculty',
      }));
      return;
    }

    const newFaculty: Faculty = {
      id: editingFaculty?.id || Date.now().toString(),
      name: formData.name!,
      email: formData.email!,
      password: formData.password || editingFaculty?.password || '',
      departmentId: formData.departmentId!,
      subjects: formData.subjects || [],
      maxClassesPerDay: formData.maxClassesPerDay || 6,
      maxClassesPerWeek: formData.maxClassesPerWeek || 24,
      availability: formData.availability || Array(7).fill(null).map(() => Array(10).fill(true)),
      averageLeaves: formData.averageLeaves || 2,
    };

    let updatedFaculty;
    if (editingFaculty) {
      updatedFaculty = faculty.map(f => f.id === editingFaculty.id ? newFaculty : f);
    } else {
      updatedFaculty = [...faculty, newFaculty];
    }

    dispatch(setFaculty(updatedFaculty));
    dispatch(addNotification({
      type: 'success',
      title: 'Faculty Updated',
      message: `Faculty ${newFaculty.name} has been ${editingFaculty ? 'updated' : 'added'} successfully`,
    }));

    setIsAddModalOpen(false);
    setEditingFaculty(null);
  };

  const handleDelete = (facultyId: string) => {
    const facultyMember = faculty.find(f => f.id === facultyId);
    const updatedFaculty = faculty.filter(f => f.id !== facultyId);
    
    dispatch(setFaculty(updatedFaculty));
    dispatch(addNotification({
      type: 'success',
      title: 'Faculty Deleted',
      message: `Faculty ${facultyMember?.name} has been removed successfully`,
    }));
  };

  const handleAvailabilityChange = (day: number, slot: number, available: boolean) => {
    const newAvailability = [...(formData.availability || [])];
    newAvailability[day][slot] = available;
    setFormData({ ...formData, availability: newAvailability });
  };

  const getDepartmentName = (departmentId: string) => {
    return departments.find(d => d.id === departmentId)?.name || 'Unknown';
  };

  const getSubjectNames = (subjectIds: string[]) => {
    return subjectIds.map(id => subjects.find(s => s.id === id)?.name).filter(Boolean).join(', ');
  };

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timeSlots = ['9:00', '10:00', '11:00', '12:00', '1:00', '2:00', '3:00', '4:00', '5:00', '6:00'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Faculty Management</h2>
        </div>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Faculty</span>
        </button>
      </div>

      {/* Faculty List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Classes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {faculty.map((facultyMember) => (
                <tr key={facultyMember.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{facultyMember.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {facultyMember.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {getDepartmentName(facultyMember.departmentId)}
                  </td>
                  <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                    {getSubjectNames(facultyMember.subjects)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{facultyMember.maxClassesPerDay}/day</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar className="w-4 h-4" />
                      <span>{facultyMember.maxClassesPerWeek}/week</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(facultyMember)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(facultyMember.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingFaculty ? 'Edit Faculty' : 'Add Faculty'}
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter faculty name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password {!editingFaculty && '*'}
                  </label>
                  <input
                    type="password"
                    value={formData.password || ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={editingFaculty ? "Leave blank to keep current password" : "Enter password"}
                  />
                  {editingFaculty && (
                    <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                  <select
                    value={formData.departmentId || ''}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
                  <select
                    multiple
                    value={formData.subjects || []}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      subjects: Array.from(e.target.selectedOptions, option => option.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                  >
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Classes per Day</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.maxClassesPerDay || 6}
                    onChange={(e) => setFormData({ ...formData, maxClassesPerDay: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Classes per Week</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.maxClassesPerWeek || 24}
                    onChange={(e) => setFormData({ ...formData, maxClassesPerWeek: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Average Leaves per Month</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.averageLeaves || 2}
                    onChange={(e) => setFormData({ ...formData, averageLeaves: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Availability Matrix */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Weekly Availability</label>
                <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left p-2 font-medium text-gray-700">Time</th>
                        {dayNames.map(day => (
                          <th key={day} className="text-center p-2 font-medium text-gray-700">{day}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {timeSlots.map((time, slotIndex) => (
                        <tr key={slotIndex}>
                          <td className="p-2 font-medium text-gray-600">{time}</td>
                          {dayNames.map((day, dayIndex) => (
                            <td key={dayIndex} className="p-2 text-center">
                              <input
                                type="checkbox"
                                checked={formData.availability?.[dayIndex]?.[slotIndex] || false}
                                onChange={(e) => handleAvailabilityChange(dayIndex, slotIndex, e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 mt-2">Check boxes to mark available time slots</p>
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

export default FacultyManagement;