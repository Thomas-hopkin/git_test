-- Auto-set display_name to login_username for accounts that have never set one.
UPDATE accounts
SET display_name = login_username
WHERE display_name IS NULL;
