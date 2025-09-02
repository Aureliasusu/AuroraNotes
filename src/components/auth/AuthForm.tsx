'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/useAuthStore'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { refreshProfile } = useAuthStore()

  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Client-side validation
    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      if (isSignUp) {
        console.log('Attempting signup with email:', email)
        
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(), // Normalize email
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        })

        if (error) {
          console.error('Sign up error:', error)
          // Handle specific Supabase errors
          if (error.message.includes('Invalid email') || error.message.includes('email_address_invalid')) {
            toast.error('Email validation failed. This might be a Supabase configuration issue.')
            console.error('Email validation error details:', error)
          } else if (error.message.includes('Password')) {
            toast.error('Password must be at least 6 characters long')
          } else if (error.message.includes('already registered')) {
            toast.error('An account with this email already exists')
          } else {
            toast.error(`Sign up failed: ${error.message}`)
          }
          return
        }

        if (data.user) {
          // Profile is created automatically by the trigger, so we don't need to create it manually
          // Just refresh the profile to get the latest data
          try {
            await refreshProfile()
            toast.success('Account created successfully! Welcome to AuroraNotes!')
          } catch (profileError) {
            console.warn('Profile refresh failed:', profileError)
            // Even if profile refresh fails, the account was created successfully
            toast.success('Account created successfully! Welcome to AuroraNotes!')
          }
        }
      } else {
        console.log('Attempting signin with email:', email)
        
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(), // Normalize email
          password,
        })

        if (error) {
          console.error('Sign in error:', error)
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password')
          } else if (error.message.includes('Email not confirmed')) {
            toast.error('Please check your email and confirm your account')
          } else {
            toast.error(`Sign in failed: ${error.message}`)
          }
          return
        }

        toast.success('Signed in successfully!')
        await refreshProfile()
      }
    } catch (error) {
      console.error('Authentication error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed'
      if (errorMessage.includes('Supabase not configured')) {
        toast.error('Please configure Supabase environment variables to use authentication features.')
      } else {
        toast.error(`Authentication failed: ${errorMessage}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          {isSignUp ? 'Start organizing your thoughts with AI' : 'Sign in to your account'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {isSignUp && (
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field pl-10"
                placeholder="Enter your full name"
                required={isSignUp}
              />
            </div>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field pl-10"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pl-10 pr-10"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              {isSignUp ? 'Creating Account...' : 'Signing In...'}
            </div>
          ) : (
            isSignUp ? 'Create Account' : 'Sign In'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
        >
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  )
}
