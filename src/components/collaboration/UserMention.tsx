'use client'

import { useState, useEffect, useRef } from 'react'
import { User, AtSign } from 'lucide-react'

interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
}

interface UserMentionProps {
  users: User[]
  onMention: (user: User) => void
  isOpen: boolean
  onClose: () => void
  position: { x: number; y: number }
}

export function UserMention({ users, onMention, isOpen, onClose, position }: UserMentionProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const selectedItem = listRef.current.children[selectedIndex] as HTMLElement
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredUsers.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredUsers.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (filteredUsers[selectedIndex]) {
          onMention(filteredUsers[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        onClose()
        break
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, selectedIndex, filteredUsers])

  if (!isOpen || filteredUsers.length === 0) return null

  return (
    <div
      className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-w-xs w-full"
      style={{
        left: position.x,
        top: position.y,
        maxHeight: '200px'
      }}
    >
      <div className="p-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <AtSign className="h-4 w-4 text-blue-600" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            autoFocus
          />
        </div>
      </div>
      
      <div ref={listRef} className="max-h-32 overflow-y-auto">
        {filteredUsers.map((user, index) => (
          <button
            key={user.id}
            onClick={() => onMention(user)}
            className={`w-full flex items-center space-x-3 p-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name || user.email}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                (user.full_name || user.email).charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.full_name || user.email}
              </div>
              {user.full_name && (
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
      
      <div className="p-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
        Use ↑↓ to navigate, Enter to select, Esc to close
      </div>
    </div>
  )
}
