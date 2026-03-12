import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/useAuthStore'

export function useAuth() {
  const {
    user,
    loading,
    signUp: storeSignUp,
    signIn: storeSignIn,
    signOut: storeSignOut,
    setUser,
  } = useAuthStore()

  // Wrap Zustand auth actions so the rest of the app
  // can keep using this hook.

  const signUp = async (email: string, password: string, fullName?: string) => {
    const result = await storeSignUp(email, password, fullName || '')
    if (!result.success && result.error) {
      toast.error(result.error)
    } else if (result.success) {
      toast.success('Account created successfully! Please sign in to continue.')
    }
    return result
  }

  const signIn = async (email: string, password: string) => {
    const result = await storeSignIn(email, password)
    if (!result.success && result.error) {
      toast.error(result.error)
    } else if (result.success) {
      toast.success('Signed in successfully!')
    }
    return result
  }

  const signOut = async () => {
    await storeSignOut()
    setUser(null)
    toast.success('Signed out successfully!')
    return { success: true }
  }

  const updateProfile = async (updates: {
    data?: {
      full_name?: string
      avatar_url?: string
      bio?: string
      website?: string
      location?: string
    }
  }) => {
    const currentUser = useAuthStore.getState().user
    if (!currentUser) {
      throw new Error('User not authenticated')
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates.data)
      .eq('id', currentUser.id)

    if (error) {
      throw new Error(error.message)
    }

    // Re-fetch latest profile row and update store
    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single()

    if (!fetchError && data) {
      setUser(data)
    }

    return { success: true }
  }

  return {
    user,
    session: null,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
  }
}
