-- Create database
CREATE DATABASE IF NOT EXISTS collab_mood;
USE collab_mood;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  role ENUM('Student', 'Facilitator') NOT NULL DEFAULT 'Student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  status ENUM('scheduled', 'active', 'completed') NOT NULL DEFAULT 'scheduled',
  start_time TIMESTAMP,
  duration VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP NULL,
  created_by VARCHAR(36),
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Session participants table
CREATE TABLE IF NOT EXISTS session_participants (
  id VARCHAR(36) PRIMARY KEY,
  session_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  role ENUM('Student', 'Facilitator') NOT NULL DEFAULT 'Student',
  status ENUM('invited', 'active', 'completed') NOT NULL DEFAULT 'invited',
  joined_at TIMESTAMP NULL,
  left_at TIMESTAMP NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Emotion data table
CREATE TABLE IF NOT EXISTS emotion_data (
  id VARCHAR(36) PRIMARY KEY,
  session_id VARCHAR(36),
  user_id VARCHAR(36) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  valence FLOAT NOT NULL,
  arousal FLOAT NOT NULL,
  event VARCHAR(100),
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Emotion details table
CREATE TABLE IF NOT EXISTS emotion_details (
  id VARCHAR(36) PRIMARY KEY,
  emotion_data_id VARCHAR(36) NOT NULL,
  emotion VARCHAR(50) NOT NULL,
  name VARCHAR(50) NOT NULL,
  score FLOAT NOT NULL,
  FOREIGN KEY (emotion_data_id) REFERENCES emotion_data(id) ON DELETE CASCADE
);

-- Suggestions table
CREATE TABLE IF NOT EXISTS suggestions (
  id VARCHAR(36) PRIMARY KEY,
  session_id VARCHAR(36) NOT NULL,
  type ENUM('Break', 'Game', 'Mindfulness') NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('active', 'completed', 'declined') NOT NULL DEFAULT 'active',
  reason TEXT,
  expected_outcome TEXT,
  duration VARCHAR(50),
  instructions TEXT,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Suggestion participants table
CREATE TABLE IF NOT EXISTS suggestion_participants (
  id VARCHAR(36) PRIMARY KEY,
  suggestion_id VARCHAR(36) NOT NULL,
  participant_id VARCHAR(36),
  participant_name VARCHAR(100),
  FOREIGN KEY (suggestion_id) REFERENCES suggestions(id) ON DELETE CASCADE,
  FOREIGN KEY (participant_id) REFERENCES session_participants(id) ON DELETE SET NULL
);

-- Session reports table
CREATE TABLE IF NOT EXISTS session_reports (
  id VARCHAR(36) PRIMARY KEY,
  session_id VARCHAR(36) NOT NULL,
  date DATE NOT NULL,
  duration VARCHAR(50) NOT NULL,
  participants INT NOT NULL,
  avg_valence FLOAT NOT NULL,
  avg_arousal FLOAT NOT NULL,
  suggestions_given INT NOT NULL DEFAULT 0,
  status ENUM('completed') NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Report highlights table
CREATE TABLE IF NOT EXISTS report_highlights (
  id VARCHAR(36) PRIMARY KEY,
  report_id VARCHAR(36) NOT NULL,
  type ENUM('highlight', 'concern', 'recommendation') NOT NULL,
  content TEXT NOT NULL,
  FOREIGN KEY (report_id) REFERENCES session_reports(id) ON DELETE CASCADE
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  session_id VARCHAR(36),
  category VARCHAR(50) NOT NULL,
  rating INT NOT NULL,
  comment TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending', 'reviewed') NOT NULL DEFAULT 'pending',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL
);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
  user_id VARCHAR(36) PRIMARY KEY,
  emotion_sensitivity INT NOT NULL DEFAULT 75,
  enable_webcam BOOLEAN NOT NULL DEFAULT TRUE,
  enable_microphone BOOLEAN NOT NULL DEFAULT TRUE,
  detection_frequency ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
  enable_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  suggestion_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  conflict_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  session_reminders BOOLEAN NOT NULL DEFAULT TRUE,
  email_notifications BOOLEAN NOT NULL DEFAULT FALSE,
  data_retention VARCHAR(10) NOT NULL DEFAULT '30',
  share_anonymous_data BOOLEAN NOT NULL DEFAULT TRUE,
  allow_recording BOOLEAN NOT NULL DEFAULT FALSE,
  theme VARCHAR(20) NOT NULL DEFAULT 'light',
  language VARCHAR(5) NOT NULL DEFAULT 'en',
  auto_save_reports BOOLEAN NOT NULL DEFAULT TRUE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_emotion_data_session ON emotion_data(session_id);
CREATE INDEX idx_emotion_data_user ON emotion_data(user_id);
CREATE INDEX idx_suggestions_session ON suggestions(session_id);
CREATE INDEX idx_feedback_user ON feedback(user_id);
