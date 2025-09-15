-- Fix script for note_shares functionality
-- Execute this in Supabase SQL Editor

-- 1. 检查并重新创建 can_edit_note 函数（如果不存在或有问题）
CREATE OR REPLACE FUNCTION can_edit_note(note_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 检查用户是否是笔记的所有者
  IF EXISTS (
    SELECT 1 FROM notes 
    WHERE id = note_uuid AND user_id = user_uuid
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- 检查用户是否有编辑权限
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
$$;

-- 2. 确保 RLS 策略正确设置
-- 删除现有的可能有问题的策略
DROP POLICY IF EXISTS "Allow authenticated users to view their shares" ON note_shares;
DROP POLICY IF EXISTS "Allow note owner to share their notes" ON note_shares;
DROP POLICY IF EXISTS "Allow note owner to update shares" ON note_shares;
DROP POLICY IF EXISTS "Allow note owner to delete shares" ON note_shares;

-- 重新创建策略
CREATE POLICY "Users can view their own shares" ON note_shares
  FOR SELECT TO authenticated 
  USING (shared_with = auth.uid());

CREATE POLICY "Note owners can manage shares" ON note_shares
  FOR ALL TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM notes 
      WHERE id = note_shares.note_id 
        AND user_id = auth.uid()
    )
  );

-- 3. 确保 notes 表的 RLS 策略允许共享用户访问
DROP POLICY IF EXISTS "Allow authenticated users to view their own or shared notes" ON notes;
DROP POLICY IF EXISTS "Allow authenticated users to update their own or shared notes" ON notes;

CREATE POLICY "Users can view their own or shared notes" ON notes
  FOR SELECT TO authenticated 
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM note_shares 
      WHERE note_id = notes.id 
        AND shared_with = auth.uid()
    )
  );

CREATE POLICY "Users can update their own or shared notes" ON notes
  FOR UPDATE TO authenticated 
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM note_shares 
      WHERE note_id = notes.id 
        AND shared_with = auth.uid() 
        AND permission IN ('edit', 'admin')
    )
  );

-- 4. 测试函数是否工作
-- 这个查询应该返回 TRUE 如果你有笔记
SELECT can_edit_note(
  (SELECT id FROM notes LIMIT 1),
  auth.uid()
) as can_edit_test;

