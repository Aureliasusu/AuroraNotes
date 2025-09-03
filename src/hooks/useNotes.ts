import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import toast from 'react-hot-toast'

export interface Note {
  id: string
  user_id: string
  title: string
  content: string
  tags: string[]
  is_archived: boolean
  is_pinned: boolean
  created_at: string
  updated_at: string
}

interface NotesState {
  notes: Note[]
  loading: boolean
  error: string | null
}

export function useNotes() {
  const { user } = useAuth()
  const [state, setState] = useState<NotesState>({
    notes: [],
    loading: false,
    error: null
  })

  // Fetch all notes for the current user
  const fetchNotes = useCallback(async () => {
    if (!user) {
      console.warn('No user authenticated, cannot fetch notes')
      setState(prev => ({ ...prev, notes: [], loading: false }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      console.log('Fetching notes for user:', user.id) // Debug log
      
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false })

      if (error) throw error

      console.log('Fetched notes:', data?.length || 0, 'for user:', user.id) // Debug log
      
      setState(prev => ({
        ...prev,
        notes: data || [],
        loading: false
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch notes'
      console.error('Error fetching notes:', error) // Debug log
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }))
      toast.error(errorMessage)
    }
  }, [user])

  // Create a new note
  const createNote = async (noteData: { title: string; content: string; tags?: string[] }) => {
    if (!user) return { success: false, error: 'User not authenticated' }

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          title: noteData.title,
          content: noteData.content,
          tags: noteData.tags || [],
          is_archived: false,
          is_pinned: false
        })
        .select()
        .single()

      if (error) throw error

      setState(prev => ({
        ...prev,
        notes: [data, ...prev.notes]
      }))

      toast.success('Note created successfully!')
      return { success: true, note: data }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create note'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Update an existing note
  const updateNote = async (id: string, updates: Partial<Note>) => {
    if (!user) return { success: false, error: 'User not authenticated' }

    try {
      const { data, error } = await supabase
        .from('notes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      setState(prev => ({
        ...prev,
        notes: prev.notes.map(note => 
          note.id === id ? { ...note, ...data } : note
        )
      }))

      toast.success('Note updated successfully!')
      return { success: true, note: data }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update note'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Delete a note
  const deleteNote = async (id: string) => {
    if (!user) return { success: false, error: 'User not authenticated' }

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      setState(prev => ({
        ...prev,
        notes: prev.notes.filter(note => note.id !== id)
      }))

      toast.success('Note deleted successfully!')
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete note'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Toggle note pin status
  const togglePin = async (id: string) => {
    const note = state.notes.find(n => n.id === id)
    if (!note) return { success: false, error: 'Note not found' }

    return updateNote(id, { is_pinned: !note.is_pinned })
  }

  // Toggle note archive status
  const toggleArchive = async (id: string) => {
    const note = state.notes.find(n => n.id === id)
    if (!note) return { success: false, error: 'Note not found' }

    return updateNote(id, { is_archived: !note.is_archived })
  }

  // Search notes
  const searchNotes = useCallback(async (query: string) => {
    if (!user || !query.trim()) {
      await fetchNotes()
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('updated_at', { ascending: false })

      if (error) throw error

      setState(prev => ({
        ...prev,
        notes: data || [],
        loading: false
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }))
      toast.error(errorMessage)
    }
  }, [user, fetchNotes])

  // Filter notes by tags
  const filterByTags = useCallback(async (tags: string[]) => {
    if (!user || tags.length === 0) {
      await fetchNotes()
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .overlaps('tags', tags)
        .order('updated_at', { ascending: false })

      if (error) throw error

      setState(prev => ({
        ...prev,
        notes: data || [],
        loading: false
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Filter failed'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }))
      toast.error(errorMessage)
    }
  }, [user, fetchNotes])

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('notes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `user_id=eq.${user.id}`
        },
        (payload: any) => {
          // Security check: only process events for the current user
          if (payload.new && payload.new.user_id !== user.id) {
            console.warn('Received note event for different user, ignoring:', payload.new.user_id)
            return
          }
          
          if (payload.eventType === 'INSERT') {
            setState(prev => ({
              ...prev,
              notes: [payload.new as Note, ...prev.notes]
            }))
          } else if (payload.eventType === 'UPDATE') {
            setState(prev => ({
              ...prev,
              notes: prev.notes.map(note => 
                note.id === payload.new.id ? payload.new as Note : note
              )
            }))
          } else if (payload.eventType === 'DELETE') {
            setState(prev => ({
              ...prev,
              notes: prev.notes.filter(note => note.id !== payload.old.id)
            }))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  // Initial fetch
  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  return {
    // State
    notes: state.notes,
    loading: state.loading,
    error: state.error,
    
    // Actions
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    toggleArchive,
    searchNotes,
    filterByTags,
    
    // Computed values
    pinnedNotes: state.notes.filter(note => note.is_pinned),
    archivedNotes: state.notes.filter(note => note.is_archived),
    activeNotes: state.notes.filter(note => !note.is_archived),
    totalNotes: state.notes.length
  }
}
