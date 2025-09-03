'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  const { signUp, signIn } = useAuth()

  // Function to reset form state
  const resetForm = () => {
    setEmail('')
    setPassword('')
    setFullName('')
    setShowPassword(false)
    setLoading(false)
  }

  // Function to toggle between sign up and sign in
  const toggleAuthMode = () => {
    resetForm()
    setIsSignUp(!isSignUp)
  }

  // Reset form when auth mode changes
  useEffect(() => {
    resetForm()
  }, [isSignUp])

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
        const result = await signUp(email, password, fullName)
        if (result?.success) {
          // Clear form fields immediately
          resetForm()
          
          // Show success state
          setShowSuccess(true)
          
          // Show success message
          toast.success('Account created successfully! Please sign in to continue.')
          
          // Switch to sign in mode after a short delay
          setTimeout(() => {
            setIsSignUp(false)
            setShowSuccess(false)
          }, 2000)
          
          return
        }
      } else {
        const result = await signIn(email, password)
        if (result?.success) {
          // Clear form fields on successful sign in
          resetForm()
          return
        }
      }
    } catch (error) {
      console.error('Authentication error:', error)
      // Error handling is already done in the hook
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
        {showSuccess && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
            <div className="text-green-800 dark:text-green-200 font-medium">
              ✅ Account created successfully! Please sign in to continue.
            </div>
          </div>
        )}
        
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
          onClick={toggleAuthMode}
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
        >
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  )
}
