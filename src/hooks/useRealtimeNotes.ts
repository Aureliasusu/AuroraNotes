'use client'

import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useNotesStore } from '@/store/useNotesStore'
import { useAuthStore } from '@/store/useAuthStore'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { Note } from '@/types/database'
import toast from 'react-hot-toast'

export function useRealtimeNotes() {
  const { user } = useAuthStore()
  const { 
    notes, 
    fetchNotes, 
    addNote, 
    updateNote, 
    deleteNote,
    setNotes 
  } = useNotesStore()
  
  const channelRef = useRef<any>(null)

  useEffect(() => {
    if (!user) {
      // User not logged in, cleanup channel
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
      return
    }

    // Create real-time channel
    const channel = supabase
      .channel('notes-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'notes',
          filter: `user_id=eq.${user.id}` // Only listen to current user's notes
        },
        (payload: RealtimePostgresChangesPayload<Note>) => {
          console.log('📝 Received note changes:', payload)
          handleNoteChange(payload)
        }
      )
      .subscribe((status: string) => {
        console.log('🔄 Realtime subscription status:', status)
        if (status === 'SUBSCRIBED') {
          toast.success('Real-time sync enabled')
        } else if (status === 'CHANNEL_ERROR') {
          toast.error('Real-time sync connection failed')
        }
      })

    channelRef.current = channel

    // Cleanup function
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [user])

  const handleNoteChange = (payload: RealtimePostgresChangesPayload<Note>) => {
    const { eventType, new: newRecord, old: oldRecord } = payload

    switch (eventType) {
      case 'INSERT':
        handleNoteInsert(newRecord as Note)
        break
      case 'UPDATE':
        handleNoteUpdate(newRecord as Note, oldRecord as Note)
        break
      case 'DELETE':
        handleNoteDelete(oldRecord as Note)
        break
      default:
        console.log('Unknown event type:', eventType)
    }
  }

  const handleNoteInsert = (newNote: Note) => {
    console.log('➕ New note created:', newNote)
    
    // Check if note already exists (avoid duplicate addition)
    const existingNote = notes.find(note => note.id === newNote.id)
    if (!existingNote) {
      addNote(newNote)
      toast.success(`New note: ${newNote.title || 'Untitled'}`)
    }
  }

  const handleNoteUpdate = (newNote: Note, oldNote: Note) => {
    console.log('✏️ Note updated:', { old: oldNote, new: newNote })
    
    // Update note
    updateNote(newNote.id, newNote)
    
    // Show update notification (avoid showing for own edits)
    if (newNote.user_id !== user?.id) {
      toast.success(`Note updated: ${newNote.title || 'Untitled'}`)
    }
  }

  const handleNoteDelete = (deletedNote: Note) => {
    console.log('🗑️ Note deleted:', deletedNote)
    
    // Delete note
    deleteNote(deletedNote.id)
    toast.success(`Note deleted: ${deletedNote.title || 'Untitled'}`)
  }

  return {
    isConnected: channelRef.current !== null
  }
}
