-- Add profile fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS display_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS wallpaper_url TEXT,
ADD COLUMN IF NOT EXISTS theme VARCHAR(20) DEFAULT 'system';

-- Add index for faster profile lookups
CREATE INDEX IF NOT EXISTS idx_users_display_name ON users(display_name);