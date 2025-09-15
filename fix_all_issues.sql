-- 修复所有问题的综合脚本
-- 在 Supabase SQL Editor 中执行

-- 1. 删除所有可能有问题的 RLS 策略
DROP POLICY IF EXISTS "Users can view own notes" ON notes;
DROP POLICY IF EXISTS "Users can view their own notes" ON notes;
DROP POLICY IF EXISTS "Users can view their own notes and shared notes" ON notes;
DROP POLICY IF EXISTS "Users can view their own or shared notes" ON notes;
DROP POLICY IF EXISTS "Users can update own notes" ON notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON notes;
DROP POLICY IF EXISTS "Users can update their own notes and shared notes with edit per" ON notes;
DROP POLICY IF EXISTS "Users can update their own or shared notes" ON notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON notes;
DROP POLICY IF EXISTS "Users can insert notes" ON notes;
DROP POLICY IF EXISTS "Users can insert own notes" ON notes;
DROP POLICY IF EXISTS "notes_select_policy" ON notes;
DROP POLICY IF EXISTS "notes_insert_policy" ON notes;
DROP POLICY IF EXISTS "notes_update_policy" ON notes;
DROP POLICY IF EXISTS "notes_delete_policy" ON notes;
DROP POLICY IF EXISTS "simple_notes_select" ON notes;
DROP POLICY IF EXISTS "simple_notes_insert" ON notes;
DROP POLICY IF EXISTS "simple_notes_update" ON notes;
DROP POLICY IF EXISTS "simple_notes_delete" ON notes;

-- 2. 删除 note_shares 表（如果存在）
DROP TABLE IF EXISTS note_shares CASCADE;

-- 3. 删除可能有问题的函数
DROP FUNCTION IF EXISTS can_edit_note(note_uuid UUID, user_uuid UUID);
DROP FUNCTION IF EXISTS can_read_note(note_uuid UUID, user_uuid UUID);

-- 4. 重新创建简单的 RLS 策略
CREATE POLICY "simple_notes_select" ON notes
  FOR SELECT TO authenticated 
  USING (user_id = auth.uid());

CREATE POLICY "simple_notes_insert" ON notes
  FOR INSERT TO authenticated 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "simple_notes_update" ON notes
  FOR UPDATE TO authenticated 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "simple_notes_delete" ON notes
  FOR DELETE TO authenticated 
  USING (user_id = auth.uid());

-- 5. 验证策略
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'notes'
ORDER BY policyname;
