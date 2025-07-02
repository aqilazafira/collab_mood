export interface User {
  id: string
  name: string
  email: string
  password: string
  role: "Student" | "Facilitator"
  createdAt: string
}

export interface Session {
  id: string
  name: string
  description: string
  status: "scheduled" | "active" | "completed"
  startTime: string
  duration: string
  participants: SessionParticipant[]
  currentMood?: {
    valence: number
    arousal: number
  }
  createdAt: string
  endedAt?: string
}

export interface SessionParticipant {
  name: string
  role: "Student" | "Facilitator"
  status: "invited" | "active" | "completed"
  userId?: string
}

export interface EmotionData {
  id: string
  sessionId?: string
  userId: string
  timestamp: string
  valence: number
  arousal: number
  emotions: {
    emotion: string
    name: string
    score: number
  }[]
  event?: string
}

export interface Suggestion {
  id: string
  sessionId: string
  type: "Break" | "Game" | "Mindfulness"
  title: string
  description: string
  timestamp: string
  status: "active" | "completed" | "declined"
  participants: string[]
  details: {
    reason: string
    expectedOutcome: string
    duration: string
    instructions: string
  }
}

export interface SessionReport {
  id: string
  sessionId: string
  sessionName: string
  date: string
  duration: string
  participants: number
  avgValence: number
  avgArousal: number
  suggestionsGiven: number
  status: "completed"
  summary: {
    highlights: string[]
    concerns: string[]
    recommendations: string[]
  }
}

export interface Feedback {
  id: string
  userId: string
  sessionId?: string
  category: string
  rating: number
  comment: string
  timestamp: string
  status: "pending" | "reviewed"
}

export interface UserSettings {
  userId: string
  emotionSensitivity: number
  enableWebcam: boolean
  enableMicrophone: boolean
  detectionFrequency: "low" | "medium" | "high"
  enableNotifications: boolean
  suggestionNotifications: boolean
  conflictAlerts: boolean
  sessionReminders: boolean
  emailNotifications: boolean
  dataRetention: string
  shareAnonymousData: boolean
  allowRecording: boolean
  theme: "light" | "dark" | "system"
  language: string
  autoSaveReports: boolean
}
