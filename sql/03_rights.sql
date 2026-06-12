CREATE USER 'dentilib_user'@'localhost' IDENTIFIED BY 'password';

GRANT SELECT, INSERT, UPDATE, DELETE ON dentilib.* TO 'dentilib_user'@'localhost';

FLUSH PRIVILEGES;