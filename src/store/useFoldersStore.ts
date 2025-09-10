import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { Folder } from '@/types/database'
import { useAuthStore } from './useAuthStore'
import toast from 'react-hot-toast'

interface FoldersState {
  folders: Folder[]
  loading: boolean
  error: string | null
  setFolders: (folders: Folder[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  fetchFolders: () => Promise<void>
  createFolder: (folder: Omit<Folder, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Folder | null>
  updateFolder: (id: string, updates: Partial<Folder>) => Promise<Folder | null>
  deleteFolder: (id: string) => Promise<boolean>
  clearFolders: () => void
}

export const useFoldersStore = create<FoldersState>((set, get) => ({
  folders: [],
  loading: false,
  error: null,
  
  setFolders: (folders) => set({ folders }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  fetchFolders: async () => {
    const { user } = useAuthStore.getState()
    if (!user) return
    
    set({ loading: true, error: null })
    
    try {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user.id)
        .order('name')
      
      if (error) throw error
      
      set({ folders: data || [] })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch folders' })
    } finally {
      set({ loading: false })
    }
  },
  
  createFolder: async (folderData) => {
    const { user } = useAuthStore.getState()
    if (!user) return null
    
    set({ loading: true, error: null })
    
    try {
      const { data, error } = await supabase
        .from('folders')
        .insert({
          ...folderData,
          user_id: user.id,
        })
        .select()
        .single()
      
      if (error) throw error
      
      set((state) => ({
        folders: [...state.folders, data]
      }))
      
      return data
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create folder' })
      return null
    } finally {
      set({ loading: false })
    }
  },
  
  updateFolder: async (id, updates) => {
    set({ loading: true, error: null })
    
    try {
      const { data, error } = await supabase
        .from('folders')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      set((state) => ({
        folders: state.folders.map(folder => 
          folder.id === id ? data : folder
        )
      }))
      
      return data
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update folder' })
      return null
    } finally {
      set({ loading: false })
    }
  },
  
  deleteFolder: async (id) => {
    set({ loading: true, error: null })
    
    try {
      // First, move all notes in this folder to null (unorganized)
      await supabase
        .from('notes')
        .update({ folder_id: null })
        .eq('folder_id', id)

      // Then delete the folder
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      set((state) => ({
        folders: state.folders.filter(folder => folder.id !== id)
      }))
      
      return true
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete folder' })
      return false
    } finally {
      set({ loading: false })
    }
  },

  clearFolders: () => {
    set({ folders: [] })
  }
}))

// Set up real-time subscription
if (typeof window !== 'undefined') {
  const { user } = useAuthStore.getState()
  if (user) {
    const channel = supabase
      .channel('folders_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'folders',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Folder change received:', payload)
          // Refresh folders when changes occur
          useFoldersStore.getState().fetchFolders()
        }
      )
      .subscribe()
  }
}
