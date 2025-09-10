-- Database Enhancement Script for AuroraNotes
-- This script adds new features: folders, starred notes, word count, and reading time

-- 1. Create folders table FIRST
CREATE TABLE IF NOT EXISTS folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add new columns to notes table (after folders table exists)
ALTER TABLE notes 
ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reading_time INTEGER DEFAULT 0;

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notes_is_starred ON notes(user_id, is_starred);
CREATE INDEX IF NOT EXISTS idx_notes_folder_id ON notes(folder_id);
CREATE INDEX IF NOT EXISTS idx_notes_word_count ON notes(user_id, word_count);
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for folders
CREATE POLICY "Users can view own folders" ON folders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own folders" ON folders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own folders" ON folders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own folders" ON folders
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Update existing notes with calculated word count and reading time
UPDATE notes 
SET 
  word_count = array_length(string_to_array(trim(regexp_replace(content, '<[^>]*>', '', 'g')), ' '), 1),
  reading_time = GREATEST(1, array_length(string_to_array(trim(regexp_replace(content, '<[^>]*>', '', 'g')), ' '), 1) / 200)
WHERE word_count = 0 OR word_count IS NULL;

-- 7. Create function to automatically calculate word count and reading time
CREATE OR REPLACE FUNCTION calculate_note_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate word count (remove HTML tags first)
  NEW.word_count := array_length(
    string_to_array(
      trim(regexp_replace(NEW.content, '<[^>]*>', '', 'g')), 
      ' '
    ), 
    1
  );
  
  -- Calculate reading time (average 200 words per minute)
  NEW.reading_time := GREATEST(1, NEW.word_count / 200);
  
  -- Update timestamp
  NEW.updated_at := NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger to automatically update stats
DROP TRIGGER IF EXISTS trigger_calculate_note_stats ON notes;
CREATE TRIGGER trigger_calculate_note_stats
  BEFORE INSERT OR UPDATE OF content ON notes
  FOR EACH ROW
  EXECUTE FUNCTION calculate_note_stats();

-- 9. Create function to update folder timestamp
CREATE OR REPLACE FUNCTION update_folder_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Create trigger for folder timestamp
DROP TRIGGER IF EXISTS trigger_update_folder_timestamp ON folders;
CREATE TRIGGER trigger_update_folder_timestamp
  BEFORE UPDATE ON folders
  FOR EACH ROW
  EXECUTE FUNCTION update_folder_timestamp();

-- 11. Create default folders for existing users
INSERT INTO folders (user_id, name, color)
SELECT DISTINCT user_id, 'General', '#3b82f6'
FROM notes
WHERE user_id NOT IN (SELECT user_id FROM folders)
ON CONFLICT DO NOTHING;

-- 12. Add helpful comments
COMMENT ON TABLE folders IS 'User-created folders for organizing notes';
COMMENT ON COLUMN notes.is_starred IS 'Whether the note is starred/favorited by the user';
COMMENT ON COLUMN notes.folder_id IS 'ID of the folder containing this note';
COMMENT ON COLUMN notes.word_count IS 'Automatically calculated word count of the note content';
COMMENT ON COLUMN notes.reading_time IS 'Estimated reading time in minutes (200 words/minute)';
COMMENT ON COLUMN folders.color IS 'Hex color code for folder display';
COMMENT ON COLUMN folders.parent_id IS 'Parent folder ID for nested folder structure';
