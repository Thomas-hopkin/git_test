-- Fix characters stuck in "partial save" state where last_logout is NULL.
-- This happens when the server crashes before the first proper save occurs.
-- Setting last_logout to the current timestamp unblocks login.
UPDATE characters
SET last_logout = CURRENT_TIMESTAMP
WHERE last_logout IS NULL;
