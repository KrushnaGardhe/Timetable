import React from 'react';
import { 
  Calendar, 
  Users, 
  Building, 
  BookOpen, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  BarChart3
} from 'lucide-react';
import { useAppSelector } from '../../hooks/redux';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar
} from 'recharts';

const AdminDashboard: React.FC = () => {
  const { departments, faculty, rooms, batches } = useAppSelector(state => state.data);
  const { timetables, conflicts, analytics } = useAppSelector(state => state.timetable);

  const stats = [
    { 
      title: 'Active Timetables', 
      value: timetables.filter(t => t.status === 'published').length, 
      icon: Calendar, 
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    { 
      title: 'Total Faculty', 
      value: faculty.length, 
      icon: Users, 
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    { 
      title: 'Total Batches', 
      value: batches.length, 
      icon: BookOpen, 
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    },
    { 
      title: 'Available Rooms', 
      value: rooms.length, 
      icon: Building, 
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
  ];

  const utilizationData = [
    { name: 'Mon', faculty: 85, rooms: 78 },
    { name: 'Tue', faculty: 92, rooms: 83 },
    { name: 'Wed', faculty: 78, rooms: 71 },
    { name: 'Thu', faculty: 88, rooms: 79 },
    { name: 'Fri', faculty: 95, rooms: 87 },
  ];

  const departmentData = departments.map((dept, index) => ({
    name: dept.code,
    value: Math.floor(Math.random() * 30) + 10,
    color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][index % 4],
  }));

  const recentActivities = [
    { text: 'New timetable generated for CSE Department', time: '2 hours ago', type: 'success', icon: CheckCircle },
    { text: 'Faculty availability updated for Dr. Smith', time: '4 hours ago', type: 'info', icon: Clock },
    { text: '3 conflicts resolved in ME timetable', time: '6 hours ago', type: 'warning', icon: AlertTriangle },
    { text: 'Room allocation optimized', time: '1 day ago', type: 'success', icon: CheckCircle },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <BarChart3 className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                <p className="text-gray-600 text-sm mt-1">{stat.title}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Utilization Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Weekly Utilization</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={utilizationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="faculty" stroke="#3b82f6" strokeWidth={3} name="Faculty %" />
                <Line type="monotone" dataKey="rooms" stroke="#10b981" strokeWidth={3} name="Rooms %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Building className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Department Distribution</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">System Health</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Timetable Generation Success Rate</span>
                <span className="font-medium">95%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Conflict Resolution Rate</span>
                <span className="font-medium">88%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Resource Utilization</span>
                <span className="font-medium">82%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '82%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Recent Activities</h3>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                <div className={`p-1 rounded-full ${
                  activity.type === 'success' ? 'bg-green-100' :
                  activity.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                }`}>
                  <activity.icon className={`w-4 h-4 ${
                    activity.type === 'success' ? 'text-green-600' :
                    activity.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{activity.text}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  activity.type === 'success' ? 'bg-green-100 text-green-800' :
                  activity.type === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {activity.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;