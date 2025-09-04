import { useCallback } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { useNotesStore } from '@/store/useNotesStore'

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

export function useNotes() {
  const { user } = useAuthStore()
  const { 
    notes, 
    loading, 
    error, 
    selectedNote,
    setSelectedNote,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    toggleArchive
  } = useNotesStore()

  // Enhanced search function
  const searchNotes = useCallback(async (query: string) => {
    if (!user || !query.trim()) {
      await fetchNotes()
      return
    }
    // For now, just fetch all notes and filter client-side
    // In the future, you can implement server-side search
    await fetchNotes()
  }, [user, fetchNotes])

  // Enhanced filter function
  const filterByTags = useCallback(async (tags: string[]) => {
    if (!user || tags.length === 0) {
      await fetchNotes()
      return
    }
    // For now, just fetch all notes and filter client-side
    // In the future, you can implement server-side filtering
    await fetchNotes()
  }, [user, fetchNotes])

  return {
    // State from store
    notes,
    loading,
    error,
    selectedNote,
    
    // Actions from store
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    toggleArchive,
    setSelectedNote,
    
    // Enhanced functions
    searchNotes,
    filterByTags,
    
    // Computed values
    pinnedNotes: notes.filter(note => note.is_pinned),
    archivedNotes: notes.filter(note => note.is_archived),
    activeNotes: notes.filter(note => !note.is_archived),
    totalNotes: notes.length
  }
}
