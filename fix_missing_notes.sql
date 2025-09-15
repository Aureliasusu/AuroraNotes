-- Fix script for missing notes issue
-- Execute this in Supabase SQL Editor

-- 1. 检查当前用户
SELECT auth.uid() as current_user_id;

-- 2. 检查笔记数量
SELECT COUNT(*) as note_count 
FROM notes 
WHERE user_id = auth.uid();

-- 3. 临时禁用 RLS 检查数据是否存在
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;

-- 4. 检查所有笔记
SELECT id, title, user_id, created_at 
FROM notes 
ORDER BY created_at DESC 
LIMIT 10;

-- 5. 重新启用 RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- 6. 删除可能有问题的 RLS 策略
DROP POLICY IF EXISTS "Users can view their own or shared notes" ON notes;
DROP POLICY IF EXISTS "Users can update their own or shared notes" ON notes;
DROP POLICY IF EXISTS "Allow authenticated users to view their own or shared notes" ON notes;
DROP POLICY IF EXISTS "Allow authenticated users to update their own or shared notes" ON notes;

-- 7. 重新创建简单的 RLS 策略
CREATE POLICY "Users can view their own notes" ON notes
  FOR SELECT TO authenticated 
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notes" ON notes
  FOR UPDATE TO authenticated 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own notes" ON notes
  FOR INSERT TO authenticated 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own notes" ON notes
  FOR DELETE TO authenticated 
  USING (user_id = auth.uid());

-- 8. 测试查询
SELECT COUNT(*) as note_count_after_fix
FROM notes 
WHERE user_id = auth.uid();

