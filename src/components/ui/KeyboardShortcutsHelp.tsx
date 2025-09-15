'use client'

import { useState, useEffect } from 'react'
import { X, Keyboard, Command, Shift, Ctrl, Alt } from 'lucide-react'

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  description: string
}

interface KeyboardShortcutsHelpProps {
  shortcuts: KeyboardShortcut[]
  isOpen: boolean
  onClose: () => void
}

export function KeyboardShortcutsHelp({ shortcuts, isOpen, onClose }: KeyboardShortcutsHelpProps) {
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const getCategory = (shortcut: KeyboardShortcut): string => {
    const desc = shortcut.description.toLowerCase()
    if (desc.includes('save') || desc.includes('new') || desc.includes('delete')) {
      return 'Note Actions'
    }
    if (desc.includes('preview') || desc.includes('fullscreen') || desc.includes('theme')) {
      return 'View & Display'
    }
    if (desc.includes('undo') || desc.includes('redo') || desc.includes('bold') || desc.includes('italic')) {
      return 'Editing'
    }
    if (desc.includes('search') || desc.includes('template') || desc.includes('folder')) {
      return 'Navigation & Tools'
    }
    return 'Other'
  }

  const filteredShortcuts = shortcuts.filter(shortcut =>
    shortcut.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shortcut.key.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const groupedShortcuts = filteredShortcuts.reduce((groups, shortcut) => {
    const category = getCategory(shortcut)
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(shortcut)
    return groups
  }, {} as Record<string, KeyboardShortcut[]>)

  const renderKey = (shortcut: KeyboardShortcut) => {
    const keys = []
    
    if (shortcut.ctrlKey) keys.push('Ctrl')
    if (shortcut.metaKey) keys.push('Cmd')
    if (shortcut.shiftKey) keys.push('Shift')
    if (shortcut.altKey) keys.push('Alt')
    keys.push(shortcut.key)

    return (
      <div className="flex items-center space-x-1">
        {keys.map((key, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && <span className="text-gray-400 mx-1">+</span>}
            <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded border border-gray-300 dark:border-gray-600">
              {key}
            </kbd>
          </div>
        ))}
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Keyboard className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Keyboard Shortcuts</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Quick actions to speed up your workflow</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <input
              type="text"
              placeholder="Search shortcuts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Keyboard className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Shortcuts */}
        <div className="flex-1 overflow-y-auto p-6">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category} className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {category}
              </h3>
              <div className="space-y-3">
                {categoryShortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {shortcut.description}
                    </span>
                    {renderKey(shortcut)}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredShortcuts.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <Keyboard className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No shortcuts found</p>
              <p className="text-sm">Try a different search term</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Press <kbd className="px-1 py-0.5 text-xs font-mono bg-gray-200 dark:bg-gray-700 rounded">Esc</kbd> to close
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
