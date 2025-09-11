import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Building, Users, Monitor } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { Room } from '../../types';
import { setRooms } from '../../store/slices/dataSlice';
import { addNotification } from '../../store/slices/uiSlice';

const RoomManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { rooms, departments } = useAppSelector(state => state.data);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState<Partial<Room>>({
    name: '',
    type: 'classroom',
    capacity: 50,
    equipment: [],
    departmentId: '',
  });

  const equipmentOptions = [
    'projector',
    'whiteboard',
    'speakers',
    'computers',
    'software',
    'lab_equipment',
    'air_conditioning',
    'microphone',
    'smart_board',
    'wifi'
  ];

  const handleAdd = () => {
    setFormData({
      name: '',
      type: 'classroom',
      capacity: 50,
      equipment: [],
      departmentId: '',
    });
    setIsAddModalOpen(true);
  };

  const handleEdit = (room: Room) => {
    setFormData(room);
    setEditingRoom(room);
    setIsAddModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.capacity) {
      dispatch(addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all required fields',
      }));
      return;
    }

    const newRoom: Room = {
      id: editingRoom?.id || Date.now().toString(),
      name: formData.name!,
      type: formData.type as 'classroom' | 'lab' | 'auditorium',
      capacity: formData.capacity!,
      equipment: formData.equipment || [],
      departmentId: formData.departmentId,
    };

    let updatedRooms;
    if (editingRoom) {
      updatedRooms = rooms.map(r => r.id === editingRoom.id ? newRoom : r);
    } else {
      updatedRooms = [...rooms, newRoom];
    }

    dispatch(setRooms(updatedRooms));
    dispatch(addNotification({
      type: 'success',
      title: 'Room Updated',
      message: `Room ${newRoom.name} has been ${editingRoom ? 'updated' : 'added'} successfully`,
    }));

    setIsAddModalOpen(false);
    setEditingRoom(null);
  };

  const handleDelete = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    const updatedRooms = rooms.filter(r => r.id !== roomId);
    
    dispatch(setRooms(updatedRooms));
    dispatch(addNotification({
      type: 'success',
      title: 'Room Deleted',
      message: `Room ${room?.name} has been removed successfully`,
    }));
  };

  const getDepartmentName = (departmentId?: string) => {
    if (!departmentId) return 'General';
    return departments.find(d => d.id === departmentId)?.name || 'Unknown';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'classroom': return 'bg-blue-100 text-blue-800';
      case 'lab': return 'bg-orange-100 text-orange-800';
      case 'auditorium': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEquipmentChange = (equipment: string, checked: boolean) => {
    const currentEquipment = formData.equipment || [];
    if (checked) {
      setFormData({ ...formData, equipment: [...currentEquipment, equipment] });
    } else {
      setFormData({ ...formData, equipment: currentEquipment.filter(e => e !== equipment) });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Building className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Room Management</h2>
        </div>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Room</span>
        </button>
      </div>

      {/* Room List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rooms.map((room) => (
                <tr key={room.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{room.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(room.type)}`}>
                      {room.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>{room.capacity}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {getDepartmentName(room.departmentId)}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Monitor className="w-4 h-4" />
                      <span>{room.equipment.length} items</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {room.equipment.slice(0, 3).join(', ')}
                      {room.equipment.length > 3 && '...'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(room)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(room.id)}
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
                {editingRoom ? 'Edit Room' : 'Add Room'}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Room Name *</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Room 101"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
                  <select
                    value={formData.type || 'classroom'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="classroom">Classroom</option>
                    <option value="lab">Lab</option>
                    <option value="auditorium">Auditorium</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Capacity *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity || ''}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Number of seats"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <select
                    value={formData.departmentId || ''}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">General (All Departments)</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Equipment & Facilities</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {equipmentOptions.map(equipment => (
                    <label key={equipment} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={(formData.equipment || []).includes(equipment)}
                        onChange={(e) => handleEquipmentChange(equipment, e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 capitalize">
                        {equipment.replace('_', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
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

export default RoomManagement;