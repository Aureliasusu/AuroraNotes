import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User, Session } from '@supabase/supabase-js'
import toast from 'react-hot-toast'

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
      } catch (error) {
        console.error('Error getting initial session:', error)
        setAuthState(prev => ({ ...prev, loading: false }))
      }
    }

    getInitialSession()
  }, [])

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
          return
        }
        
        // Handle other auth events normally
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false
        })

        if (event === 'SIGNED_IN') {
          toast.success('Signed in successfully!')
        } else if (event === 'SIGNED_OUT') {
          toast.success('Signed out successfully!')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

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
      
      toast.success('Signed out successfully!')
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Update user profile
  const updateProfile = async (updates: { full_name?: string; avatar_url?: string }) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: updates
      })

      if (error) throw error

      toast.success('Profile updated successfully!')
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
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
