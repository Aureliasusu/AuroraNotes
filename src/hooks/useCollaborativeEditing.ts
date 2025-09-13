'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/useAuthStore'
import { useNotesStore } from '@/store/useNotesStore'
import { useUserPresence } from './useUserPresence'
import { Note } from '@/types/database'
import toast from 'react-hot-toast'

interface EditingUser {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  cursor_position?: number
  last_seen: string
  isTyping?: boolean
  typingTimeout?: NodeJS.Timeout
}

interface Conflict {
  id: string
  field: string
  localValue: string
  remoteValue: string
  remoteUser: string
  timestamp: Date
}

export function useCollaborativeEditing(noteId?: string) {
  const { user } = useAuthStore()
  const { updateNote } = useNotesStore()
  const { onlineUsers, updateCurrentNote } = useUserPresence(noteId)
  
  const [editingUsers, setEditingUsers] = useState<EditingUser[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [conflicts, setConflicts] = useState<Conflict[]>([])
  
  const channelRef = useRef<any>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastContentRef = useRef<string>('')

  // Listen to note content changes
  useEffect(() => {
    if (!user || !noteId) {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
      return
    }

    // Create collaborative editing channel
    const channel = supabase
      .channel(`note-${noteId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notes',
          filter: `id=eq.${noteId}`
        },
        (payload: any) => {
          const updatedNote = payload.new as Note
          
          // If update is not from current user, update content
          if (updatedNote.user_id !== user.id) {
            handleRemoteUpdate(updatedNote)
          }
        }
      )
      .on('broadcast', { event: 'cursor-move' }, (payload: any) => {
        handleCursorMove(payload)
      })
      .on('broadcast', { event: 'user-typing' }, (payload: any) => {
        handleUserTyping(payload)
      })
      .subscribe((status: any) => {
        // Subscription status handled
      })

    channelRef.current = channel

    // Update current user's editing note
    updateCurrentNote(noteId)

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [user, noteId, updateCurrentNote])

  // Handle remote updates
  const handleRemoteUpdate = (updatedNote: Note) => {
    // Update note content
    updateNote(updatedNote.id, updatedNote)
    
    // Show update notification
    toast.success('Note content updated')
  }

  // Handle cursor movement
  const handleCursorMove = (payload: any) => {
    const { user_id, cursor_position, user_info } = payload
    
    if (user_id !== user?.id && user_info) {
      setEditingUsers(prev => {
        const existing = prev.find(u => u.id === user_id)
        if (existing) {
          return prev.map(u => 
            u.id === user_id 
              ? { ...u, cursor_position, last_seen: new Date().toISOString() }
              : u
          )
        } else {
          return [...prev, {
            id: user_id,
            email: user_info.email || '',
            full_name: user_info.full_name || '',
            avatar_url: user_info.avatar_url || '',
            cursor_position,
            last_seen: new Date().toISOString()
          }]
        }
      })
    }
  }

  // Handle user typing
  const handleUserTyping = (payload: any) => {
    const { user_id, user_info } = payload
    
    if (user_id !== user?.id && user_info) {
      setEditingUsers(prev => {
        const existing = prev.find(u => u.id === user_id)
        if (existing) {
          // Clear existing typing timeout
          if (existing.typingTimeout) {
            clearTimeout(existing.typingTimeout)
          }
          
          // Set new timeout to stop typing indicator
          const typingTimeout = setTimeout(() => {
            setEditingUsers(prev => 
              prev.map(u => 
                u.id === user_id 
                  ? { ...u, isTyping: false, typingTimeout: undefined }
                  : u
              )
            )
          }, 2000)
          
          return prev.map(u => 
            u.id === user_id 
              ? { ...u, isTyping: true, typingTimeout, last_seen: new Date().toISOString() }
              : u
          )
        } else {
          // Add new user with typing indicator
          const typingTimeout = setTimeout(() => {
            setEditingUsers(prev => 
              prev.map(u => 
                u.id === user_id 
                  ? { ...u, isTyping: false, typingTimeout: undefined }
                  : u
              )
            )
          }, 2000)
          
          return [...prev, {
            id: user_id,
            email: user_info.email || '',
            full_name: user_info.full_name || '',
            avatar_url: user_info.avatar_url || '',
            isTyping: true,
            typingTimeout,
            last_seen: new Date().toISOString()
          }]
        }
      })
    }
  }

  // Broadcast cursor movement
  const broadcastCursorMove = useCallback((cursorPosition: number) => {
    if (channelRef.current && user) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'cursor-move',
        payload: {
          user_id: user.id,
          cursor_position: cursorPosition,
          user_info: {
            email: user.email,
            full_name: user.user_metadata?.full_name,
            avatar_url: user.user_metadata?.avatar_url
          }
        }
      })
    }
  }, [user])

  // Broadcast user typing with typing indicator
  const broadcastUserTyping = useCallback(() => {
    if (!channelRef.current || !user) return
    
    // Update local typing state
    setEditingUsers(prev => {
      const existing = prev.find(u => u.id === user.id)
      if (existing) {
        // Clear existing timeout
        if (existing.typingTimeout) {
          clearTimeout(existing.typingTimeout)
        }
        
        // Set new timeout to stop typing indicator
        const typingTimeout = setTimeout(() => {
          setEditingUsers(prev => 
            prev.map(u => 
              u.id === user.id 
                ? { ...u, isTyping: false, typingTimeout: undefined }
                : u
            )
          )
        }, 2000)
        
        return prev.map(u => 
          u.id === user.id 
            ? { ...u, isTyping: true, typingTimeout, last_seen: new Date().toISOString() }
            : u
        )
      } else {
        // Add new user with typing indicator
        const typingTimeout = setTimeout(() => {
          setEditingUsers(prev => 
            prev.map(u => 
              u.id === user.id 
                ? { ...u, isTyping: false, typingTimeout: undefined }
                : u
            )
          )
        }, 2000)
        
        return [...prev, {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || '',
          avatar_url: user.user_metadata?.avatar_url || '',
          isTyping: true,
          typingTimeout,
          last_seen: new Date().toISOString()
        }]
      }
    })
    
    channelRef.current.send({
      type: 'broadcast',
      event: 'user-typing',
      payload: {
        user_id: user.id,
        user_info: {
          email: user.email,
          full_name: user.user_metadata?.full_name,
          avatar_url: user.user_metadata?.avatar_url
        }
      }
    })
  }, [user])

  // Save note content (debounced)
  const saveNoteContent = useCallback(async (content: string) => {
    if (!noteId || !user || content === lastContentRef.current) {
      return
    }

    lastContentRef.current = content

    // Clear previous save timer
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Set new save timer (save after 1 second)
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('notes')
          .update({ 
            content,
            updated_at: new Date().toISOString()
          })
          .eq('id', noteId)
          .eq('user_id', user.id)

        if (error) {
          console.error('Failed to save note:', error)
          toast.error('Save failed')
        } else {
          setLastSaved(new Date())
        }
      } catch (error) {
        console.error('Note save exception:', error)
        toast.error('Save failed')
      }
    }, 1000)
  }, [noteId, user])

  // Start editing
  const startEditing = useCallback(() => {
    setIsEditing(true)
  }, [])

  // Stop editing
  const stopEditing = useCallback(() => {
    setIsEditing(false)
    setEditingUsers([])
  }, [])

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  // Resolve conflict
  const resolveConflict = useCallback((conflictId: string, resolution: 'local' | 'remote' | 'merge') => {
    const conflict = conflicts.find(c => c.id === conflictId)
    if (!conflict) return

    switch (resolution) {
      case 'local':
        // Keep local version - no action needed
        break
      case 'remote':
        // Use remote version - update local content
        if (conflict.field === 'content') {
          lastContentRef.current = conflict.remoteValue
          // Trigger content update in parent component
          // This would need to be handled by the parent component
        }
        break
      case 'merge':
        // Simple merge - append remote content
        if (conflict.field === 'content') {
          const mergedContent = `${conflict.localValue}\n\n---\n\n${conflict.remoteValue}`
          lastContentRef.current = mergedContent
        }
        break
    }

    // Remove resolved conflict
    setConflicts(prev => prev.filter(c => c.id !== conflictId))
  }, [conflicts])

  // Dismiss conflict
  const dismissConflict = useCallback((conflictId: string) => {
    setConflicts(prev => prev.filter(c => c.id !== conflictId))
  }, [])

  return {
    editingUsers,
    isEditing,
    lastSaved,
    conflicts,
    startEditing,
    stopEditing,
    saveNoteContent,
    broadcastCursorMove,
    broadcastUserTyping,
    resolveConflict,
    dismissConflict
  }
}
