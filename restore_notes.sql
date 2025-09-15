-- 恢复笔记功能脚本
-- 在 Supabase SQL Editor 中执行

-- 1. 临时禁用 RLS 来检查数据
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;

-- 2. 检查所有笔记（临时）
SELECT id, title, user_id, created_at 
FROM notes 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. 重新启用 RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- 4. 删除可能有问题的策略
DROP POLICY IF EXISTS "Allow authenticated users to view their own or shared notes" ON notes;
DROP POLICY IF EXISTS "Allow authenticated users to update their own or shared notes" ON notes;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own notes" ON notes;
DROP POLICY IF EXISTS "Allow authenticated users to insert notes" ON notes;
DROP POLICY IF EXISTS "Users can view their own notes" ON notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON notes;
DROP POLICY IF EXISTS "Users can insert notes" ON notes;

-- 5. 重新创建简单的 RLS 策略
CREATE POLICY "Users can view their own notes" ON notes
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notes" ON notes
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own notes" ON notes
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert notes" ON notes
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

