
-- ... keep existing code (database creation and initial tables - users, articles, reading_history, favorites, user_engagement, reading_stats, reading_sessions, article_comments, reading_goals, user_achievements, analytics_cache)

-- Tabela de notificações do usuário
CREATE TABLE IF NOT EXISTS user_notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    notification_type ENUM('achievement', 'goal', 'insight', 'reminder', 'milestone') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSON, -- dados específicos da notificação
    is_read BOOLEAN DEFAULT FALSE,
    is_dismissed BOOLEAN DEFAULT FALSE,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_notification_type (notification_type),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at),
    INDEX idx_priority (priority),
    INDEX idx_user_unread (user_id, is_read)
);

-- Tabela de sugestões de insights
CREATE TABLE IF NOT EXISTS insight_suggestions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    insight_type ENUM('improvement', 'achievement', 'trend', 'recommendation') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    actionable_suggestion TEXT NOT NULL,
    impact_level ENUM('high', 'medium', 'low') NOT NULL,
    confidence_score INT DEFAULT 0, -- 0-100
    data_source JSON, -- dados usados para gerar o insight
    is_active BOOLEAN DEFAULT TRUE,
    is_dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    dismissed_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_insight_type (insight_type),
    INDEX idx_is_active (is_active),
    INDEX idx_impact_level (impact_level),
    INDEX idx_created_at (created_at),
    INDEX idx_user_active (user_id, is_active)
);

-- Tabela de histórico de progresso das metas
CREATE TABLE IF NOT EXISTS goal_progress_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    goal_id INT NOT NULL,
    user_id INT NOT NULL,
    progress_value INT NOT NULL,
    progress_percentage DECIMAL(5,2) NOT NULL,
    milestone_reached BOOLEAN DEFAULT FALSE,
    milestone_name VARCHAR(255),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    
    FOREIGN KEY (goal_id) REFERENCES reading_goals(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_goal_id (goal_id),
    INDEX idx_user_id (user_id),
    INDEX idx_recorded_at (recorded_at),
    INDEX idx_milestone_reached (milestone_reached),
    INDEX idx_goal_progress (goal_id, recorded_at)
);

-- Tabela de comparação de períodos (cache)
CREATE TABLE IF NOT EXISTS period_comparisons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    period_type ENUM('week', 'month', 'quarter', 'year') NOT NULL,
    current_period_start DATE NOT NULL,
    current_period_end DATE NOT NULL,
    previous_period_start DATE NOT NULL,
    previous_period_end DATE NOT NULL,
    comparison_data JSON NOT NULL, -- dados da comparação
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_period_type (period_type),
    INDEX idx_calculated_at (calculated_at),
    INDEX idx_expires_at (expires_at),
    INDEX idx_user_period (user_id, period_type)
);

-- Tabela de configurações de metas customizáveis
CREATE TABLE IF NOT EXISTS custom_goal_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    template_name VARCHAR(255) NOT NULL,
    description TEXT,
    goal_type ENUM('reading_time', 'articles_count', 'categories_explored', 'streak_days', 'custom') NOT NULL,
    target_value INT NOT NULL,
    target_unit VARCHAR(50) NOT NULL,
    duration_days INT NOT NULL,
    reminder_frequency ENUM('daily', 'weekly', 'never') DEFAULT 'weekly',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_goal_type (goal_type),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at)
);

-- ... keep existing code (triggers, views, procedures)

-- Novos triggers para as funcionalidades avançadas
DELIMITER //

-- Trigger para criar notificação quando meta é atingida
CREATE TRIGGER notify_goal_achievement
AFTER UPDATE ON reading_goals
FOR EACH ROW
BEGIN
    IF NEW.achieved_at IS NOT NULL AND OLD.achieved_at IS NULL THEN
        INSERT INTO user_notifications (
            user_id, 
            notification_type, 
            title, 
            message, 
            data,
            priority
        ) VALUES (
            NEW.user_id,
            'goal',
            'Meta Alcançada!',
            CONCAT('Parabéns! Você alcançou sua meta de ', NEW.target_value, ' ', NEW.target_unit, '.'),
            JSON_OBJECT('goal_id', NEW.id, 'goal_type', NEW.goal_type),
            'high'
        );
    END IF;
END//

-- Trigger para registrar progresso das metas
CREATE TRIGGER track_goal_progress
AFTER UPDATE ON reading_goals
FOR EACH ROW
BEGIN
    IF NEW.current_progress != OLD.current_progress THEN
        INSERT INTO goal_progress_history (
            goal_id,
            user_id,
            progress_value,
            progress_percentage,
            milestone_reached
        ) VALUES (
            NEW.id,
            NEW.user_id,
            NEW.current_progress,
            (NEW.current_progress * 100.0 / NEW.target_value),
            (NEW.current_progress >= NEW.target_value)
        );
    END IF;
END//

-- Trigger para gerar insights automáticos
CREATE TRIGGER generate_insights_on_activity
AFTER INSERT ON reading_history
FOR EACH ROW
BEGIN
    DECLARE user_articles_count INT;
    DECLARE user_avg_time DECIMAL(10,2);
    
    -- Contar artigos do usuário na última semana
    SELECT COUNT(*) INTO user_articles_count
    FROM reading_history 
    WHERE user_id = NEW.user_id 
    AND viewed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY);
    
    -- Calcular tempo médio de leitura
    SELECT AVG(time_spent) INTO user_avg_time
    FROM reading_history 
    WHERE user_id = NEW.user_id 
    AND time_spent > 0;
    
    -- Gerar insight se leitura está abaixo da média
    IF user_articles_count >= 10 AND user_avg_time < 120000 THEN
        INSERT INTO insight_suggestions (
            user_id,
            insight_type,
            title,
            description,
            actionable_suggestion,
            impact_level,
            confidence_score,
            data_source
        ) VALUES (
            NEW.user_id,
            'improvement',
            'Tempo de Leitura Baixo',
            'Seu tempo médio de leitura está abaixo de 2 minutos por artigo.',
            'Tente se concentrar em menos artigos, mas com leitura mais profunda.',
            'medium',
            75,
            JSON_OBJECT('avg_time', user_avg_time, 'articles_count', user_articles_count)
        )
        ON DUPLICATE KEY UPDATE
            updated_at = CURRENT_TIMESTAMP;
    END IF;
END//

DELIMITER ;

-- Novos índices para performance das funcionalidades avançadas
ALTER TABLE reading_history ADD INDEX idx_user_time_week (user_id, viewed_at, time_spent);
ALTER TABLE user_notifications ADD INDEX idx_user_type_unread (user_id, notification_type, is_read);
ALTER TABLE insight_suggestions ADD INDEX idx_user_type_active (user_id, insight_type, is_active);

-- Novas views para relatórios avançados
CREATE VIEW user_goal_progress AS
SELECT 
    rg.id as goal_id,
    rg.user_id,
    u.username,
    rg.goal_type,
    rg.target_value,
    rg.target_unit,
    rg.current_progress,
    ROUND((rg.current_progress * 100.0 / rg.target_value), 2) as progress_percentage,
    rg.start_date,
    rg.end_date,
    rg.is_active,
    rg.achieved_at,
    CASE 
        WHEN rg.achieved_at IS NOT NULL THEN 'achieved'
        WHEN rg.end_date < CURDATE() THEN 'expired'
        WHEN rg.is_active = 1 THEN 'active'
        ELSE 'inactive'
    END as status
FROM reading_goals rg
JOIN users u ON rg.user_id = u.id;

CREATE VIEW user_insights_summary AS
SELECT 
    is_table.user_id,
    u.username,
    COUNT(*) as total_insights,
    COUNT(CASE WHEN is_table.is_active = 1 THEN 1 END) as active_insights,
    COUNT(CASE WHEN is_table.impact_level = 'high' THEN 1 END) as high_impact_insights,
    AVG(is_table.confidence_score) as avg_confidence,
    MAX(is_table.created_at) as last_insight_date
FROM insight_suggestions is_table
JOIN users u ON is_table.user_id = u.id
GROUP BY is_table.user_id, u.username;

-- Procedimento para limpeza automática
DELIMITER //
CREATE PROCEDURE CleanAdvancedFeaturesData(IN days_to_keep INT DEFAULT 90)
BEGIN
    -- Limpar notificações antigas lidas
    DELETE FROM user_notifications 
    WHERE is_read = TRUE 
    AND read_at < DATE_SUB(NOW(), INTERVAL days_to_keep DAY);
    
    -- Limpar insights dismissados antigos
    DELETE FROM insight_suggestions 
    WHERE is_dismissed = TRUE 
    AND dismissed_at < DATE_SUB(NOW(), INTERVAL days_to_keep DAY);
    
    -- Limpar cache de comparação de períodos expirado
    DELETE FROM period_comparisons 
    WHERE expires_at < NOW();
    
    -- Limpar histórico de progresso muito antigo
    DELETE FROM goal_progress_history 
    WHERE recorded_at < DATE_SUB(NOW(), INTERVAL (days_to_keep * 2) DAY);
    
    OPTIMIZE TABLE user_notifications, insight_suggestions, period_comparisons, goal_progress_history;
END//
DELIMITER ;

-- ... keep existing code (final comments)
