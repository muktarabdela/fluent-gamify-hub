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
    `
};

module.exports = {
    tableQueries
};
