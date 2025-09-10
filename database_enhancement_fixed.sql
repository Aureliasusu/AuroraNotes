-- Database Enhancement Script for AuroraNotes (Fixed Version)
-- Execute this script step by step in Supabase SQL Editor

-- Step 1: Create folders table first
CREATE TABLE IF NOT EXISTS folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Add new columns to notes table
ALTER TABLE notes 
ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reading_time INTEGER DEFAULT 0;

-- Step 3: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notes_is_starred ON notes(user_id, is_starred);
CREATE INDEX IF NOT EXISTS idx_notes_folder_id ON notes(folder_id);
CREATE INDEX IF NOT EXISTS idx_notes_word_count ON notes(user_id, word_count);
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id);

-- Step 4: Enable Row Level Security (RLS)
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies for folders
CREATE POLICY "Users can view own folders" ON folders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own folders" ON folders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own folders" ON folders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own folders" ON folders
  FOR DELETE USING (auth.uid() = user_id);

-- Step 6: Update existing notes with calculated word count and reading time
UPDATE notes 
SET 
  word_count = array_length(string_to_array(trim(regexp_replace(content, '<[^>]*>', '', 'g')), ' '), 1),
  reading_time = GREATEST(1, array_length(string_to_array(trim(regexp_replace(content, '<[^>]*>', '', 'g')), ' '), 1) / 200)
WHERE word_count = 0 OR word_count IS NULL;

-- Step 7: Create function to automatically calculate word count and reading time
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

-- Step 8: Create trigger to automatically update stats
DROP TRIGGER IF EXISTS trigger_calculate_note_stats ON notes;
CREATE TRIGGER trigger_calculate_note_stats
  BEFORE INSERT OR UPDATE OF content ON notes
  FOR EACH ROW
  EXECUTE FUNCTION calculate_note_stats();

-- Step 9: Create function to update folder timestamp
CREATE OR REPLACE FUNCTION update_folder_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 10: Create trigger for folder timestamp
DROP TRIGGER IF EXISTS trigger_update_folder_timestamp ON folders;
CREATE TRIGGER trigger_update_folder_timestamp
  BEFORE UPDATE ON folders
  FOR EACH ROW
  EXECUTE FUNCTION update_folder_timestamp();

-- Step 11: Create default folders for existing users
INSERT INTO folders (user_id, name, color)
SELECT DISTINCT user_id, 'General', '#3b82f6'
FROM notes
WHERE user_id NOT IN (SELECT user_id FROM folders)
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Database enhancement completed successfully!' as message;
