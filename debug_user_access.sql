-- 检查用户访问权限
-- 在 Supabase SQL Editor 中执行

-- 1. 检查当前认证用户
SELECT auth.uid() as current_user_id;

-- 2. 检查当前用户是否有任何笔记
SELECT COUNT(*) as notes_count 
FROM notes 
WHERE user_id = auth.uid();

-- 3. 查看当前用户的笔记
SELECT id, title, created_at 
FROM notes 
WHERE user_id = auth.uid() 
ORDER BY created_at DESC 
LIMIT 5;

-- 4. 检查 RLS 是否正常工作
-- 临时禁用 RLS 来测试
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;

-- 5. 再次查询当前用户的笔记（应该能看到）
SELECT COUNT(*) as notes_without_rls 
FROM notes 
WHERE user_id = auth.uid();

-- 6. 重新启用 RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- 7. 检查 RLS 策略
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'notes';

