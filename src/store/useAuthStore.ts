import { create } from 'zustand'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types/database'

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  loading: true,
  
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null, profile: null })
  },
  
  refreshProfile: async () => {
    const { user } = get()
    if (!user) return
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (!error && profile) {
      set({ profile })
    }
  }
}))

// Initialize auth listener
if (typeof window !== 'undefined') {
  supabase.auth.getSession().then(({ data: { session } }) => {
    useAuthStore.getState().setSession(session)
    useAuthStore.getState().setUser(session?.user ?? null)
    useAuthStore.getState().setLoading(false)
    
    if (session?.user) {
      useAuthStore.getState().refreshProfile()
    }
  })

  supabase.auth.onAuthStateChange(async (event, session) => {
    useAuthStore.getState().setSession(session)
    useAuthStore.getState().setUser(session?.user ?? null)
    useAuthStore.getState().setLoading(false)
    
    if (session?.user) {
      useAuthStore.getState().refreshProfile()
    } else {
      useAuthStore.getState().setProfile(null)
    }
  })
}

