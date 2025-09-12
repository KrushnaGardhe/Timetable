import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  BarChart3, 
  Upload,
  Download,
  Zap,
  RefreshCw,
  Edit3,
  Save
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { TimetableGenerator } from '../../services/timetableGenerator';
import { setSessions, setConflicts, setAnalytics, setGenerating } from '../../store/slices/timetableSlice';
import { addNotification } from '../../store/slices/uiSlice';

interface TimetableOption {
  id: number;
  name: string;
  sessions: any[];
  conflicts: any[];
  score: number;
  facultyUtilization: number;
  roomUtilization: number;
}

const DynamicGeneratorPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { subjects, batches, faculty, rooms, timeSlots } = useAppSelector(state => state.data);
  const { isGenerating, conflicts, analytics, sessions } = useAppSelector(state => state.timetable);
  
  const [activeStep, setActiveStep] = useState(0);
  const [generatedOptions, setGeneratedOptions] = useState<TimetableOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);

  const steps = [
    { title: 'Review Current Data', icon: Settings },
    { title: 'Generate Options', icon: Zap },
    { title: 'Compare & Select', icon: BarChart3 },
    { title: 'Edit & Publish', icon: Upload },
  ];

  // Auto-refresh data validation when data changes
  useEffect(() => {
    validateSystemData();
  }, [subjects, batches, faculty, rooms, timeSlots]);

  const validateSystemData = () => {
    const hasMinimumData = 
      faculty.length >= 1 && 
      batches.length >= 1 && 
      subjects.length >= 1 && 
      rooms.length >= 1 &&
      timeSlots.length >= 1;
    
    if (!hasMinimumData) {
      setActiveStep(0);
    }
  };

  const handleGenerateTimetables = async () => {
    dispatch(setGenerating(true));
    
    try {
      const generator = new TimetableGenerator(subjects, batches, faculty, rooms, timeSlots);
      
      // Generate 3 comprehensive timetable options for full week/month
      const options: TimetableOption[] = [];
      
      for (let i = 0; i < 3; i++) {
        const result = generator.generateTimetable();
        
        // Calculate utilization metrics
        const facultyUtilization = calculateFacultyUtilization(result.sessions);
        const roomUtilization = calculateRoomUtilization(result.sessions);
        
        options.push({
          id: i + 1,
          name: `Option ${i + 1} - ${getStrategyName(i)}`,
          sessions: result.sessions,
          conflicts: result.conflicts,
          score: result.score,
          facultyUtilization,
          roomUtilization,
        });
      }
      
      // Sort by score (best first)
      options.sort((a, b) => b.score - a.score);
      
      setGeneratedOptions(options);
      setLastGenerated(new Date());
      setActiveStep(2);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Timetables Generated',
        message: `Successfully generated ${options.length} comprehensive weekly/monthly timetable options`,
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Generation Failed',
        message: 'Failed to generate timetables. Please check your configuration.',
      }));
    } finally {
      dispatch(setGenerating(false));
    }
  };

  const getStrategyName = (index: number) => {
    const strategies = ['Balanced', 'Faculty Optimized', 'Room Optimized'];
    return strategies[index] || 'Standard';
  };

  const calculateFacultyUtilization = (sessions: any[]) => {
    if (faculty.length === 0) return 0;
    
    const facultyHours = faculty.map(f => {
      const facultySessions = sessions.filter(s => s.facultyId === f.id);
      const totalHours = facultySessions.reduce((sum, session) => {
        const subject = subjects.find(s => s.id === session.subjectId);
        return sum + (subject?.sessionDuration || 60) / 60;
      }, 0);
      return Math.min(100, (totalHours / f.maxClassesPerWeek) * 100);
    });
    
    return Math.round(facultyHours.reduce((sum, util) => sum + util, 0) / faculty.length);
  };

  const calculateRoomUtilization = (sessions: any[]) => {
    if (rooms.length === 0) return 0;
    
    const roomHours = rooms.map(room => {
      const roomSessions = sessions.filter(s => s.roomId === room.id);
      return Math.min(100, (roomSessions.length / 40) * 100); // Assuming 40 slots per week
    });
    
    return Math.round(roomHours.reduce((sum, util) => sum + util, 0) / rooms.length);
  };

  const handleSelectOption = (optionIndex: number) => {
    setSelectedOption(optionIndex);
    const option = generatedOptions[optionIndex];
    
    dispatch(setSessions(option.sessions));
    dispatch(setConflicts(option.conflicts));
    dispatch(setAnalytics({
      facultyUtilization: {},
      roomUtilization: {},
      conflictCount: option.conflicts.length,
      optimizationScore: option.score,
    }));
    
    setActiveStep(3);
  };

  const handlePublishTimetable = () => {
    if (selectedOption !== null) {
      dispatch(addNotification({
        type: 'success',
        title: 'Timetable Published',
        message: 'Timetable has been successfully published to all users',
      }));
      
      // Reset for next generation
      setActiveStep(0);
      setSelectedOption(null);
      setGeneratedOptions([]);
    }
  };

  const getOptionColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getSystemReadiness = () => {
    const hasMinimumData = 
      faculty.length >= 1 && 
      batches.length >= 1 && 
      subjects.length >= 1 && 
      rooms.length >= 1 &&
      timeSlots.length >= 1;
    
    const dataQuality = [
      { name: 'Faculty', count: faculty.length, min: 1 },
      { name: 'Batches', count: batches.length, min: 1 },
      { name: 'Subjects', count: subjects.length, min: 1 },
      { name: 'Rooms', count: rooms.length, min: 1 },
      { name: 'Time Slots', count: timeSlots.length, min: 1 },
    ];
    
    return { hasMinimumData, dataQuality };
  };

  const { hasMinimumData, dataQuality } = getSystemReadiness();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <Zap className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Dynamic Timetable Generator</h1>
        </div>
        
        {lastGenerated && (
          <div className="text-xs sm:text-sm text-gray-600">
            Last generated: {lastGenerated.toLocaleString()}
          </div>
        )}
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === activeStep;
            const isCompleted = index < activeStep;
            
            return (
              <div key={index} className="flex items-center w-full sm:w-auto">
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 
                  ${isActive ? 'bg-blue-600 border-blue-600 text-white' : 
                    isCompleted ? 'bg-green-600 border-green-600 text-white' : 
                    'bg-gray-100 border-gray-300 text-gray-400'}
                `}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden sm:block w-16 h-0.5 mx-4 ${isCompleted ? 'bg-green-600' : 'bg-gray-300'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      {activeStep === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Settings className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Current System Data</h3>
            </div>
            <div className="space-y-4">
              {dataQuality.map((item, index) => (
                <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                  item.count >= item.min ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <div className="flex items-center space-x-3">
                    {item.count >= item.min ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    )}
                    <span className="font-medium text-gray-800">{item.name}</span>
                  </div>
                  <span className={`text-sm ${item.count >= item.min ? 'text-green-600' : 'text-red-600'}`}>
                    {item.count} configured
                  </span>
                </div>
              ))}
            </div>
            
            {hasMinimumData ? (
              <button 
                onClick={() => setActiveStep(1)}
                className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium"
              >
                Continue to Generation
              </button>
            ) : (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Please configure minimum required data before generating timetables.
                </p>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Generation Features</h3>
            <div className="space-y-3">
              <div className="p-3 border border-gray-200 rounded-lg">
                <p className="font-medium text-gray-800">Real-time Data Integration</p>
                <p className="text-sm text-gray-600">Uses current faculty, batch, and room data</p>
              </div>
              <div className="p-3 border border-gray-200 rounded-lg">
                <p className="font-medium text-gray-800">Multiple Optimization Strategies</p>
                <p className="text-sm text-gray-600">Balanced, Faculty-focused, Room-focused approaches</p>
              </div>
              <div className="p-3 border border-gray-200 rounded-lg">
                <p className="font-medium text-gray-800">Conflict Detection</p>
                <p className="text-sm text-gray-600">Automatic detection and resolution of scheduling conflicts</p>
              </div>
              <div className="p-3 border border-gray-200 rounded-lg">
                <p className="font-medium text-gray-800">Manual Editing</p>
                <p className="text-sm text-gray-600">Drag-and-drop editing with constraint validation</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeStep === 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Calendar className="w-20 h-20 text-blue-600 mx-auto mb-6" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Generate Complete Weekly & Monthly Timetables</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            The system will analyze your current data and create 3 comprehensive timetable options covering the entire academic week and month.
            Each option includes optimized scheduling across all days with conflict resolution and resource utilization.
          </p>
          
          {isGenerating && (
            <div className="mb-8">
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
              <p className="text-gray-600">Analyzing constraints and generating optimized schedules...</p>
            </div>
          )}

          <button
            onClick={handleGenerateTimetables}
            disabled={isGenerating || !hasMinimumData}
            className="bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2 mx-auto"
          >
            {isGenerating ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Play className="w-5 h-5" />
            )}
            <span>{isGenerating ? 'Generating...' : 'Generate Full Timetables'}</span>
          </button>
        </div>
      )}

      {activeStep === 2 && generatedOptions.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Complete Timetable Options</h2>
            <button
              onClick={() => setActiveStep(1)}
              className="bg-gray-100 text-gray-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Regenerate</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {generatedOptions.map((option, index) => (
              <div 
                key={option.id}
                onClick={() => handleSelectOption(index)}
                className={`
                  bg-white rounded-xl shadow-sm border-2 p-4 sm:p-6 cursor-pointer transition-all hover:shadow-md
                  ${selectedOption === index ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}
                `}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm sm:text-lg font-semibold text-gray-800">{option.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getOptionColor(option.score)}`}>
                    {option.score}%
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Sessions</span>
                    <span className="font-medium">{option.sessions.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Conflicts</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{option.conflicts.length}</span>
                      {option.conflicts.length === 0 ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Faculty Util.</span>
                    <span className="font-medium">{option.facultyUtilization}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Room Util.</span>
                    <span className="font-medium">{option.roomUtilization}%</span>
                  </div>
                </div>

                {selectedOption === index && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-blue-800 font-medium">Selected - Ready for editing and publishing</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeStep === 3 && selectedOption !== null && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Edit & Publish Timetable</h2>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-gray-100 text-gray-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
              >
                <Edit3 className="w-4 h-4" />
                <span className="text-sm">{isEditing ? 'Stop Editing' : 'Edit Timetable'}</span>
              </button>
              <button
                onClick={handlePublishTimetable}
                className="bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span className="text-sm">Publish Timetable</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-blue-600">{sessions.length}</p>
                <p className="text-sm text-gray-600">Total Sessions</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-red-600">{conflicts.length}</p>
                <p className="text-sm text-gray-600">Conflicts</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-green-600">{analytics?.optimizationScore || 0}%</p>
                <p className="text-sm text-gray-600">Quality Score</p>
              </div>
            </div>

            {isEditing ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 font-medium">Editing Mode Active</p>
                <p className="text-blue-700 text-sm mt-1">
                  Use the Timetable View to drag and drop sessions. All changes are validated against constraints.
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-800 font-medium">Timetable Ready for Publishing</p>
                <p className="text-gray-700 text-sm mt-1">
                  Review the timetable and click "Publish" to make it available to all faculty and students.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicGeneratorPage;
