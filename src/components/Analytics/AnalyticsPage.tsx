import React from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Users, 
  Building, 
  AlertTriangle, 
  CheckCircle, 
  BookOpen,
  BarChart3
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { useAppSelector } from '../../hooks/redux';

const AnalyticsPage: React.FC = () => {
  const { faculty, rooms, subjects, batches } = useAppSelector(state => state.data);
  const { sessions, conflicts } = useAppSelector(state => state.timetable);

  // Faculty utilization data
  const facultyUtilizationData = faculty.map(f => {
    const facultySessions = sessions.filter(s => s.facultyId === f.id);
    const totalHours = facultySessions.reduce((sum, session) => {
      const subject = subjects.find(s => s.id === session.subjectId);
      return sum + (subject?.sessionDuration || 60) / 60;
    }, 0);
    
    return {
      name: f.name,
      hours: totalHours,
      utilization: Math.min(100, (totalHours / f.maxClassesPerWeek) * 100),
      maxHours: f.maxClassesPerWeek,
    };
  });

  // Room utilization data
  const roomUtilizationData = rooms.map(room => {
    const roomSessions = sessions.filter(s => s.roomId === room.id);
    return {
      name: room.name,
      sessions: roomSessions.length,
      utilization: Math.min(100, (roomSessions.length / 40) * 100), // Assuming 40 slots per week
      type: room.type,
    };
  });

  // Weekly distribution
  const weeklyData = [
    { day: 'Mon', sessions: 45, conflicts: 2 },
    { day: 'Tue', sessions: 42, conflicts: 1 },
    { day: 'Wed', sessions: 38, conflicts: 3 },
    { day: 'Thu', sessions: 41, conflicts: 1 },
    { day: 'Fri', sessions: 39, conflicts: 0 },
  ];

  // Subject type distribution
  const subjectTypeData = [
    { name: 'Theory', value: subjects.filter(s => s.type === 'theory').length, color: '#3b82f6' },
    { name: 'Lab', value: subjects.filter(s => s.type === 'lab').length, color: '#f59e0b' },
    { name: 'Elective', value: subjects.filter(s => s.type === 'elective').length, color: '#10b981' },
  ];

  // Department performance radar
  const departmentData = [
    { subject: 'Resource Utilization', A: 80, B: 85, C: 75 },
    { subject: 'Conflict Resolution', A: 90, B: 78, C: 88 },
    { subject: 'Student Satisfaction', A: 85, B: 92, C: 80 },
    { subject: 'Schedule Efficiency', A: 88, B: 85, C: 90 },
    { subject: 'Faculty Workload', A: 75, B: 88, C: 82 },
  ];

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 75) return 'text-yellow-600';
    if (utilization >= 50) return 'text-green-600';
    return 'text-blue-600';
  };

  const topIssues = [
    { issue: 'Faculty overallocation in peak hours', severity: 'high', count: 3, icon: AlertTriangle },
    { issue: 'Lab scheduling conflicts', severity: 'medium', count: 5, icon: AlertTriangle },
    { issue: 'Room capacity mismatches', severity: 'low', count: 2, icon: CheckCircle },
    { issue: 'Consecutive class gaps', severity: 'medium', count: 8, icon: AlertTriangle },
  ];

  const keyMetrics = [
    {
      title: 'Total Sessions',
      value: sessions.length,
      icon: Calendar,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Avg Faculty Utilization',
      value: `${Math.round(facultyUtilizationData.reduce((sum, f) => sum + f.utilization, 0) / faculty.length)}%`,
      icon: Users,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Avg Room Utilization',
      value: `${Math.round(roomUtilizationData.reduce((sum, r) => sum + r.utilization, 0) / rooms.length)}%`,
      icon: Building,
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    },
    {
      title: 'Active Conflicts',
      value: conflicts.length,
      icon: AlertTriangle,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <BarChart3 className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {keyMetrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-3xl font-bold ${metric.textColor}`}>{metric.value}</p>
                <p className="text-gray-600 text-sm mt-1">{metric.title}</p>
              </div>
              <div className={`p-3 rounded-lg ${metric.color}`}>
                <metric.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Faculty Utilization */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Faculty Utilization</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={facultyUtilizationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value, name) => [`${value}%`, 'Utilization']} />
                <Bar dataKey="utilization" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Subject Distribution</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subjectTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {subjectTypeData.map((entry, index) => (
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
        {/* Weekly Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Weekly Distribution</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sessions" stroke="#3b82f6" strokeWidth={3} name="Sessions" />
                <Line type="monotone" dataKey="conflicts" stroke="#ef4444" strokeWidth={3} name="Conflicts" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Department Performance</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={departmentData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="CSE" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                <Radar name="ECE" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                <Radar name="ME" dataKey="C" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Issues */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Top Issues</h3>
          </div>
          <div className="space-y-4">
            {topIssues.map((issue, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                <div className={`p-1 rounded-full ${
                  issue.severity === 'high' ? 'bg-red-100' :
                  issue.severity === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                }`}>
                  <issue.icon className={`w-4 h-4 ${
                    issue.severity === 'high' ? 'text-red-600' :
                    issue.severity === 'medium' ? 'text-yellow-600' : 'text-green-600'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{issue.issue}</p>
                  <p className="text-xs text-gray-500">{issue.count} occurrences</p>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  issue.severity === 'high' ? 'bg-red-100 text-red-800' :
                  issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                  {issue.severity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Resource Utilization Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Building className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Room Utilization</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-700">Room</th>
                  <th className="text-left py-2 font-medium text-gray-700">Type</th>
                  <th className="text-right py-2 font-medium text-gray-700">Sessions</th>
                  <th className="text-right py-2 font-medium text-gray-700">Utilization</th>
                </tr>
              </thead>
              <tbody>
                {roomUtilizationData.map((room, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-2 font-medium text-gray-800">{room.name}</td>
                    <td className="py-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {room.type}
                      </span>
                    </td>
                    <td className="py-2 text-right">{room.sessions}</td>
                    <td className="py-2 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <span className={`font-medium ${getUtilizationColor(room.utilization)}`}>
                          {Math.round(room.utilization)}%
                        </span>
                        <div className={`w-2 h-2 rounded-full ${
                          room.utilization >= 90 ? 'bg-red-500' :
                          room.utilization >= 75 ? 'bg-yellow-500' :
                          room.utilization >= 50 ? 'bg-green-500' : 'bg-blue-500'
                        }`} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;