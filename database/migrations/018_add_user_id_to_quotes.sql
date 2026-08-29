SET @user_id_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'quotes'
      AND COLUMN_NAME = 'user_id'
);

SET @add_user_id_sql = IF(
    @user_id_exists = 0,
    'ALTER TABLE quotes ADD COLUMN user_id INT NULL, ADD INDEX idx_quotes_user_id (user_id)',
    'SELECT 1'
);

PREPARE add_user_id_stmt FROM @add_user_id_sql;
EXECUTE add_user_id_stmt;
DEALLOCATE PREPARE add_user_id_stmt;
