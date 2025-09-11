export interface User {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'admin' | 'faculty' | 'student';
  departmentId?: string;
  batchId?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  duration: number; // in semesters
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  type: 'theory' | 'lab' | 'elective';
  sessionsPerWeek: number;
  sessionDuration: number; // in minutes
  courseId: string;
  semester: number;
  credits: number;
}

export interface Batch {
  id: string;
  name: string;
  courseId: string;
  semester: number;
  studentCount: number;
  subjects: string[]; // subject IDs
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  password?: string;
  departmentId: string;
  subjects: string[]; // subject IDs
  maxClassesPerDay: number;
  maxClassesPerWeek: number;
  availability: boolean[][]; // [day][slot]
  averageLeaves: number;
}

export interface Room {
  id: string;
  name: string;
  type: 'classroom' | 'lab' | 'auditorium';
  capacity: number;
  equipment: string[];
  departmentId?: string;
}

export interface TimeSlot {
  id: string;
  day: number; // 0-6 (Monday-Sunday)
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  shift: 'morning' | 'afternoon' | 'evening';
}

export interface Session {
  id: string;
  subjectId: string;
  batchId: string;
  facultyId: string;
  roomId: string;
  timeSlotId: string;
  type: 'theory' | 'lab' | 'elective';
  isFixed?: boolean;
}

export interface Timetable {
  id: string;
  name: string;
  sessions: Session[];
  status: 'draft' | 'published' | 'archived';
  createdBy: string;
  createdAt: string;
  publishedAt?: string;
}

export interface Constraint {
  id: string;
  type: 'hard' | 'soft';
  description: string;
  parameters: Record<string, any>;
  weight?: number; // for soft constraints
}

export interface ConflictInfo {
  type: 'faculty' | 'batch' | 'room';
  message: string;
  sessionIds: string[];
}

export interface AnalyticsData {
  facultyUtilization: { [facultyId: string]: number };
  roomUtilization: { [roomId: string]: number };
  conflictCount: number;
  optimizationScore: number;
}