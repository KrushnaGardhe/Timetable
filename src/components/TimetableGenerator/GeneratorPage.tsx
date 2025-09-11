import React, { useState } from 'react';
import { 
  Settings, 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  BarChart3, 
  Upload,
  Download,
  Zap
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { TimetableGenerator } from '../../services/timetableGenerator';
import { setSessions, setConflicts, setAnalytics, setGenerating } from '../../store/slices/timetableSlice';
import { addNotification } from '../../store/slices/uiSlice';

const GeneratorPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { subjects, batches, faculty, rooms, timeSlots } = useAppSelector(state => state.data);
  const { isGenerating, conflicts, analytics } = useAppSelector(state => state.timetable);
  
  const [activeStep, setActiveStep] = useState(0);
  const [generatedOptions, setGeneratedOptions] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);

  const steps = [
    { title: 'Configure Parameters', icon: Settings },
    { title: 'Generate Options', icon: Zap },
    { title: 'Review & Compare', icon: BarChart3 },
    { title: 'Publish Timetable', icon: Upload },
  ];

  const handleGenerateTimetables = async () => {
    dispatch(setGenerating(true));
    
    try {
      const generator = new TimetableGenerator(subjects, batches, faculty, rooms, timeSlots);
      
      // Generate 3 different timetable options
      const options = [];
      for (let i = 0; i < 3; i++) {
        const result = generator.generateTimetable();
        options.push({
          id: i + 1,
          name: `Option ${i + 1}`,
          ...result,
        });
      }
      
      setGeneratedOptions(options);
      setActiveStep(2);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Timetables Generated',
        message: `Successfully generated ${options.length} timetable options`,
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
  };

  const handlePublishTimetable = () => {
    if (selectedOption !== null) {
      dispatch(addNotification({
        type: 'success',
        title: 'Timetable Published',
        message: 'Timetable has been successfully published to all users',
      }));
      setActiveStep(3);
    }
  };

  const getOptionColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Zap className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-800">Timetable Generator</h1>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === activeStep;
            const isCompleted = index < activeStep;
            
            return (
              <div key={index} className="flex items-center">
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
                  <div className={`w-16 h-0.5 mx-4 ${isCompleted ? 'bg-green-600' : 'bg-gray-300'}`} />
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
              <h3 className="text-lg font-semibold text-gray-800">System Configuration</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-800">Departments</span>
                </div>
                <span className="text-sm text-gray-600">{subjects.length} subjects configured</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-800">Faculty</span>
                </div>
                <span className="text-sm text-gray-600">{faculty.length} faculty members</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-800">Rooms</span>
                </div>
                <span className="text-sm text-gray-600">{rooms.length} rooms available</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-800">Batches</span>
                </div>
                <span className="text-sm text-gray-600">{batches.length} batches configured</span>
              </div>
            </div>
            <button 
              onClick={() => setActiveStep(1)}
              className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium"
            >
              Continue to Generation
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Generation Parameters</h3>
            <div className="space-y-3">
              <div className="p-3 border border-gray-200 rounded-lg">
                <p className="font-medium text-gray-800">Algorithm: OR-Tools CP-SAT</p>
                <p className="text-sm text-gray-600">Constraint Programming with SAT solver</p>
              </div>
              <div className="p-3 border border-gray-200 rounded-lg">
                <p className="font-medium text-gray-800">Hard Constraints</p>
                <p className="text-sm text-gray-600">Faculty/Room/Batch conflicts, Capacity limits</p>
              </div>
              <div className="p-3 border border-gray-200 rounded-lg">
                <p className="font-medium text-gray-800">Soft Constraints</p>
                <p className="text-sm text-gray-600">Workload balance, Gap minimization, Preferences</p>
              </div>
              <div className="p-3 border border-gray-200 rounded-lg">
                <p className="font-medium text-gray-800">Multi-objective Optimization</p>
                <p className="text-sm text-gray-600">Quality score based on constraint satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeStep === 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Calendar className="w-20 h-20 text-blue-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Generate Optimized Timetables</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            The system will create 3 optimized timetable options using constraint programming.
            This process considers all faculty availability, room capacities, and scheduling preferences.
          </p>
          
          {isGenerating && (
            <div className="mb-8">
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
              <p className="text-gray-600">Generating timetables... This may take a few moments.</p>
            </div>
          )}

          <button
            onClick={handleGenerateTimetables}
            disabled={isGenerating}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2 mx-auto"
          >
            <Play className="w-5 h-5" />
            <span>{isGenerating ? 'Generating...' : 'Generate Timetables'}</span>
          </button>
        </div>
      )}

      {activeStep === 2 && generatedOptions.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Generated Timetable Options</h2>
            <button
              onClick={() => setCompareDialogOpen(true)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Compare Options</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {generatedOptions.map((option, index) => (
              <div 
                key={option.id}
                onClick={() => handleSelectOption(index)}
                className={`
                  bg-white rounded-xl shadow-sm border-2 p-6 cursor-pointer transition-all hover:shadow-md
                  ${selectedOption === index ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}
                `}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">{option.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getOptionColor(option.score)}`}>
                    Score: {option.score}%
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Sessions</span>
                    <span className="font-medium">{option.sessions.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Conflicts</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{option.conflicts.length}</span>
                      {option.conflicts.length === 0 ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      )}
                    </div>
                  </div>
                </div>

                {selectedOption === index && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium">Selected option - review and publish when ready</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {selectedOption !== null && (
            <div className="text-center">
              <button
                onClick={handlePublishTimetable}
                className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 font-medium flex items-center space-x-2 mx-auto"
              >
                <Upload className="w-5 h-5" />
                <span>Publish Selected Timetable</span>
              </button>
            </div>
          )}
        </div>
      )}

      {activeStep === 3 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-green-600 mb-4">Timetable Published Successfully!</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            The timetable has been published and all faculty and students have been notified.
            You can now view the timetable in the Timetables section.
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <button 
              onClick={() => setActiveStep(0)}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200"
            >
              Generate New Timetable
            </button>
            <button 
              onClick={() => window.location.href = '/timetables'}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              View Timetable
            </button>
          </div>
        </div>
      )}

      {/* Compare Dialog */}
      {compareDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Compare Timetable Options</h2>
              <button
                onClick={() => setCompareDialogOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <CheckCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {generatedOptions.map((option, index) => (
                  <div key={option.id} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">{option.name}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Optimization Score:</span>
                        <span className={`px-2 py-1 rounded text-xs ${getOptionColor(option.score)}`}>
                          {option.score}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Sessions:</span>
                        <span className="font-medium">{option.sessions.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Conflicts:</span>
                        <span className="font-medium">{option.conflicts.length}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end p-6 border-t">
              <button
                onClick={() => setCompareDialogOpen(false)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneratorPage;