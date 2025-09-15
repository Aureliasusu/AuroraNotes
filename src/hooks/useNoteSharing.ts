'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/useAuthStore'
import toast from 'react-hot-toast'

interface NoteShare {
  id: string
  note_id: string
  shared_by: string
  shared_with: string
  permission: 'read' | 'edit' | 'admin'
  created_at: string
  updated_at: string
  user: {
    id: string
    email: string
    full_name?: string
    avatar_url?: string
  }
}

export function useNoteSharing() {
  const { user } = useAuthStore()
  const [shares, setShares] = useState<NoteShare[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Get note shares
  const getNoteShares = useCallback(async (noteId: string) => {
    if (!user || !noteId) {
      console.log('getNoteShares: Missing user or noteId', { user: !!user, noteId })
      return
    }

    setIsLoading(true)
    try {
      console.log('getNoteShares: Fetching shares for note:', noteId)
      
      const { data, error } = await supabase
        .from('note_shares')
        .select('*')
        .eq('note_id', noteId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching note shares:', error)
        // If table doesn't exist error, don't show toast
        if (error.code === '42P01') {
          console.warn('note_shares table does not exist')
          setShares([])
          return
        }
        toast.error(`Failed to load note shares: ${error.message}`)
        return
      }

      console.log('getNoteShares: Successfully fetched shares:', data)
      setShares(data || [])
    } catch (error) {
      console.error('Exception fetching note shares:', error)
      toast.error('Failed to load note shares')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Share note with user
  const shareNote = useCallback(async (
    noteId: string, 
    userEmail: string, 
    permission: 'read' | 'edit' | 'admin' = 'edit'
  ) => {
    if (!user || !noteId || !userEmail) {
      toast.error('Missing required information')
      return
    }

    setIsLoading(true)
    try {
      // First, find the user by email
      const { data: targetUser, error: userError } = await supabase
        .from('users')
        .select('id, email, full_name')
        .eq('email', userEmail)
        .single()

      if (userError || !targetUser) {
        toast.error('User not found')
        return
      }

      if (targetUser.id === user.id) {
        toast.error('You cannot share a note with yourself')
        return
      }

      // Create the share
      const { data, error } = await supabase
        .from('note_shares')
        .insert({
          note_id: noteId,
          shared_by: user.id,
          shared_with: targetUser.id,
          permission
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          toast.error('This note is already shared with this user')
        } else {
          console.error('Error sharing note:', error)
          toast.error('Failed to share note')
        }
        return
      }

      toast.success(`Note shared with ${targetUser.full_name || targetUser.email}`)
      
      // Refresh shares list
      await getNoteShares(noteId)
      
      return data
    } catch (error) {
      console.error('Exception sharing note:', error)
      toast.error('Failed to share note')
    } finally {
      setIsLoading(false)
    }
  }, [user, getNoteShares])

  // Update share permission
  const updateSharePermission = useCallback(async (
    shareId: string, 
    permission: 'read' | 'edit' | 'admin'
  ) => {
    if (!user) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('note_shares')
        .update({ 
          permission,
          updated_at: new Date().toISOString()
        })
        .eq('id', shareId)
        .select()
        .single()

      if (error) {
        console.error('Error updating share permission:', error)
        toast.error('Failed to update permission')
        return
      }

      toast.success('Permission updated successfully')
      
      // Update local state
      setShares(prev => 
        prev.map(share => 
          share.id === shareId 
            ? { ...share, permission, updated_at: new Date().toISOString() }
            : share
        )
      )
      
      return data
    } catch (error) {
      console.error('Exception updating share permission:', error)
      toast.error('Failed to update permission')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Remove share
  const removeShare = useCallback(async (shareId: string) => {
    if (!user) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('note_shares')
        .delete()
        .eq('id', shareId)

      if (error) {
        console.error('Error removing share:', error)
        toast.error('Failed to remove share')
        return
      }

      toast.success('Share removed successfully')
      
      // Update local state
      setShares(prev => prev.filter(share => share.id !== shareId))
    } catch (error) {
      console.error('Exception removing share:', error)
      toast.error('Failed to remove share')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Check if user can edit note
  const canEditNote = useCallback(async (noteId: string) => {
    if (!user || !noteId) return false

    try {
      const { data, error } = await supabase
        .rpc('can_edit_note', { note_uuid: noteId, user_uuid: user.id })

      if (error) {
        console.error('Permission check error:', error)
        return false
      }

      return data
    } catch (error) {
      console.error('Permission check exception:', error)
      return false
    }
  }, [user])

  // Check if user can read note
  const canReadNote = useCallback(async (noteId: string) => {
    if (!user || !noteId) return false

    try {
      const { data, error } = await supabase
        .rpc('can_read_note', { note_uuid: noteId, user_uuid: user.id })

      if (error) {
        console.error('Permission check error:', error)
        return false
      }

      return data
    } catch (error) {
      console.error('Permission check exception:', error)
      return false
    }
  }, [user])

  return {
    shares,
    isLoading,
    getNoteShares,
    shareNote,
    updateSharePermission,
    removeShare,
    canEditNote,
    canReadNote
  }
}
