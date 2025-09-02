import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { Note } from '@/types/database'
import { useAuthStore } from './useAuthStore'

interface NotesState {
  notes: Note[]
  loading: boolean
  error: string | null
  selectedNote: Note | null
  setNotes: (notes: Note[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSelectedNote: (note: Note | null) => void
  fetchNotes: () => Promise<void>
  createNote: (note: Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Note | null>
  updateNote: (id: string, updates: Partial<Note>) => Promise<Note | null>
  deleteNote: (id: string) => Promise<boolean>
  togglePin: (id: string) => Promise<void>
  toggleArchive: (id: string) => Promise<void>
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  loading: false,
  error: null,
  selectedNote: null,
  
  setNotes: (notes) => set({ notes }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSelectedNote: (note) => set({ selectedNote: note }),
  
  fetchNotes: async () => {
    const { user } = useAuthStore.getState()
    if (!user) return
    
    set({ loading: true, error: null })
    
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false })
      
      if (error) throw error
      set({ notes: data || [] })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch notes' })
    } finally {
      set({ loading: false })
    }
  },
  
  createNote: async (noteData) => {
    const { user } = useAuthStore.getState()
    if (!user) return null
    
    set({ loading: true, error: null })
    
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          ...noteData,
          user_id: user.id
        })
        .select()
        .single()
      
      if (error) throw error
      
      const newNote = data
      set((state) => ({
        notes: [newNote, ...state.notes],
        selectedNote: newNote
      }))
      
      return newNote
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create note' })
      return null
    } finally {
      set({ loading: false })
    }
  },
  
  updateNote: async (id, updates) => {
    set({ loading: true, error: null })
    
    try {
      const { data, error } = await supabase
        .from('notes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      const updatedNote = data
      set((state) => ({
        notes: state.notes.map(note => 
          note.id === id ? updatedNote : note
        ),
        selectedNote: state.selectedNote?.id === id ? updatedNote : state.selectedNote
      }))
      
      return updatedNote
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update note' })
      return null
    } finally {
      set({ loading: false })
    }
  },
  
  deleteNote: async (id) => {
    set({ loading: true, error: null })
    
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      set((state) => ({
        notes: state.notes.filter(note => note.id !== id),
        selectedNote: state.selectedNote?.id === id ? null : state.selectedNote
      }))
      
      return true
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete note' })
      return false
    } finally {
      set({ loading: false })
    }
  },
  
  togglePin: async (id) => {
    const note = get().notes.find(n => n.id === id)
    if (!note) return
    
    await get().updateNote(id, { is_pinned: !note.is_pinned })
  },
  
  toggleArchive: async (id) => {
    const note = get().notes.find(n => n.id === id)
    if (!note) return
    
    await get().updateNote(id, { is_archived: !note.is_archived })
  }
}))

// Set up real-time subscription
if (typeof window !== 'undefined') {
  const { user } = useAuthStore.getState()
  if (user) {
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
        () => {
          useNotesStore.getState().fetchNotes()
        }
      )
      .subscribe()
  }
}

