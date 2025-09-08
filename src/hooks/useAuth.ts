import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User, Session } from '@supabase/supabase-js'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/useAuthStore'
import { useNotesStore } from '@/store/useNotesStore'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true
  })

  // Get Zustand store actions
  const { 
    setUser, 
    setSession, 
    setProfile, 
    setLoading: setStoreLoading,
    refreshProfile 
  } = useAuthStore()
  
  const { fetchNotes, clearNotes } = useNotesStore()

  // Get initial session
  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false
        })
        
        // Update store
        setUser(session?.user ?? null)
        setSession(session)
        setStoreLoading(false)
        
        if (session?.user) {
          await refreshProfile()
          await fetchNotes()
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
        setAuthState(prev => ({ ...prev, loading: false }))
        setStoreLoading(false)
      }
    }

    getInitialSession()
  }, [setUser, setSession, setStoreLoading, refreshProfile, fetchNotes])

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        // Don't automatically set user as logged in after signup
        if (event === 'SIGNED_UP') {
          // User just signed up, but don't set them as logged in
          setAuthState(prev => ({
            ...prev,
            user: null,
            session: null,
            loading: false
          }))
          
          // Update store
          setUser(null)
          setSession(null)
          setStoreLoading(false)
          clearNotes()
          return
        }
        
        // Handle other auth events normally
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false
        })
        
        // Update store
        setUser(session?.user ?? null)
        setSession(session)
        setStoreLoading(false)

        if (event === 'SIGNED_IN' && session?.user) {
          toast.success('Signed in successfully!')
          await refreshProfile()
          await fetchNotes()
        } else if (event === 'SIGNED_OUT') {
          toast.success('Signed out successfully!')
          clearNotes() // Clear notes when user signs out
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [setUser, setSession, setStoreLoading, refreshProfile, fetchNotes, clearNotes])

  // Sign up function
  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) throw error

      if (data.user) {
        // Clear any existing store data (user is not logged in yet)
        setUser(null)
        setSession(null)
        setProfile(null)
        clearNotes()
        
        // Don't automatically set the user as logged in
        // The user needs to explicitly sign in
        toast.success('Account created successfully! Please sign in to continue.')
        return { success: true, user: data.user }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Update store with user data
      setUser(data.user)
      setSession(data.session)
      
      // Fetch user profile and notes
      await refreshProfile()
      await fetchNotes()
      
      toast.success('Signed in successfully!')
      return { success: true, user: data.user }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Sign out function
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Clear store data
      setUser(null)
      setSession(null)
      setProfile(null)
      clearNotes()
      
      toast.success('Signed out successfully!')
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Update user profile
  const updateProfile = async (updates: { 
    data?: {
      full_name?: string
      avatar_url?: string
      bio?: string
      website?: string
      location?: string
    }
  }) => {
    try {
      const { user } = authState
      if (!user) throw new Error('User not authenticated')

      // Update profiles table directly
      const { error } = await supabase
        .from('profiles')
        .update(updates.data)
        .eq('id', user.id)

      if (error) throw error

      // Refresh profile data in store
      await refreshProfile()
      
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed'
      throw new Error(errorMessage)
    }
  }

  return {
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAuthenticated: !!authState.user
  }
}
