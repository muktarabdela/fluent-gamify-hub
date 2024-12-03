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
            status ENUM('not_started', 'in_progress', 'completed') NOT NULL DEFAULT 'not_started',
            score INT DEFAULT 0,
            attempts INT DEFAULT 0,
            last_attempt_date TIMESTAMP,
            completion_date TIMESTAMP,
            time_spent_seconds INT DEFAULT 0,
            mistakes_made JSON,  -- Store array of mistake details
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (lesson_id) REFERENCES Lessons(lesson_id),
            FOREIGN KEY (exercise_id) REFERENCES Exercises(exercise_id),
            FOREIGN KEY (user_id) REFERENCES Users(user_id),
            INDEX idx_user_lesson (user_id, lesson_id),  -- Composite index for faster queries
            INDEX idx_status (status)  -- Index for status-based queries
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
            lesson_id INT,
            topic VARCHAR(255) NOT NULL,
            level ENUM('Beginner', 'Intermediate', 'Advanced') NOT NULL,
            start_time DATETIME NOT NULL,
            inviteLink VARCHAR(255) DEFAULT NULL,
            duration VARCHAR(50) NOT NULL,
            max_participants INT NOT NULL DEFAULT 4,
            current_participants INT DEFAULT 0,
            status ENUM('Scheduled', 'Ongoing', 'Cancelled') DEFAULT 'Scheduled',
            host_user_id BIGINT,
            telegram_chat_id BIGINT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (lesson_id) REFERENCES Lessons(lesson_id),
            FOREIGN KEY (host_user_id) REFERENCES Users(user_id),
            FOREIGN KEY (telegram_chat_id) REFERENCES TelegramGroups(telegram_chat_id)
        )
    `,

    createTelegramGroupsTable: `
        CREATE TABLE IF NOT EXISTS TelegramGroups (
            telegram_chat_id BIGINT PRIMARY KEY,
            group_name VARCHAR(255),
            status ENUM('available', 'in_use', 'archived') DEFAULT 'available',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_used_at TIMESTAMP NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY idx_telegram_chat_id (telegram_chat_id)
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
    `,

    createLessonStatusTable: `
        CREATE TABLE IF NOT EXISTS LessonStatus (
            status_id INT AUTO_INCREMENT PRIMARY KEY,
            lesson_id INT NOT NULL,
            unit_id INT NOT NULL,
            user_id BIGINT NOT NULL,
            status ENUM('locked', 'active', 'completed') DEFAULT 'locked',
            unlock_date TIMESTAMP NULL,
            completion_date TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (lesson_id) REFERENCES Lessons(lesson_id),
            FOREIGN KEY (unit_id) REFERENCES Units(unit_id),
            FOREIGN KEY (user_id) REFERENCES Users(user_id),
            INDEX idx_lesson_status (lesson_id, status),
            INDEX idx_unit_status (unit_id, status),
            UNIQUE KEY unique_lesson_user (lesson_id, user_id)
        )
    `,

    createTopicsTable: `
        CREATE TABLE IF NOT EXISTS Topics (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `,

    createCategoriesTable: `
        CREATE TABLE IF NOT EXISTS Categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `,
    createExerciseTypesTable: `
        CREATE TABLE IF NOT EXISTS ExerciseTypes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            category_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES Categories(id)
        )
    `,

    createPracticeExercisesTable: `
        CREATE TABLE IF NOT EXISTS PracticeExercises (
            id INT AUTO_INCREMENT PRIMARY KEY,
            type_id INT NOT NULL,
            topic_id INT NOT NULL,
            topic VARCHAR(100) NOT NULL,
            content JSON NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (type_id) REFERENCES ExerciseTypes(id)
        )
    `,
    // ###################################################
    //     createPracticeTopicsTable: `
    //         CREATE TABLE IF NOT EXISTS PracticeTopics (
    //             topic_id INT AUTO_INCREMENT PRIMARY KEY,
    //             title VARCHAR(255) NOT NULL,
    //             description TEXT,
    //             category ENUM('vocabulary', 'pronunciation', 'listening', 'grammar') NOT NULL,
    //             level ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
    //             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    //         )
    //     `,
    //     createPracticeVocabularyExercisesTable: `
    //         CREATE TABLE IF NOT EXISTS PracticeVocabularyExercises (
    //             exercise_id INT AUTO_INCREMENT PRIMARY KEY,
    //             topic_id INT NOT NULL,
    //             type ENUM('flashcard', 'word_association', 'picture_dictionary') NOT NULL,
    //             word VARCHAR(255) NOT NULL,
    //             image_url VARCHAR(255),
    //             definition TEXT NOT NULL,
    //             examples JSON,  -- Array of example sentences
    //             audio_url VARCHAR(255),
    //             translation VARCHAR(255),
    //             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    //             FOREIGN KEY (topic_id) REFERENCES PracticeTopics(topic_id)
    //         )
    //     `,

    //     createPracticePronunciationExercisesTable: `
    //         CREATE TABLE IF NOT EXISTS PracticePronunciationExercises (
    //             exercise_id INT AUTO_INCREMENT PRIMARY KEY,
    //             topic_id INT NOT NULL,
    //             type ENUM('word_pronunciation', 'shadowing', 'tongue_twisters') NOT NULL,
    //             content TEXT NOT NULL,
    //             phonetic_spelling VARCHAR(255),
    //             audio_url VARCHAR(255) NOT NULL,
    //             translation TEXT,
    //             hints TEXT,
    //             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    //             FOREIGN KEY (topic_id) REFERENCES PracticeTopics(topic_id)
    //         )
    //     `,
    //     createPracticeListeningExercisesTable: `
    //         CREATE TABLE IF NOT EXISTS PracticeListeningExercises (
    //             exercise_id INT AUTO_INCREMENT PRIMARY KEY,
    //             topic_id INT NOT NULL,
    //             type ENUM('video_story', 'dictation', 'audio_story') NOT NULL,
    //             title VARCHAR(255) NOT NULL,
    //             media_url VARCHAR(255) NOT NULL,  -- Can be video_url or audio_url
    //             transcript TEXT,
    //             caption TEXT,
    //             questions JSON,  -- For comprehension questions
    //             duration_seconds INT,
    //             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    //             FOREIGN KEY (topic_id) REFERENCES PracticeTopics(topic_id)
    //         )
    //     `,
    //     createPracticeGrammarExercisesTable: `
    //         CREATE TABLE IF NOT EXISTS PracticeGrammarExercises (
    //             exercise_id INT AUTO_INCREMENT PRIMARY KEY,
    //             topic_id INT NOT NULL,
    //             type ENUM('sentence_building', 'quiz', 'error_correction') NOT NULL,
    //             question TEXT NOT NULL,
    //             correct_answer TEXT NOT NULL,
    //             shuffled_words JSON,  -- For sentence building
    //             options JSON,         -- For multiple choice
    //             explanation TEXT,
    //             hints TEXT,
    //             grammar_point VARCHAR(255),
    //             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    //             FOREIGN KEY (topic_id) REFERENCES PracticeTopics(topic_id)
    //         )
    //     `,
    //     createUserPracticeProgressTable: `
    //         CREATE TABLE IF NOT EXISTS UserPracticeProgress (
    //             progress_id INT AUTO_INCREMENT PRIMARY KEY,
    //             user_id BIGINT NOT NULL,
    //             exercise_type ENUM('vocabulary', 'pronunciation', 'listening', 'grammar') NOT NULL,
    //             exercise_id INT NOT NULL,
    //             score INT DEFAULT 0,
    //             mistakes JSON,
    //             completed_at TIMESTAMP,
    //             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    //             FOREIGN KEY (user_id) REFERENCES Users(user_id)
    //         )
    //   `
};

module.exports = {
    tableQueries
};
