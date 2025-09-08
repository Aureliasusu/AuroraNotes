-- Add sort_order column to notes table
ALTER TABLE notes ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Update existing notes with sort_order based on updated_at
UPDATE notes 
SET sort_order = EXTRACT(EPOCH FROM updated_at)::INTEGER 
WHERE sort_order IS NULL OR sort_order = 0;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_notes_sort_order ON notes(user_id, sort_order);

-- Update the RLS policy to include sort_order
-- (This is just for reference, the existing policies should work fine)
