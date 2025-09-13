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
    
    // Generate sessions for each batch across the entire week
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
          const session = this.createWeeklySession(subject, batch, availableFaculty, sessions, sessionNum);
          if (session) {
            sessions.push(session);
          } else {
            conflicts.push({
              type: 'batch',
              message: `Unable to schedule ${subject.name} for ${batch.name} (session ${sessionNum + 1})`,
              sessionIds: [],
            });
          }
        }
      }
    }

    // Generate additional sessions to fill the month
    this.generateMonthlySchedule(sessions);

    // Detect conflicts
    const additionalConflicts = this.detectConflicts(sessions);
    conflicts.push(...additionalConflicts);

    // Calculate optimization score
    const score = this.calculateScore(sessions, conflicts);

    return { sessions, conflicts, score };
  }

  private createWeeklySession(
    subject: Subject,
    batch: Batch,
    availableFaculty: Faculty[],
    existingSessions: Session[],
    sessionIndex: number
  ): Session | null {
    // Distribute sessions across the week
    const preferredDays = this.getPreferredDays(subject, sessionIndex);
    const facultyMember = this.selectOptimalFaculty(availableFaculty, existingSessions);
    
    if (!facultyMember) return null;

    // Find suitable room
    const suitableRooms = this.rooms.filter(room => {
      if (subject.type === 'lab' && room.type !== 'lab') return false;
      if (room.capacity < batch.studentCount) return false;
      return true;
    });

    if (suitableRooms.length === 0) return null;

    const room = this.selectOptimalRoom(suitableRooms, existingSessions);

    // Find available time slot across preferred days
    for (const day of preferredDays) {
      const daySlots = this.timeSlots.filter(slot => slot.day === day);
      
      for (const timeSlot of daySlots) {
        if (this.isSlotAvailable(timeSlot, facultyMember, batch, room, existingSessions)) {
          return {
            id: `${Date.now()}-${Math.random()}-${sessionIndex}`,
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

  private getPreferredDays(subject: Subject, sessionIndex: number): number[] {
    // Distribute sessions across the week based on type and index
    if (subject.type === 'lab') {
      // Labs prefer specific days to avoid conflicts
      return [1, 2, 3]; // Tuesday, Wednesday, Thursday
    } else if (subject.sessionsPerWeek >= 3) {
      // High-frequency subjects spread across week
      const allDays = [0, 1, 2, 3, 4]; // Monday to Friday
      return allDays.sort(() => Math.random() - 0.5);
    } else {
      // Low-frequency subjects prefer early week
      return [0, 1, 2, 3, 4];
    }
  }

  private selectOptimalFaculty(availableFaculty: Faculty[], existingSessions: Session[]): Faculty | null {
    if (availableFaculty.length === 0) return null;

    // Select faculty with least current load
    return availableFaculty.reduce((best, current) => {
      const currentLoad = existingSessions.filter(s => s.facultyId === current.id).length;
      const bestLoad = existingSessions.filter(s => s.facultyId === best.id).length;
      return currentLoad < bestLoad ? current : best;
    });
  }

  private selectOptimalRoom(suitableRooms: Room[], existingSessions: Session[]): Room {
    // Select room with least current usage
    return suitableRooms.reduce((best, current) => {
      const currentUsage = existingSessions.filter(s => s.roomId === current.id).length;
      const bestUsage = existingSessions.filter(s => s.roomId === best.id).length;
      return currentUsage < bestUsage ? current : best;
    });
  }

  private isSlotAvailable(
    timeSlot: TimeSlot,
    faculty: Faculty,
    batch: Batch,
    room: Room,
    existingSessions: Session[]
  ): boolean {
    // Check faculty availability
    if (!faculty.availability[timeSlot.day][this.getSlotIndex(timeSlot)]) {
      return false;
    }

    // Check for conflicts
    return !existingSessions.some(session => 
      session.timeSlotId === timeSlot.id && 
      (session.facultyId === faculty.id || 
       session.batchId === batch.id || 
       session.roomId === room.id)
    );
  }

  private getSlotIndex(timeSlot: TimeSlot): number {
    // Convert time slot to availability matrix index
    const hour = parseInt(timeSlot.startTime.split(':')[0]);
    return Math.max(0, Math.min(9, hour - 9)); // 9 AM = index 0, 6 PM = index 9
  }

  private generateMonthlySchedule(sessions: Session[]): void {
    // Extend weekly schedule to monthly by replicating patterns
    const weeklySessions = [...sessions];
    const weeksInMonth = 4;

    for (let week = 1; week < weeksInMonth; week++) {
      weeklySessions.forEach(session => {
        // Create variations for each week to avoid monotony
        if (Math.random() > 0.1) { // 90% chance to include session
          const newSession: Session = {
            ...session,
            id: `${session.id}-week${week}`,
          };
          sessions.push(newSession);
        }
      });
    }
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

      // Batch conflicts
      const batchMap = new Map<string, Session[]>();
      slotSessions.forEach(session => {
        if (!batchMap.has(session.batchId)) {
          batchMap.set(session.batchId, []);
        }
        batchMap.get(session.batchId)!.push(session);
      });

      batchMap.forEach((batchSessions, batchId) => {
        if (batchSessions.length > 1) {
          const batch = this.batches.find(b => b.id === batchId);
          conflicts.push({
            type: 'batch',
            message: `Batch ${batch?.name} has multiple classes at the same time`,
            sessionIds: batchSessions.map(s => s.id),
          });
        }
      });
    });

    return conflicts;
  }

  private calculateScore(sessions: Session[], conflicts: ConflictInfo[]): number {
    let score = 100;
    
    // Penalize conflicts heavily
    score -= conflicts.length * 15;
    
    // Reward good distribution
    const dailyDistribution = this.calculateDailyDistribution(sessions);
    const distributionScore = this.calculateDistributionScore(dailyDistribution);
    score += distributionScore;
    
    // Penalize faculty overload
    const facultyOverload = this.calculateFacultyOverload(sessions);
    score -= facultyOverload * 5;
    
    // Reward room utilization efficiency
    const roomEfficiency = this.calculateRoomEfficiency(sessions);
    score += roomEfficiency;
    
    return Math.max(0, Math.min(100, score));
  }

  private calculateDailyDistribution(sessions: Session[]): number[] {
    const dailyCounts = new Array(7).fill(0);
    sessions.forEach(session => {
      const timeSlot = this.timeSlots.find(t => t.id === session.timeSlotId);
      if (timeSlot) {
        dailyCounts[timeSlot.day]++;
      }
    });
    return dailyCounts;
  }

  private calculateDistributionScore(dailyDistribution: number[]): number {
    const workingDays = dailyDistribution.slice(0, 5); // Monday to Friday
    const average = workingDays.reduce((sum, count) => sum + count, 0) / 5;
    const variance = workingDays.reduce((sum, count) => sum + Math.pow(count - average, 2), 0) / 5;
    return Math.max(0, 10 - variance); // Lower variance = higher score
  }

  private calculateFacultyOverload(sessions: Session[]): number {
    let overloadCount = 0;
    this.faculty.forEach(faculty => {
      const facultySessions = sessions.filter(s => s.facultyId === faculty.id);
      const dailyLoad = new Array(7).fill(0);
      
      facultySessions.forEach(session => {
        const timeSlot = this.timeSlots.find(t => t.id === session.timeSlotId);
        if (timeSlot) {
          dailyLoad[timeSlot.day]++;
        }
      });
      
      dailyLoad.forEach(load => {
        if (load > faculty.maxClassesPerDay) {
          overloadCount += load - faculty.maxClassesPerDay;
        }
      });
    });
    return overloadCount;
  }

  private calculateRoomEfficiency(sessions: Session[]): number {
    const roomUsage = new Map<string, number>();
    sessions.forEach(session => {
      roomUsage.set(session.roomId, (roomUsage.get(session.roomId) || 0) + 1);
    });
    
    const totalRooms = this.rooms.length;
    const usedRooms = roomUsage.size;
    return Math.round((usedRooms / totalRooms) * 10); // Efficiency score out of 10
  }
}
