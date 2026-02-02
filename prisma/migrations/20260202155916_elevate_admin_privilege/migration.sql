-- Elevate admin@conexa.com to MATRIZ_ADMIN role
-- This migration ensures the main admin user has full system access

UPDATE "User" 
SET "role" = 'MATRIZ_ADMIN' 
WHERE "email" = 'admin@conexa.com';
