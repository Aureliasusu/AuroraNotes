'use client'

import { Users, Clock, Wifi, WifiOff } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface CollaborationStatusProps {
  editingUsers: Array<{
    id: string
    email: string
    full_name?: string
    avatar_url?: string
    last_seen: string
  }>
  isOnline: boolean
  lastSaved?: Date | null
}

export function CollaborationStatus({ 
  editingUsers, 
  isOnline, 
  lastSaved 
}: CollaborationStatusProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 min-h-[60px]">
      {/* Left side: Online status and editing users */}
      <div className="flex items-center space-x-4">
        {/* Connection status */}
        <div className="flex items-center space-x-1">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {isOnline ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Editing users - Always show */}
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {editingUsers.length > 0 ? `${editingUsers.length} editing` : 'No one else editing'}
          </span>
          {editingUsers.length > 0 && (
            <div className="flex -space-x-2">
              {editingUsers.slice(0, 3).map((user) => (
                <div
                  key={user.id}
                  className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs text-white font-medium"
                  title={`${user.full_name || user.email} is editing`}
                >
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
              ))}
              {editingUsers.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-gray-400 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs text-white font-medium">
                  +{editingUsers.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right side: Last saved time */}
      <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
        <Clock className="h-4 w-4" />
        <span>
          {lastSaved ? formatDistanceToNow(lastSaved, { addSuffix: true }) : 'Not saved yet'}
        </span>
      </div>
    </div>
  )
}
