USE Chanitec;

SET @permissions_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'permissions'
);

SET @add_permissions_sql = IF(
    @permissions_exists = 0,
    'ALTER TABLE users ADD COLUMN permissions TEXT NULL',
    'SELECT 1'
);

PREPARE add_permissions_stmt FROM @add_permissions_sql;
EXECUTE add_permissions_stmt;
DEALLOCATE PREPARE add_permissions_stmt;

UPDATE users
SET permissions = '["all"]'
WHERE role = 'admin'
  AND (permissions IS NULL OR permissions = '');

UPDATE users
SET permissions = '["home","quote","history","clients","items","intervention","planning","org-chart","help"]'
WHERE role = 'editor'
  AND (permissions IS NULL OR permissions = '');

UPDATE users
SET permissions = '["home","quote","history","planning","help"]'
WHERE role = 'user'
  AND (permissions IS NULL OR permissions = '');

UPDATE users
SET permissions = '["home","history","planning","help"]'
WHERE role = 'viewer'
  AND (permissions IS NULL OR permissions = '');
