-- 创建 note_shares 表
-- 在 Supabase SQL Editor 中执行

-- 1. 删除现有的 note_shares 表（如果存在）
DROP TABLE IF EXISTS note_shares CASCADE;

-- 2. 创建 note_shares 表
CREATE TABLE note_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES auth.users(id),
  shared_with UUID REFERENCES auth.users(id),
  permission TEXT CHECK (permission IN ('read', 'edit', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(note_id, shared_with)
);

-- 3. 启用 RLS
ALTER TABLE note_shares ENABLE ROW LEVEL SECURITY;

-- 4. 创建 RLS 策略
CREATE POLICY "Users can view their shares" ON note_shares
  FOR SELECT TO authenticated USING (shared_with = auth.uid());

CREATE POLICY "Users can create shares" ON note_shares
  FOR INSERT TO authenticated WITH CHECK (
    shared_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM notes 
      WHERE id = note_shares.note_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their shares" ON note_shares
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM notes 
      WHERE id = note_shares.note_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their shares" ON note_shares
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM notes 
      WHERE id = note_shares.note_id 
      AND user_id = auth.uid()
    )
  );

-- 5. 验证表创建
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'note_shares' 
ORDER BY ordinal_position;

