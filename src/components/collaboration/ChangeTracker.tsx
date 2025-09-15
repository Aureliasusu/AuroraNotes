'use client'

import { useState, useEffect } from 'react'
import { GitBranch, Clock, User, Eye, EyeOff, RotateCcw, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Change {
  id: string
  type: 'insert' | 'delete' | 'modify'
  content: string
  position: number
  length: number
  author: {
    id: string
    name: string
    email: string
    avatar_url?: string
  }
  timestamp: string
  description?: string
}

interface ChangeTrackerProps {
  changes: Change[]
  onAcceptChange: (changeId: string) => void
  onRejectChange: (changeId: string) => void
  onRestoreVersion: (versionId: string) => void
  isOpen: boolean
  onClose: () => void
}

export function ChangeTracker({
  changes,
  onAcceptChange,
  onRejectChange,
  onRestoreVersion,
  isOpen,
  onClose
}: ChangeTrackerProps) {
  const [filter, setFilter] = useState<'all' | 'insert' | 'delete' | 'modify'>('all')
  const [showAccepted, setShowAccepted] = useState(true)
  const [sortBy, setSortBy] = useState<'timestamp' | 'author' | 'type'>('timestamp')

  const filteredChanges = changes.filter(change => {
    if (filter !== 'all' && change.type !== filter) return false
    return true
  })

  const sortedChanges = [...filteredChanges].sort((a, b) => {
    switch (sortBy) {
      case 'timestamp':
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      case 'author':
        return a.author.name.localeCompare(b.author.name)
      case 'type':
        return a.type.localeCompare(b.type)
      default:
        return 0
    }
  })

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'insert':
        return <div className="w-2 h-2 bg-green-500 rounded-full" />
      case 'delete':
        return <div className="w-2 h-2 bg-red-500 rounded-full" />
      case 'modify':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full" />
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full" />
    }
  }

  const getChangeColor = (type: string) => {
    switch (type) {
      case 'insert':
        return 'text-green-600 dark:text-green-400'
      case 'delete':
        return 'text-red-600 dark:text-red-400'
      case 'modify':
        return 'text-yellow-600 dark:text-yellow-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getChangeDescription = (change: Change) => {
    switch (change.type) {
      case 'insert':
        return `Added "${change.content.substring(0, 50)}${change.content.length > 50 ? '...' : ''}"`
      case 'delete':
        return `Removed "${change.content.substring(0, 50)}${change.content.length > 50 ? '...' : ''}"`
      case 'modify':
        return `Modified content at position ${change.position}`
      default:
        return 'Unknown change'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GitBranch className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Change History
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Close"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Filter:
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-2 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Changes</option>
                <option value="insert">Insertions</option>
                <option value="delete">Deletions</option>
                <option value="modify">Modifications</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Sort by:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="timestamp">Time</option>
                <option value="author">Author</option>
                <option value="type">Type</option>
              </select>
            </div>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showAccepted}
                onChange={(e) => setShowAccepted(e.target.checked)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Show accepted changes
              </span>
            </label>
          </div>
        </div>

        {/* Changes List */}
        <div className="flex-1 overflow-y-auto p-4">
          {sortedChanges.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No changes found</p>
              <p className="text-sm">Changes will appear here as users edit the note</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedChanges.map((change) => (
                <div
                  key={change.id}
                  className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getChangeIcon(change.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`text-sm font-medium ${getChangeColor(change.type)}`}>
                          {change.type.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Position {change.position}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {getChangeDescription(change)}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{change.author.name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDistanceToNow(new Date(change.timestamp), { addSuffix: true })}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => onAcceptChange(change.id)}
                            className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => onRejectChange(change.id)}
                            className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {sortedChanges.length} change{sortedChanges.length !== 1 ? 's' : ''} found
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onRestoreVersion('latest')}
                className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center space-x-1"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Restore Latest</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
