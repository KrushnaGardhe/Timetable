import { Session, Subject, Batch, Faculty, Room, TimeSlot, ConflictInfo } from '../types';

export class TimetableGenerator {
  private subjects: Subject[];
  private batches: Batch[];
  private faculty: Faculty[];
  private rooms: Room[];
  private timeSlots: TimeSlot[];

  constructor(subjects: Subject[], batches: Batch[], faculty: Faculty[], rooms: Room[], timeSlots: TimeSlot[]) {
    this.subjects = subjects;
    this.batches = batches;
    this.faculty = faculty;
    this.rooms = rooms;
    this.timeSlots = timeSlots;
  }

  generateTimetable(): { sessions: Session[]; conflicts: ConflictInfo[]; score: number } {
    const sessions: Session[] = [];
    const conflicts: ConflictInfo[] = [];
    
    // Generate sessions for each batch
    for (const batch of this.batches) {
      const batchSubjects = this.subjects.filter(s => batch.subjects.includes(s.id));
      
      for (const subject of batchSubjects) {
        const availableFaculty = this.faculty.filter(f => f.subjects.includes(subject.id));
        
        if (availableFaculty.length === 0) {
          conflicts.push({
            type: 'faculty',
            message: `No faculty available for subject ${subject.name}`,
            sessionIds: [],
          });
          continue;
        }

        // Generate sessions based on sessions per week
        for (let sessionNum = 0; sessionNum < subject.sessionsPerWeek; sessionNum++) {
          const session = this.createSession(subject, batch, availableFaculty, sessions);
          if (session) {
            sessions.push(session);
          } else {
            conflicts.push({
              type: 'batch',
              message: `Unable to schedule ${subject.name} for ${batch.name}`,
              sessionIds: [],
            });
          }
        }
      }
    }

    // Detect conflicts
    const additionalConflicts = this.detectConflicts(sessions);
    conflicts.push(...additionalConflicts);

    // Calculate optimization score
    const score = this.calculateScore(sessions, conflicts);

    return { sessions, conflicts, score };
  }

  private createSession(
    subject: Subject,
    batch: Batch,
    availableFaculty: Faculty[],
    existingSessions: Session[]
  ): Session | null {
    // Simple greedy assignment - in production, this would use OR-Tools optimization
    const facultyMember = availableFaculty[0]; // For demo, pick first available
    
    // Find suitable room
    const suitableRooms = this.rooms.filter(room => {
      if (subject.type === 'lab' && room.type !== 'lab') return false;
      if (room.capacity < batch.studentCount) return false;
      return true;
    });

    if (suitableRooms.length === 0) return null;

    const room = suitableRooms[0];

    // Find available time slot
    for (let day = 0; day < 5; day++) { // Monday to Friday
      const daySlots = this.timeSlots.filter(slot => slot.day === day);
      
      for (const timeSlot of daySlots) {
        // Check if slot is available
        const isSlotFree = !existingSessions.some(session => 
          session.timeSlotId === timeSlot.id && 
          (session.facultyId === facultyMember.id || 
           session.batchId === batch.id || 
           session.roomId === room.id)
        );

        if (isSlotFree) {
          return {
            id: `${Date.now()}-${Math.random()}`,
            subjectId: subject.id,
            batchId: batch.id,
            facultyId: facultyMember.id,
            roomId: room.id,
            timeSlotId: timeSlot.id,
            type: subject.type,
          };
        }
      }
    }

    return null;
  }

  private detectConflicts(sessions: Session[]): ConflictInfo[] {
    const conflicts: ConflictInfo[] = [];
    const slotMap = new Map<string, Session[]>();

    // Group sessions by time slot
    sessions.forEach(session => {
      const key = session.timeSlotId;
      if (!slotMap.has(key)) {
        slotMap.set(key, []);
      }
      slotMap.get(key)!.push(session);
    });

    // Check for conflicts in each time slot
    slotMap.forEach((slotSessions, timeSlotId) => {
      // Faculty conflicts
      const facultyMap = new Map<string, Session[]>();
      slotSessions.forEach(session => {
        if (!facultyMap.has(session.facultyId)) {
          facultyMap.set(session.facultyId, []);
        }
        facultyMap.get(session.facultyId)!.push(session);
      });

      facultyMap.forEach((facultySessions, facultyId) => {
        if (facultySessions.length > 1) {
          const faculty = this.faculty.find(f => f.id === facultyId);
          conflicts.push({
            type: 'faculty',
            message: `Faculty ${faculty?.name} has multiple classes at the same time`,
            sessionIds: facultySessions.map(s => s.id),
          });
        }
      });

      // Room conflicts
      const roomMap = new Map<string, Session[]>();
      slotSessions.forEach(session => {
        if (!roomMap.has(session.roomId)) {
          roomMap.set(session.roomId, []);
        }
        roomMap.get(session.roomId)!.push(session);
      });

      roomMap.forEach((roomSessions, roomId) => {
        if (roomSessions.length > 1) {
          const room = this.rooms.find(r => r.id === roomId);
          conflicts.push({
            type: 'room',
            message: `Room ${room?.name} is double-booked`,
            sessionIds: roomSessions.map(s => s.id),
          });
        }
      });
    });

    return conflicts;
  }

  private calculateScore(sessions: Session[], conflicts: ConflictInfo[]): number {
    // Simple scoring system - in production, this would be more sophisticated
    let score = 100;
    score -= conflicts.length * 10; // Penalize conflicts
    score -= sessions.filter(s => s.type === 'lab').length * 2; // Slight penalty for lab scheduling complexity
    return Math.max(0, score);
  }
}