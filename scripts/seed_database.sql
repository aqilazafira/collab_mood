USE collab_mood;

-- Insert sample users
INSERT INTO users (id, name, email, role, created_at) VALUES
('user-1', 'John Doe', 'john.doe@example.com', 'Student', NOW()),
('user-2', 'Jane Smith', 'jane.smith@example.com', 'Facilitator', NOW()),
('user-3', 'Alice Brown', 'alice.brown@example.com', 'Student', NOW()),
('user-4', 'Bob Davis', 'bob.davis@example.com', 'Student', NOW());

-- Insert sample sessions
INSERT INTO sessions (id, name, description, status, start_time, duration, created_by) VALUES
('SES-001', 'Team Alpha - Daily Standup', 'Daily team synchronization and progress updates', 'active', NOW(), '25 minutes', 'user-2'),
('SES-002', 'Cross-team Design Review', 'Review and feedback session for design proposals', 'scheduled', DATE_ADD(NOW(), INTERVAL 1 DAY), '90 minutes', 'user-2'),
('SES-003', 'Team Beta - Retrospective', 'Sprint retrospective meeting', 'completed', DATE_SUB(NOW(), INTERVAL 1 DAY), '60 minutes', 'user-2');

-- Insert sample session participants
INSERT INTO session_participants (id, session_id, user_id, name, email, role, status, joined_at) VALUES
('part-1', 'SES-001', 'user-1', 'John Doe', 'john.doe@example.com', 'Student', 'active', NOW()),
('part-2', 'SES-001', 'user-2', 'Jane Smith', 'jane.smith@example.com', 'Facilitator', 'active', NOW()),
('part-3', 'SES-002', 'user-3', 'Alice Brown', 'alice.brown@example.com', 'Student', 'invited', NULL),
('part-4', 'SES-002', 'user-4', 'Bob Davis', 'bob.davis@example.com', 'Student', 'invited', NULL),
('part-5', 'SES-003', 'user-1', 'John Doe', 'john.doe@example.com', 'Student', 'completed', DATE_SUB(NOW(), INTERVAL 1 DAY)),
('part-6', 'SES-003', 'user-2', 'Jane Smith', 'jane.smith@example.com', 'Facilitator', 'completed', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Insert sample emotion data
INSERT INTO emotion_data (id, session_id, user_id, timestamp, valence, arousal) VALUES
('emotion-1', 'SES-001', 'user-1', NOW(), 0.7, 0.6),
('emotion-2', 'SES-001', 'user-1', DATE_SUB(NOW(), INTERVAL 15 MINUTE), 0.65, 0.55),
('emotion-3', 'SES-001', 'user-1', DATE_SUB(NOW(), INTERVAL 30 MINUTE), 0.72, 0.48),
('emotion-4', 'SES-001', 'user-2', NOW(), 0.68, 0.62),
('emotion-5', 'SES-003', 'user-1', DATE_SUB(NOW(), INTERVAL 1 DAY), 0.58, 0.63);

-- Insert sample emotion details
INSERT INTO emotion_details (id, emotion_data_id, emotion, name, score) VALUES
('detail-1', 'emotion-1', 'happy', 'Bahagia', 0.8),
('detail-2', 'emotion-1', 'neutral', 'Netral', 0.2),
('detail-3', 'emotion-2', 'happy', 'Bahagia', 0.75),
('detail-4', 'emotion-2', 'neutral', 'Netral', 0.25),
('detail-5', 'emotion-3', 'happy', 'Bahagia', 0.85),
('detail-6', 'emotion-3', 'neutral', 'Netral', 0.15),
('detail-7', 'emotion-4', 'happy', 'Bahagia', 0.7),
('detail-8', 'emotion-4', 'neutral', 'Netral', 0.3),
('detail-9', 'emotion-5', 'neutral', 'Netral', 0.6),
('detail-10', 'emotion-5', 'sad', 'Sedih', 0.4);

-- Insert sample suggestions
INSERT INTO suggestions (id, session_id, type, title, description, timestamp, status, reason, expected_outcome, duration, instructions) VALUES
('suggestion-1', 'SES-001', 'Break', 'Take a 5-minute break', 'High stress levels detected. A short break can help reset emotional state.', NOW(), 'active', 'Elevated arousal levels (0.85+) detected across multiple participants', 'Reduce stress and improve focus', '5 minutes', 'Step away from screens, do some light stretching, or practice deep breathing.'),
('suggestion-2', 'SES-003', 'Mindfulness', 'Quick mindfulness exercise', 'Tension detected during feedback session. A mindfulness exercise can help.', DATE_SUB(NOW(), INTERVAL 1 DAY), 'completed', 'Decreasing valence levels detected during feedback phase', 'Improve emotional regulation and openness to feedback', '3 minutes', 'Focus on breathing and practice non-judgmental awareness.');

-- Insert sample suggestion participants
INSERT INTO suggestion_participants (id, suggestion_id, participant_id, participant_name) VALUES
('sugpart-1', 'suggestion-1', 'part-1', 'John Doe'),
('sugpart-2', 'suggestion-1', 'part-2', 'Jane Smith'),
('sugpart-3', 'suggestion-2', 'part-5', 'John Doe'),
('sugpart-4', 'suggestion-2', 'part-6', 'Jane Smith');

-- Insert sample session reports
INSERT INTO session_reports (id, session_id, date, duration, participants, avg_valence, avg_arousal, suggestions_given) VALUES
('RPT-001', 'SES-003', DATE_SUB(CURDATE(), INTERVAL 1 DAY), '1h 30m', 6, 0.58, 0.63, 2);

-- Insert sample report highlights
INSERT INTO report_highlights (id, report_id, type, content) VALUES
('highlight-1', 'RPT-001', 'highlight', 'Open and honest feedback sharing'),
('highlight-2', 'RPT-001', 'highlight', 'Good emotional regulation'),
('highlight-3', 'RPT-001', 'highlight', 'Constructive problem-solving'),
('highlight-4', 'RPT-001', 'concern', 'Some tension during feedback phase'),
('highlight-5', 'RPT-001', 'concern', 'Lower than average valence scores'),
('highlight-6', 'RPT-001', 'recommendation', 'Implement feedback guidelines'),
('highlight-7', 'RPT-001', 'recommendation', 'Consider anonymous feedback options');

-- Insert sample feedback
INSERT INTO feedback (id, user_id, session_id, category, rating, comment, timestamp, status) VALUES
('feedback-1', 'user-1', 'SES-003', 'suggestions', 4, 'The mindfulness suggestion was very helpful during the stressful moment.', DATE_SUB(NOW(), INTERVAL 1 DAY), 'reviewed');

-- Insert sample user settings
INSERT INTO user_settings (user_id, emotion_sensitivity, enable_webcam, enable_microphone, detection_frequency) VALUES
('user-1', 75, TRUE, TRUE, 'medium'),
('user-2', 80, TRUE, TRUE, 'high');
