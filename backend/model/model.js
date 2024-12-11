const mongoose = require('mongoose');

// Define the schema for each model
const unitSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    order_number: { type: Number, required: true },
    total_lessons: { type: Number, default: 0 },
    completed_lessons: { type: Number, default: 0 },
    progress_percentage: { type: Number, default: 0.00 },
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const lessonSchema = new mongoose.Schema({
    unit_id: { type: String, required: true }, // Or ObjectId if using ObjectId
    title: { type: String, required: true },
    description: String,
    order_number: { type: Number, required: true },
    grammar_focus: [String],  // Store array of grammar points
    vocabulary_words: { type: Number, default: 0 },
    vocabulary_phrases: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now }
});

const dialogueSchema = new mongoose.Schema({
    lesson_id: { type: String, required: true },
    speaker_name: { type: String, required: true },
    speaker_role: String,
    sequence_order: { type: Number, required: true },
    content: { type: String, required: true },
    audio_url: String,
    created_at: { type: Date, default: Date.now }
});

const quickLessonSchema = new mongoose.Schema({
    lesson_id: { type: String, required: true },
    title: { type: String, required: true },
    introduction: { type: String, required: true },
    grammar_focus: [String],
    vocabulary_words: [String],
    vocabulary_phrases: [String],
    key_points: [String],
    example_sentences: [String],
    image_url: String,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const exerciseSchema = new mongoose.Schema({
    lesson_id: { type: String, required: true },
    type: { type: String, enum: ['sentence_building', 'multiple_choice', 'shadowing', 'fill_blank'], required: true },
    question: { type: String, required: true },
    correct_answer: { type: String, required: true },
    options: [String],  // Store array of options
    audio_url: String,
    image_url: String,
    order_number: { type: Number, required: true },
    created_at: { type: Date, default: Date.now }
});

const userProgressSchema = new mongoose.Schema({
    user_id: { type: String, required: true },  // For Telegram user ID
    lesson_id: { type: String, required: true },
    exercise_id:  { type: String, required: true },
    status: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed', 'locked'],
        default: 'not_started'
    },
    score: { type: Number, default: 0 },
    attempts: { type: Number, default: 0 },
    last_attempt_date: Date,
    completion_date: Date,
    time_spent_seconds: { type: Number, default: 0 },
    mistakes_made: [String],  // Store array of mistake details
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
    user_id: { type: String, required: true },  // Telegram user ID
    username: String,
    first_name: { type: String, required: true },
    last_name: String,
    auth_date: Date,
    country: String,
    interests: [String],
    like_coins: { type: Number, default: 0 },
    onboarding_completed: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const userStreakSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    current_streak: { type: Number, default: 0 },
    longest_streak: { type: Number, default: 0 },
    last_activity_date: Date,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const liveSessionSchema = new mongoose.Schema({
    session_type: { type: String, enum: ['lesson', 'free_talk'], required: true },
    lesson_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },  // NULL for free_talk sessions
    topic: { type: String, required: true },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
    start_time: { type: Date, required: true },
    inviteLink: String,
    duration: { type: Number, default: 20 },
    max_participants: { type: Number, default: 4 },
    current_participants: { type: Number, default: 0 },
    status: { type: String, enum: ['Scheduled', 'Ongoing', 'Cancelled'], default: 'Scheduled' },
    host_user_id: { type: String },
    telegram_chat_id: { type: String, required: true },
    description: String,  // New field for session description
    about: String,  // New field for session about information
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const telegramGroupSchema = new mongoose.Schema({
    group_id: { type: String, required: true },
    telegram_chat_id: { type: String, required: true },
    status: { type: String, enum: ['available', 'in_use', 'archived'], default: 'available' },
    created_at: { type: Date, default: Date.now },
    last_used_at: Date,
    updated_at: { type: Date, default: Date.now }
});

const liveSessionParticipantSchema = new mongoose.Schema({
    session_id:  { type: String, required: true },
    user_id: { type: String, required: true },
    status: { type: String, enum: ['joined', 'completed', 'left'], default: 'joined' },
    joined_at: { type: Date, default: Date.now },
    completed_at: Date
});

const lessonStatusSchema = new mongoose.Schema({
    lesson_id: { type: String, required: true },
    unit_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
    user_id: { type: String, required: true },
    status: { type: String, enum: ['locked', 'active', 'completed'], default: 'locked' },
    unlock_date: Date,
    completion_date: Date,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const topicSchema = new mongoose.Schema({
    name: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
});

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const exerciseTypeSchema = new mongoose.Schema({
    category_id:  { type: String, required: true },
    name: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const practiceExerciseSchema = new mongoose.Schema({
    type_id:  { type: String, required: true },
    topic_id: { type: String, required: true },
    topic: { type: String, required: true },
    content: { type: Object, required: true },  // Store JSON content
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

// Create models
const Unit = mongoose.model('Unit', unitSchema);
const Lesson = mongoose.model('Lesson', lessonSchema);
const Dialogue = mongoose.model('Dialogue', dialogueSchema);
const QuickLesson = mongoose.model('QuickLesson', quickLessonSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);
const UserProgress = mongoose.model('UserProgress', userProgressSchema);
const User = mongoose.model('User', userSchema);
const UserStreak = mongoose.model('UserStreak', userStreakSchema);
const LiveSession = mongoose.model('LiveSession', liveSessionSchema);
const TelegramGroup = mongoose.model('TelegramGroup', telegramGroupSchema);
const LiveSessionParticipant = mongoose.model('LiveSessionParticipant', liveSessionParticipantSchema);
const LessonStatus = mongoose.model('LessonStatus', lessonStatusSchema);
const Topic = mongoose.model('Topic', topicSchema);
const Category = mongoose.model('Category', categorySchema);
const ExerciseType = mongoose.model('ExerciseType', exerciseTypeSchema);
const PracticeExercise = mongoose.model('PracticeExercise', practiceExerciseSchema);

module.exports = {
    Unit,
    Lesson,
    Dialogue,
    QuickLesson,
    Exercise,
    UserProgress,
    User,
    UserStreak,
    LiveSession,
    TelegramGroup,
    LiveSessionParticipant,
    LessonStatus,
    Topic,
    Category,
    ExerciseType,
    PracticeExercise
};
