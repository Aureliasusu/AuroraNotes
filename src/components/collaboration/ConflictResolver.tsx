'use client'

import { useState } from 'react'
import { AlertTriangle, Check, X } from 'lucide-react'

interface ConflictResolverProps {
  conflicts: Array<{
    id: string
    field: string
    localValue: string
    remoteValue: string
    remoteUser: string
    timestamp: Date
  }>
  onResolve: (conflictId: string, resolution: 'local' | 'remote' | 'merge') => void
  onDismiss: (conflictId: string) => void
}

export function ConflictResolver({ conflicts, onResolve, onDismiss }: ConflictResolverProps) {
  if (conflicts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      {conflicts.map((conflict) => (
        <ConflictCard
          key={conflict.id}
          conflict={conflict}
          onResolve={onResolve}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  )
}

function ConflictCard({ 
  conflict, 
  onResolve, 
  onDismiss 
}: { 
  conflict: ConflictResolverProps['conflicts'][0]
  onResolve: (conflictId: string, resolution: 'local' | 'remote' | 'merge') => void
  onDismiss: (conflictId: string) => void
}) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-3 shadow-lg">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Edit Conflict Detected
          </h4>
          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
            {conflict.remoteUser} also edited the {conflict.field} field
          </p>
          
          {showDetails && (
            <div className="mt-3 space-y-2">
              <div>
                <label className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                  Your version:
                </label>
                <div className="mt-1 p-2 bg-white dark:bg-gray-800 rounded border text-xs text-gray-700 dark:text-gray-300 max-h-20 overflow-y-auto">
                  {conflict.localValue}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                  {conflict.remoteUser}'s version:
                </label>
                <div className="mt-1 p-2 bg-white dark:bg-gray-800 rounded border text-xs text-gray-700 dark:text-gray-300 max-h-20 overflow-y-auto">
                  {conflict.remoteValue}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-2 mt-3">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-yellow-700 dark:text-yellow-300 hover:text-yellow-800 dark:hover:text-yellow-200 underline"
            >
              {showDetails ? 'Hide details' : 'Show details'}
            </button>
          </div>
          
          <div className="flex items-center space-x-2 mt-3">
            <button
              onClick={() => onResolve(conflict.id, 'local')}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <Check className="h-3 w-3" />
              <span>Keep mine</span>
            </button>
            <button
              onClick={() => onResolve(conflict.id, 'remote')}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              <Check className="h-3 w-3" />
              <span>Use theirs</span>
            </button>
            <button
              onClick={() => onResolve(conflict.id, 'merge')}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              <Check className="h-3 w-3" />
              <span>Merge</span>
            </button>
            <button
              onClick={() => onDismiss(conflict.id)}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              <X className="h-3 w-3" />
              <span>Dismiss</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
