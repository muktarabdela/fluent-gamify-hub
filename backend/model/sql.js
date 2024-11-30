const tableQueries = {
    createUnitsTable: `
        CREATE TABLE IF NOT EXISTS Units (
            unit_id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            order_number INT NOT NULL,
            total_lessons INT DEFAULT 0,
            completed_lessons INT DEFAULT 0,
            progress_percentage DECIMAL(5,2) DEFAULT 0.00,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `,

    createLessonsTable: `
        CREATE TABLE IF NOT EXISTS Lessons (
            lesson_id INT AUTO_INCREMENT PRIMARY KEY,
            unit_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            order_number INT NOT NULL,
            grammar_focus JSON,  -- Store array of grammar points
            vocabulary_words INT DEFAULT 0,
            vocabulary_phrases INT DEFAULT 0,
            status ENUM('locked', 'active', 'completed') DEFAULT 'locked',
            live_session_title VARCHAR(255),
            live_session_duration VARCHAR(50),
            live_session_max_participants INT DEFAULT 4,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (unit_id) REFERENCES Units(unit_id)
        )
    `,

    createDialoguesTable: `
        CREATE TABLE IF NOT EXISTS Dialogues (
            dialogue_id INT AUTO_INCREMENT PRIMARY KEY,
            lesson_id INT NOT NULL,
            speaker_name VARCHAR(100) NOT NULL,
            speaker_role VARCHAR(100),
            sequence_order INT NOT NULL,
            content TEXT NOT NULL,
            audio_url VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (lesson_id) REFERENCES Lessons(lesson_id)
        )
    `,
    createQuickLessonsTable: `
    CREATE TABLE IF NOT EXISTS QuickLessons (
        quick_lesson_id INT AUTO_INCREMENT PRIMARY KEY,
        lesson_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        introduction TEXT NOT NULL,
        grammar_focus JSON,
        vocabulary_words JSON,
        vocabulary_phrases JSON,
        key_points JSON,
        example_sentences JSON,
        image_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (lesson_id) REFERENCES Lessons(lesson_id)
    )
    `,

    createExercisesTable: `
        CREATE TABLE IF NOT EXISTS Exercises (
            exercise_id INT AUTO_INCREMENT PRIMARY KEY,
            lesson_id INT NOT NULL,
            type ENUM('sentence_building', 'multiple_choice', 'shadowing', 'fill_blank') NOT NULL,
            question TEXT NOT NULL,
            correct_answer TEXT NOT NULL,
            options JSON,  -- Store array of options
            audio_url VARCHAR(255),
            image_url VARCHAR(255),
            order_number INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (lesson_id) REFERENCES Lessons(lesson_id)
        )
    `,

    createUserProgressTable: `
        CREATE TABLE IF NOT EXISTS UserProgress (
            progress_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id BIGINT NOT NULL,  -- For Telegram user ID
            lesson_id INT NOT NULL,
            exercise_id INT,
            status ENUM('started', 'completed') NOT NULL,
            score INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (lesson_id) REFERENCES Lessons(lesson_id),
            FOREIGN KEY (exercise_id) REFERENCES Exercises(exercise_id)
        )
    `,

    createUsersTable: `
        CREATE TABLE IF NOT EXISTS Users (
            user_id BIGINT PRIMARY KEY,  -- Telegram user ID
            username VARCHAR(255),
            first_name VARCHAR(255) NOT NULL,
            last_name VARCHAR(255) DEFAULT NULL,
            auth_date TIMESTAMP,
            country VARCHAR(255),
            interests JSON,
            like_coins INT DEFAULT 0,
            onboarding_completed BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `,

    createStreaksTable: `
        CREATE TABLE IF NOT EXISTS UserStreaks (
            streak_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id BIGINT NOT NULL,
            current_streak INT DEFAULT 0,
            longest_streak INT DEFAULT 0,
            last_activity_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES Users(user_id)
        )
    `,

    createLiveSessionsTable: `
    CREATE TABLE IF NOT EXISTS LiveSessions (
        session_id INT AUTO_INCREMENT PRIMARY KEY,
        session_type ENUM('lesson', 'free_talk') NOT NULL,
        lesson_id INT,  -- NULL for free_talk sessions
        topic VARCHAR(255) NOT NULL,
        level ENUM('Beginner', 'Intermediate', 'Advanced') NOT NULL,
        start_time DATETIME NOT NULL,
        inviteLink VARCHAR(255) DEFAULT NULL,
        duration VARCHAR(50) NOT NULL,
        max_participants INT NOT NULL DEFAULT 4,
        current_participants INT DEFAULT 0,
        status ENUM('Scheduled', 'Ongoing', 'Cancelled') DEFAULT 'Scheduled',
        host_user_id BIGINT,
            telegram_chat_id BIGINT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (lesson_id) REFERENCES Lessons(lesson_id),
            FOREIGN KEY (host_user_id) REFERENCES Users(user_id),
            FOREIGN KEY (telegram_chat_id) REFERENCES TelegramGroups(group_id)
        )
    `,

    createTelegramGroupsTable: `
        CREATE TABLE IF NOT EXISTS TelegramGroups (
            group_id INT AUTO_INCREMENT PRIMARY KEY,
            telegram_chat_id BIGINT NOT NULL,
            status ENUM('available', 'in_use', 'archived') DEFAULT 'available',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_used_at TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `,

    createLiveSessionParticipantsTable: `
        CREATE TABLE IF NOT EXISTS LiveSessionParticipants (
            participant_id INT AUTO_INCREMENT PRIMARY KEY,
            session_id INT NOT NULL,
            user_id BIGINT NOT NULL,
            status ENUM('joined', 'completed', 'left') DEFAULT 'joined',
            joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP NULL,
            FOREIGN KEY (session_id) REFERENCES LiveSessions(session_id),
            FOREIGN KEY (user_id) REFERENCES Users(user_id),
            UNIQUE KEY unique_session_user (session_id, user_id)
        )
    `
};

module.exports = {
    tableQueries
};
