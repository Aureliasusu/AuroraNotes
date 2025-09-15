'use client'

import { useState, useEffect } from 'react'
import { X, UserPlus, Users, Edit, Eye, Crown, Mail } from 'lucide-react'
import { useNoteSharing } from '@/hooks/useNoteSharing'
import toast from 'react-hot-toast'

interface ShareNoteDialogProps {
  noteId: string
  noteTitle: string
  isOpen: boolean
  onClose: () => void
}

export function ShareNoteDialog({ noteId, noteTitle, isOpen, onClose }: ShareNoteDialogProps) {
  const { shares, isLoading, getNoteShares, shareNote, updateSharePermission, removeShare } = useNoteSharing()
  
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newPermission, setNewPermission] = useState<'read' | 'edit' | 'admin'>('edit')
  const [isSharing, setIsSharing] = useState(false)

  useEffect(() => {
    if (isOpen && noteId) {
      getNoteShares(noteId)
    }
  }, [isOpen, noteId, getNoteShares])

  const handleShareNote = async () => {
    if (!newUserEmail.trim()) {
      toast.error('Please enter a user email')
      return
    }

    setIsSharing(true)
    try {
      await shareNote(noteId, newUserEmail.trim(), newPermission)
      setNewUserEmail('')
      setNewPermission('edit')
    } finally {
      setIsSharing(false)
    }
  }

  const handlePermissionChange = async (shareId: string, permission: 'read' | 'edit' | 'admin') => {
    await updateSharePermission(shareId, permission)
  }

  const handleRemoveShare = async (shareId: string) => {
    if (confirm('Are you sure you want to remove this share?')) {
      await removeShare(shareId)
    }
  }

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'read':
        return <Eye className="h-4 w-4 text-blue-500" />
      case 'edit':
        return <Edit className="h-4 w-4 text-green-500" />
      case 'admin':
        return <Crown className="h-4 w-4 text-purple-500" />
      default:
        return <Eye className="h-4 w-4 text-gray-500" />
    }
  }

  const getPermissionLabel = (permission: string) => {
    switch (permission) {
      case 'read':
        return 'Read Only'
      case 'edit':
        return 'Can Edit'
      case 'admin':
        return 'Admin'
      default:
        return 'Unknown'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Share Note
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Note Info */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
              {noteTitle}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Share this note with other users to collaborate
            </p>
          </div>

          {/* Add New Share */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Add People
            </h4>
            <div className="flex space-x-3">
              <div className="flex-1">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={newPermission}
                onChange={(e) => setNewPermission(e.target.value as 'read' | 'edit' | 'admin')}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="read">Read Only</option>
                <option value="edit">Can Edit</option>
                <option value="admin">Admin</option>
              </select>
              <button
                onClick={handleShareNote}
                disabled={isSharing || !newUserEmail.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>{isSharing ? 'Sharing...' : 'Share'}</span>
              </button>
            </div>
          </div>

          {/* Existing Shares */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              People with Access ({shares.length})
            </h4>
            
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Loading shares...</p>
              </div>
            ) : shares.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">
                  No one else has access to this note yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {shares.map((share) => (
                  <div
                    key={share.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                          {(share.user.full_name || share.user.email).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {share.user.full_name || share.user.email}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {share.user.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getPermissionIcon(share.permission)}
                        <select
                          value={share.permission}
                          onChange={(e) => handlePermissionChange(share.id, e.target.value as 'read' | 'edit' | 'admin')}
                          className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          <option value="read">Read Only</option>
                          <option value="edit">Can Edit</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      
                      <button
                        onClick={() => handleRemoveShare(share.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Remove access"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

