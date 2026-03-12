import { create } from 'zustand'
import { supabase } from '../services/supabase'
import { User } from '../types/database'

interface AuthState {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,

  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true })
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        // Ensure a matching profile row exists for this auth user.
        // Use upsert on the unique email so we don't hit duplicate email errors.
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .upsert(
            {
              id: data.user.id,
              email: data.user.email!,
              full_name: (data.user.user_metadata as any)?.full_name ?? null,
            },
            { onConflict: 'email' }
          )
          .select()
          .single()

        if (profileError) {
          return { success: false, error: profileError.message }
        }

        set({ user: profile, loading: false })
        return { success: true }
      }

      return { success: false, error: 'No user data returned' }
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' }
    } finally {
      set({ loading: false })
    }
  },

  signUp: async (email: string, password: string, fullName: string) => {
    try {
      set({ loading: true })
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            full_name: fullName,
          })

        if (profileError) {
          return { success: false, error: profileError.message }
        }

        set({ user: { id: data.user.id, email: data.user.email!, full_name: fullName, avatar_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, loading: false })
        return { success: true }
      }

      return { success: false, error: 'No user data returned' }
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' }
    } finally {
      set({ loading: false })
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut()
      set({ user: null })
    } catch (error) {
      console.error('Error signing out:', error)
    }
  },

  setUser: (user: User | null) => set({ user }),
  setLoading: (loading: boolean) => set({ loading }),
}))