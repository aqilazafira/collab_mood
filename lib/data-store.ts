import { Prisma } from '@prisma/client';
import prisma from "./db"

// Types
type SessionWithUser = Prisma.SessionGetPayload<{
  include: { user: true }
}>

// Session functions
export async function getSessions(userId: string) {
  return await prisma.session.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getSessionById(id: string, userId: string) {
  return await prisma.session.findUnique({
    where: { id, userId }
  })
}

export async function createSession(data: {
  name: string;
  description?: string;
  status: 'scheduled' | 'active' | 'completed';
  startTime: string;
  duration: string;
  participants: any[];
  userId: string;
  endedAt?: string;
}) {
  return await prisma.session.create({
    data: {
      ...data,
      currentMood: { valence: 0, arousal: 0 },
    }
  })
}

interface UpdateSessionData {
  name?: string;
  description?: string | null;
  status?: 'scheduled' | 'active' | 'completed';
  startTime?: string;
  duration?: string;
  participants?: any[];
  currentMood?: { valence: number; arousal: number };
  endedAt?: string | null;
}

export async function updateSession(id: string, userId: string, data: UpdateSessionData) {
  const updateData: any = { ...data };
  
  // Handle participants serialization if present
  if (data.participants) {
    updateData.participants = JSON.stringify(data.participants);
  }
  
  // Remove userId from update data to prevent type issues
  delete updateData.userId;
  
  return await prisma.session.update({
    where: { id, userId },
    data: updateData
  })
}

export async function deleteSession(id: string, userId: string) {
  return await prisma.session.delete({
    where: { id, userId }
  })
}

// EmotionData functions
type SessionWithRelations = Prisma.SessionGetPayload<{
  select: {
    id: true;
    name: true;
    description: true;
    status: true;
    startTime: true;
    duration: true;
    currentMood: true;
    participants: true;
    createdAt: true;
    updatedAt: true;
    userId: true;
  };
}>;

// Type untuk data emosi dengan relasi session
type EmotionDataWithRelations = Prisma.EmotionDataGetPayload<{
  include: {
    session: {
      select: {
        id: true;
        name: true;
        description: true;
        status: true;
        startTime: true;
        duration: true;
        currentMood: true;
        participants: true;
        createdAt: true;
        updatedAt: true;
        userId: true;
      };
    };
  };
}>;

export async function getEmotionData(sessionId: string, userId: string | number): Promise<EmotionDataWithRelations[]> {
  const userIdStr = userId.toString();
  const userIdNumber = typeof userId === 'string' ? parseInt(userId, 10) : userId;
  
  if (isNaN(userIdNumber)) {
    throw new Error('Invalid user ID format');
  }

  try {
    // Ambil data emosi dengan relasi session
    const emotionData = await prisma.emotionData.findMany({
      where: { 
        sessionId,
        userId: userIdStr,
        session: {
          userId: userIdNumber
        }
      },
      include: {
        session: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            startTime: true,
            duration: true,
            currentMood: true,
            participants: true,
            createdAt: true,
            updatedAt: true,
            userId: true
          }
        }
      },
      orderBy: { timestamp: 'desc' as const }
    });

    // Kembalikan data emosi dengan tipe yang benar
    return emotionData.map((data) => {
      if (!data.session) {
        throw new Error('Session not found for emotion data');
      }
      
      return {
        ...data,
        session: {
          ...data.session,
          currentMood: (data.session.currentMood || {}) as Record<string, unknown>,
          participants: (data.session.participants || []) as unknown[]
        }
      };
    });
  } catch (error) {
    console.error('Error in getEmotionData:', error);
    throw new Error('Failed to fetch emotion data');
  }
}

export async function addEmotionData(data: {
  sessionId: string;
  userId: string;
  valence: number;
  arousal: number;
  notes?: string;
}) {
  return await prisma.emotionData.create({
    data: {
      ...data,
      timestamp: new Date()
    }
  })
}

// User functions
export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    include: { settings: true }
  })
}

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
    include: { settings: true }
  })
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role?: string;
}) {
  return await prisma.user.create({
    data: {
      ...data,
      role: data.role || 'user'
    }
  })
}

// UserSettings functions
export async function getUserSettings(userId: string) {
  return await prisma.userSettings.findUnique({
    where: { userId }
  })
}

export async function updateUserSettings(userId: string, settings: {
  theme?: string;
  notifications?: boolean;
  language?: string;
  workHoursStart?: string;
  workHoursEnd?: string;
  breakFrequency?: number;
  breakDuration?: number;
}) {
  return await prisma.userSettings.upsert({
    where: { userId },
    update: settings,
    create: {
      ...settings,
      userId,
    }
  })
}

// Suggestion functions
export async function getSessionSuggestions(sessionId: string, userId: string) {
  return await prisma.suggestion.findMany({
    where: { 
      sessionId,
      session: { userId }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function createSuggestion(data: {
  sessionId: string;
  content: string;
  type: string;
  isCompleted?: boolean;
}) {
  return await prisma.suggestion.create({
    data: {
      ...data,
      isCompleted: data.isCompleted || false
    }
  })
}

// SessionReport functions
export async function getSessionReport(sessionId: string, userId: string) {
  return await prisma.sessionReport.findUnique({
    where: { 
      sessionId,
      session: { userId }
    }
  })
}

export async function createOrUpdateSessionReport(data: {
  sessionId: string;
  summary: string;
  insights: any;
}) {
  return await prisma.sessionReport.upsert({
    where: { sessionId: data.sessionId },
    update: data,
    create: data
  })
}

// Helper functions
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export async function getCurrentUser(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: { settings: true }
  })
}
