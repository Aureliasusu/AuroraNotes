-- 检查数据库状态
-- 在 Supabase SQL Editor 中执行

-- 1. 检查当前用户
SELECT auth.uid() as current_user_id;

-- 2. 检查 notes 表的 RLS 状态
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'notes';

-- 3. 检查 notes 表的 RLS 策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'notes';

-- 4. 检查是否有笔记数据
SELECT COUNT(*) as total_notes FROM notes;

-- 5. 检查当前用户的笔记
SELECT COUNT(*) as user_notes 
FROM notes 
WHERE user_id = auth.uid();

