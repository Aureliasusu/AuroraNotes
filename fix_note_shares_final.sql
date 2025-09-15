-- 最终修复 note_shares 功能
-- 在 Supabase SQL Editor 中执行

-- 1. 检查 note_shares 表是否存在
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'note_shares'
) as table_exists;

-- 2. 如果表不存在，重新创建
DROP TABLE IF EXISTS note_shares CASCADE;

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

-- 5. 验证表结构
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'note_shares' 
ORDER BY ordinal_position;

