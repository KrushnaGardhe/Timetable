import { Department, Course, Subject, Batch, Faculty, Room, TimeSlot, User } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@university.edu',
    name: 'Admin User',
    role: 'admin',
  },
  {
    id: '2',
    email: 'faculty@university.edu',
    name: 'Dr. John Smith',
    role: 'faculty',
    departmentId: '1',
  },
  {
    id: '3',
    email: 'student@university.edu',
    name: 'Alice Johnson',
    role: 'student',
    batchId: '1',
  },
];

export const mockDepartments: Department[] = [
  { id: '1', name: 'Computer Science & Engineering', code: 'CSE' },
  { id: '2', name: 'Electronics & Communication', code: 'ECE' },
  { id: '3', name: 'Mechanical Engineering', code: 'ME' },
  { id: '4', name: 'Civil Engineering', code: 'CE' },
];

export const mockCourses: Course[] = [
  { id: '1', name: 'Bachelor of Technology', code: 'B.Tech', departmentId: '1', duration: 8 },
  { id: '2', name: 'Master of Technology', code: 'M.Tech', departmentId: '1', duration: 4 },
];

export const mockSubjects: Subject[] = [
  {
    id: '1',
    name: 'Data Structures and Algorithms',
    code: 'CS301',
    type: 'theory',
    sessionsPerWeek: 3,
    sessionDuration: 60,
    courseId: '1',
    semester: 3,
    credits: 4,
  },
  {
    id: '2',
    name: 'Database Management Systems',
    code: 'CS302',
    type: 'theory',
    sessionsPerWeek: 3,
    sessionDuration: 60,
    courseId: '1',
    semester: 3,
    credits: 3,
  },
  {
    id: '3',
    name: 'Data Structures Lab',
    code: 'CS303',
    type: 'lab',
    sessionsPerWeek: 1,
    sessionDuration: 120,
    courseId: '1',
    semester: 3,
    credits: 2,
  },
  {
    id: '4',
    name: 'Machine Learning',
    code: 'CS401',
    type: 'elective',
    sessionsPerWeek: 2,
    sessionDuration: 60,
    courseId: '1',
    semester: 4,
    credits: 3,
  },
];

export const mockBatches: Batch[] = [
  {
    id: '1',
    name: 'CSE 3rd Sem A',
    courseId: '1',
    semester: 3,
    studentCount: 60,
    subjects: ['1', '2', '3'],
  },
  {
    id: '2',
    name: 'CSE 3rd Sem B',
    courseId: '1',
    semester: 3,
    studentCount: 58,
    subjects: ['1', '2', '3'],
  },
];

export const mockFaculty: Faculty[] = [
  {
    id: '1',
    name: 'Dr. John Smith',
    email: 'john.smith@university.edu',
    password: 'password123',
    departmentId: '1',
    subjects: ['1', '3'],
    maxClassesPerDay: 6,
    maxClassesPerWeek: 24,
    availability: Array(7).fill(null).map(() => Array(10).fill(true)),
    averageLeaves: 2,
  },
  {
    id: '2',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@university.edu',
    password: 'password123',
    departmentId: '1',
    subjects: ['2', '4'],
    maxClassesPerDay: 5,
    maxClassesPerWeek: 20,
    availability: Array(7).fill(null).map(() => Array(10).fill(true)),
    averageLeaves: 1,
  },
];

export const mockRooms: Room[] = [
  {
    id: '1',
    name: 'Room 101',
    type: 'classroom',
    capacity: 60,
    equipment: ['projector', 'whiteboard', 'speakers'],
    departmentId: '1',
  },
  {
    id: '2',
    name: 'Room 102',
    type: 'classroom',
    capacity: 50,
    equipment: ['projector', 'whiteboard'],
    departmentId: '1',
  },
  {
    id: '3',
    name: 'Computer Lab 1',
    type: 'lab',
    capacity: 30,
    equipment: ['computers', 'projector', 'software'],
    departmentId: '1',
  },
];

export const mockTimeSlots: TimeSlot[] = [
  // Monday
  { id: '1', day: 0, startTime: '09:00', endTime: '10:00', shift: 'morning' },
  { id: '2', day: 0, startTime: '10:00', endTime: '11:00', shift: 'morning' },
  { id: '3', day: 0, startTime: '11:15', endTime: '12:15', shift: 'morning' },
  { id: '4', day: 0, startTime: '12:15', endTime: '13:15', shift: 'morning' },
  { id: '5', day: 0, startTime: '14:00', endTime: '15:00', shift: 'afternoon' },
  { id: '6', day: 0, startTime: '15:00', endTime: '16:00', shift: 'afternoon' },
  { id: '7', day: 0, startTime: '16:15', endTime: '17:15', shift: 'afternoon' },
  { id: '8', day: 0, startTime: '17:15', endTime: '18:15', shift: 'afternoon' },
  
  // Tuesday
  { id: '9', day: 1, startTime: '09:00', endTime: '10:00', shift: 'morning' },
  { id: '10', day: 1, startTime: '10:00', endTime: '11:00', shift: 'morning' },
  { id: '11', day: 1, startTime: '11:15', endTime: '12:15', shift: 'morning' },
  { id: '12', day: 1, startTime: '12:15', endTime: '13:15', shift: 'morning' },
  { id: '13', day: 1, startTime: '14:00', endTime: '15:00', shift: 'afternoon' },
  { id: '14', day: 1, startTime: '15:00', endTime: '16:00', shift: 'afternoon' },
  { id: '15', day: 1, startTime: '16:15', endTime: '17:15', shift: 'afternoon' },
  { id: '16', day: 1, startTime: '17:15', endTime: '18:15', shift: 'afternoon' },
  
  // Wednesday
  { id: '17', day: 2, startTime: '09:00', endTime: '10:00', shift: 'morning' },
  { id: '18', day: 2, startTime: '10:00', endTime: '11:00', shift: 'morning' },
  { id: '19', day: 2, startTime: '11:15', endTime: '12:15', shift: 'morning' },
  { id: '20', day: 2, startTime: '12:15', endTime: '13:15', shift: 'morning' },
  { id: '21', day: 2, startTime: '14:00', endTime: '15:00', shift: 'afternoon' },
  { id: '22', day: 2, startTime: '15:00', endTime: '16:00', shift: 'afternoon' },
  { id: '23', day: 2, startTime: '16:15', endTime: '17:15', shift: 'afternoon' },
  { id: '24', day: 2, startTime: '17:15', endTime: '18:15', shift: 'afternoon' },
  
  // Thursday
  { id: '25', day: 3, startTime: '09:00', endTime: '10:00', shift: 'morning' },
  { id: '26', day: 3, startTime: '10:00', endTime: '11:00', shift: 'morning' },
  { id: '27', day: 3, startTime: '11:15', endTime: '12:15', shift: 'morning' },
  { id: '28', day: 3, startTime: '12:15', endTime: '13:15', shift: 'morning' },
  { id: '29', day: 3, startTime: '14:00', endTime: '15:00', shift: 'afternoon' },
  { id: '30', day: 3, startTime: '15:00', endTime: '16:00', shift: 'afternoon' },
  { id: '31', day: 3, startTime: '16:15', endTime: '17:15', shift: 'afternoon' },
  { id: '32', day: 3, startTime: '17:15', endTime: '18:15', shift: 'afternoon' },
  
  // Friday
  { id: '33', day: 4, startTime: '09:00', endTime: '10:00', shift: 'morning' },
  { id: '34', day: 4, startTime: '10:00', endTime: '11:00', shift: 'morning' },
  { id: '35', day: 4, startTime: '11:15', endTime: '12:15', shift: 'morning' },
  { id: '36', day: 4, startTime: '12:15', endTime: '13:15', shift: 'morning' },
  { id: '37', day: 4, startTime: '14:00', endTime: '15:00', shift: 'afternoon' },
  { id: '38', day: 4, startTime: '15:00', endTime: '16:00', shift: 'afternoon' },
  { id: '39', day: 4, startTime: '16:15', endTime: '17:15', shift: 'afternoon' },
  { id: '40', day: 4, startTime: '17:15', endTime: '18:15', shift: 'afternoon' },
];
