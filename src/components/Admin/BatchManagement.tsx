import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Users, BookOpen, GraduationCap } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { Batch } from '../../types';
import { setBatches } from '../../store/slices/dataSlice';
import { addNotification } from '../../store/slices/uiSlice';

const BatchManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { batches, courses, subjects } = useAppSelector(state => state.data);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [formData, setFormData] = useState<Partial<Batch>>({
    name: '',
    courseId: '',
    semester: 1,
    studentCount: 0,
    subjects: [],
  });

  const handleAdd = () => {
    setFormData({
      name: '',
      courseId: '',
      semester: 1,
      studentCount: 0,
      subjects: [],
    });
    setIsAddModalOpen(true);
  };

  const handleEdit = (batch: Batch) => {
    setFormData(batch);
    setEditingBatch(batch);
    setIsAddModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.courseId || !formData.studentCount) {
      dispatch(addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all required fields',
      }));
      return;
    }

    const newBatch: Batch = {
      id: editingBatch?.id || Date.now().toString(),
      name: formData.name!,
      courseId: formData.courseId!,
      semester: formData.semester || 1,
      studentCount: formData.studentCount!,
      subjects: formData.subjects || [],
    };

    let updatedBatches;
    if (editingBatch) {
      updatedBatches = batches.map(b => b.id === editingBatch.id ? newBatch : b);
    } else {
      updatedBatches = [...batches, newBatch];
    }

    dispatch(setBatches(updatedBatches));
    dispatch(addNotification({
      type: 'success',
      title: 'Batch Updated',
      message: `Batch ${newBatch.name} has been ${editingBatch ? 'updated' : 'added'} successfully`,
    }));

    setIsAddModalOpen(false);
    setEditingBatch(null);
  };

  const handleDelete = (batchId: string) => {
    const batch = batches.find(b => b.id === batchId);
    const updatedBatches = batches.filter(b => b.id !== batchId);
    
    dispatch(setBatches(updatedBatches));
    dispatch(addNotification({
      type: 'success',
      title: 'Batch Deleted',
      message: `Batch ${batch?.name} has been removed successfully`,
    }));
  };

  const getCourseName = (courseId: string) => {
    return courses.find(c => c.id === courseId)?.name || 'Unknown';
  };

  const getSubjectNames = (subjectIds: string[]) => {
    return subjectIds.map(id => subjects.find(s => s.id === id)?.name).filter(Boolean).join(', ');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <GraduationCap className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Batch Management</h2>
        </div>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Batch</span>
        </button>
      </div>

      {/* Batch List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {batches.map((batch) => (
                <tr key={batch.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{batch.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {getCourseName(batch.courseId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Semester {batch.semester}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>{batch.studentCount}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4" />
                      <span>{batch.subjects.length} subjects</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(batch)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(batch.id)}
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
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingBatch ? 'Edit Batch' : 'Add Batch'}
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Batch Name *</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., CSE 3rd Sem A"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course *</label>
                  <select
                    value={formData.courseId || ''}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={formData.semester || 1}
                    onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student Count *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.studentCount || ''}
                    onChange={(e) => setFormData({ ...formData, studentCount: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Number of students"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Enrolled Subjects</label>
                <select
                  multiple
                  value={formData.subjects || []}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    subjects: Array.from(e.target.selectedOptions, option => option.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
                >
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} ({subject.type})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple subjects</p>
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

export default BatchManagement;