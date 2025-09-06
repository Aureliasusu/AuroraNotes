'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'

type Theme = 'light' | 'dark' | 'system'

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Get theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      setTheme('system')
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }

    localStorage.setItem('theme', theme)
  }, [theme, mounted])

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
  }

  if (!mounted) {
    return (
      <div className="p-2">
        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => handleThemeChange('light')}
          className={`p-2 rounded-md transition-colors ${
            theme === 'light'
              ? 'bg-white dark:bg-gray-800 text-yellow-600 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
          title="Light theme"
        >
          <Sun className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => handleThemeChange('dark')}
          className={`p-2 rounded-md transition-colors ${
            theme === 'dark'
              ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
          title="Dark theme"
        >
          <Moon className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => handleThemeChange('system')}
          className={`p-2 rounded-md transition-colors ${
            theme === 'system'
              ? 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
          title="System theme"
        >
          <Monitor className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
