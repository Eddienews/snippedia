
-- Snippedia - Simple MySQL Schema
-- Simplified database for dashboard, history and profile functionality

CREATE DATABASE IF NOT EXISTS snippedia_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE snippedia_db;

-- Users table (for profile functionality)
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_created_at (created_at)
);

-- Articles cache table (for storing Wikipedia article data)
CREATE TABLE IF NOT EXISTS articles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    wikipedia_id INT UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT,
    image_url TEXT,
    views_count INT DEFAULT 0,
    citations_count INT DEFAULT 0,
    read_time_minutes INT DEFAULT 0,
    tags JSON,
    categories JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_wikipedia_id (wikipedia_id),
    INDEX idx_title (title),
    INDEX idx_views_count (views_count),
    INDEX idx_created_at (created_at)
);

-- Reading history table (for history functionality)
CREATE TABLE IF NOT EXISTS reading_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    article_id INT NOT NULL,
    wikipedia_id INT NOT NULL,
    article_title VARCHAR(500) NOT NULL,
    article_image_url TEXT,
    time_spent_seconds INT DEFAULT 0,
    scroll_depth_percentage INT DEFAULT 0,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_id VARCHAR(100),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_article_id (article_id),
    INDEX idx_viewed_at (viewed_at),
    INDEX idx_session_id (session_id),
    INDEX idx_user_date (user_id, viewed_at)
);

-- Favorites table (for profile/dashboard functionality)
CREATE TABLE IF NOT EXISTS favorites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    article_id INT NOT NULL,
    wikipedia_id INT NOT NULL,
    article_title VARCHAR(500) NOT NULL,
    article_image_url TEXT,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_user_article (user_id, article_id),
    INDEX idx_user_id (user_id),
    INDEX idx_article_id (article_id),
    INDEX idx_added_at (added_at)
);

-- Reading stats summary (for dashboard functionality)
CREATE TABLE IF NOT EXISTS user_reading_stats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    total_articles_read INT DEFAULT 0,
    total_time_spent_seconds INT DEFAULT 0,
    articles_this_week INT DEFAULT 0,
    articles_this_month INT DEFAULT 0,
    current_streak_days INT DEFAULT 0,
    longest_streak_days INT DEFAULT 0,
    favorite_categories JSON,
    last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_user_stats (user_id),
    INDEX idx_user_id (user_id),
    INDEX idx_last_calculated (last_calculated)
);

-- Search history table (for improved user experience)
CREATE TABLE IF NOT EXISTS search_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    search_query VARCHAR(500) NOT NULL,
    results_count INT DEFAULT 0,
    searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_searched_at (searched_at),
    INDEX idx_search_query (search_query)
);

-- Views to simplify data access
CREATE VIEW user_dashboard_stats AS
SELECT 
    u.id as user_id,
    u.username,
    u.display_name,
    COALESCE(urs.total_articles_read, 0) as total_articles,
    COALESCE(urs.total_time_spent_seconds, 0) as total_time_seconds,
    COALESCE(urs.articles_this_week, 0) as weekly_articles,
    COALESCE(urs.articles_this_month, 0) as monthly_articles,
    COALESCE(urs.current_streak_days, 0) as current_streak,
    (SELECT COUNT(*) FROM favorites f WHERE f.user_id = u.id) as total_favorites,
    (SELECT COUNT(*) FROM reading_history rh WHERE rh.user_id = u.id AND rh.viewed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as week_articles,
    (SELECT AVG(rh.time_spent_seconds) FROM reading_history rh WHERE rh.user_id = u.id AND rh.time_spent_seconds > 0) as avg_reading_time
FROM users u
LEFT JOIN user_reading_stats urs ON u.id = urs.user_id
WHERE u.is_active = TRUE;

CREATE VIEW recent_reading_activity AS
SELECT 
    rh.id,
    rh.user_id,
    rh.article_title,
    rh.article_image_url,
    rh.time_spent_seconds,
    rh.viewed_at,
    u.username
FROM reading_history rh
JOIN users u ON rh.user_id = u.id
ORDER BY rh.viewed_at DESC;

-- Stored procedures for common operations
DELIMITER //

-- Procedure to add reading history and update stats
CREATE PROCEDURE AddReadingHistory(
    IN p_user_id INT,
    IN p_wikipedia_id INT,
    IN p_article_title VARCHAR(500),
    IN p_article_image_url TEXT,
    IN p_time_spent INT,
    IN p_scroll_depth INT
)
BEGIN
    DECLARE article_id_var INT;
    
    -- Insert or get article
    INSERT INTO articles (wikipedia_id, title, image_url, views_count)
    VALUES (p_wikipedia_id, p_article_title, p_article_image_url, 1)
    ON DUPLICATE KEY UPDATE views_count = views_count + 1;
    
    SELECT id INTO article_id_var FROM articles WHERE wikipedia_id = p_wikipedia_id;
    
    -- Insert reading history
    INSERT INTO reading_history (
        user_id, article_id, wikipedia_id, article_title, 
        article_image_url, time_spent_seconds, scroll_depth_percentage
    ) VALUES (
        p_user_id, article_id_var, p_wikipedia_id, p_article_title,
        p_article_image_url, p_time_spent, p_scroll_depth
    );
    
    -- Update user stats
    INSERT INTO user_reading_stats (user_id, total_articles_read, total_time_spent_seconds)
    VALUES (p_user_id, 1, p_time_spent)
    ON DUPLICATE KEY UPDATE 
        total_articles_read = total_articles_read + 1,
        total_time_spent_seconds = total_time_spent_seconds + p_time_spent,
        last_calculated = CURRENT_TIMESTAMP;
END//

-- Procedure to calculate weekly and monthly stats
CREATE PROCEDURE UpdateUserStats(IN p_user_id INT)
BEGIN
    DECLARE week_count INT DEFAULT 0;
    DECLARE month_count INT DEFAULT 0;
    
    -- Calculate articles this week
    SELECT COUNT(*) INTO week_count
    FROM reading_history 
    WHERE user_id = p_user_id 
    AND viewed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY);
    
    -- Calculate articles this month
    SELECT COUNT(*) INTO month_count
    FROM reading_history 
    WHERE user_id = p_user_id 
    AND viewed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY);
    
    -- Update stats
    INSERT INTO user_reading_stats (user_id, articles_this_week, articles_this_month)
    VALUES (p_user_id, week_count, month_count)
    ON DUPLICATE KEY UPDATE 
        articles_this_week = week_count,
        articles_this_month = month_count,
        last_calculated = CURRENT_TIMESTAMP;
END//

DELIMITER ;

-- Triggers for automatic stats updates
DELIMITER //

CREATE TRIGGER update_stats_on_reading
AFTER INSERT ON reading_history
FOR EACH ROW
BEGIN
    CALL UpdateUserStats(NEW.user_id);
END//

DELIMITER ;

-- Insert sample data for testing
INSERT INTO users (email, username, display_name) VALUES
('demo@snippedia.com', 'demo_user', 'Demo User'),
('test@snippedia.com', 'test_user', 'Test User');

-- Configure database users and privileges outside this schema file.

-- Optimization settings
-- SET GLOBAL innodb_buffer_pool_size = 128M;
-- SET GLOBAL query_cache_size = 64M;
-- SET GLOBAL query_cache_type = 1;

-- Comments for maintenance
-- Run this to clean old data: DELETE FROM reading_history WHERE viewed_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
-- Run this to recalculate stats: CALL UpdateUserStats(user_id);