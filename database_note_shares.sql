-- Create note shares table for collaborative editing
CREATE TABLE note_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES auth.users(id),
  shared_with UUID REFERENCES auth.users(id),
  permission TEXT CHECK (permission IN ('read', 'edit', 'admin')) DEFAULT 'read',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(note_id, shared_with)
);

-- Create index for better performance
CREATE INDEX idx_note_shares_note_id ON note_shares(note_id);
CREATE INDEX idx_note_shares_shared_with ON note_shares(shared_with);

-- Enable Row Level Security
ALTER TABLE note_shares ENABLE ROW LEVEL SECURITY;

-- Create policies for note_shares
CREATE POLICY "Users can view shares for notes they own or are shared with" ON note_shares
  FOR SELECT USING (
    shared_by = auth.uid() OR 
    shared_with = auth.uid() OR
    note_id IN (
      SELECT id FROM notes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Note owners can share notes" ON note_shares
  FOR INSERT WITH CHECK (
    shared_by = auth.uid() AND
    note_id IN (
      SELECT id FROM notes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Note owners can update shares" ON note_shares
  FOR UPDATE USING (
    shared_by = auth.uid() AND
    note_id IN (
      SELECT id FROM notes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Note owners can delete shares" ON note_shares
  FOR DELETE USING (
    shared_by = auth.uid() AND
    note_id IN (
      SELECT id FROM notes WHERE user_id = auth.uid()
    )
  );

-- Create function to check if user can edit a note
CREATE OR REPLACE FUNCTION can_edit_note(note_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is the owner
  IF EXISTS (
    SELECT 1 FROM notes 
    WHERE id = note_uuid AND user_id = user_uuid
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user has edit permission through sharing
  IF EXISTS (
    SELECT 1 FROM note_shares 
    WHERE note_id = note_uuid 
    AND shared_with = user_uuid 
    AND permission IN ('edit', 'admin')
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user can read a note
CREATE OR REPLACE FUNCTION can_read_note(note_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is the owner
  IF EXISTS (
    SELECT 1 FROM notes 
    WHERE id = note_uuid AND user_id = user_uuid
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user has any permission through sharing
  IF EXISTS (
    SELECT 1 FROM note_shares 
    WHERE note_id = note_uuid 
    AND shared_with = user_uuid
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update notes table RLS to include shared access
DROP POLICY IF EXISTS "Users can view their own notes" ON notes;
CREATE POLICY "Users can view their own notes and shared notes" ON notes
  FOR SELECT USING (
    user_id = auth.uid() OR
    can_read_note(id, auth.uid())
  );

-- Update notes table to allow updates from shared users
DROP POLICY IF EXISTS "Users can update their own notes" ON notes;
CREATE POLICY "Users can update their own notes and shared notes with edit permission" ON notes
  FOR UPDATE USING (
    user_id = auth.uid() OR
    can_edit_note(id, auth.uid())
  );

