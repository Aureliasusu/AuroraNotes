'use client'

import { useState, useEffect } from 'react'
import { useFoldersStore } from '@/store/useFoldersStore'
import { useNotesStore } from '@/store/useNotesStore'
import { Folder } from '@/types/database'
import { Folder as FolderIcon, X, Check } from 'lucide-react'

interface MoveToFolderDialogProps {
  noteId: string
  currentFolderId: string | null
  onClose: () => void
}

export function MoveToFolderDialog({ noteId, currentFolderId, onClose }: MoveToFolderDialogProps) {
  const { folders, fetchFolders } = useFoldersStore()
  const { moveToFolder } = useNotesStore()
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(currentFolderId)

  useEffect(() => {
    fetchFolders()
  }, [fetchFolders])

  const handleMove = async () => {
    await moveToFolder(noteId, selectedFolderId)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 w-96 max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Move to Folder</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="space-y-2">
            {/* Unorganized option */}
            <button
              onClick={() => setSelectedFolderId(null)}
              className={`w-full flex items-center p-3 rounded-lg border transition-colors ${
                selectedFolderId === null
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <FolderIcon className="h-5 w-5 mr-3 text-gray-400" />
              <span className="flex-1 text-left text-gray-900 dark:text-white">Unorganized</span>
              {selectedFolderId === null && (
                <Check className="h-5 w-5 text-blue-600" />
              )}
            </button>

            {/* Folder options */}
            {folders.map(folder => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolderId(folder.id)}
                className={`w-full flex items-center p-3 rounded-lg border transition-colors ${
                  selectedFolderId === folder.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div
                  className="w-5 h-5 mr-3 rounded-sm"
                  style={{ backgroundColor: folder.color }}
                />
                <span className="flex-1 text-left text-gray-900 dark:text-white">{folder.name}</span>
                {selectedFolderId === folder.id && (
                  <Check className="h-5 w-5 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleMove}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Move
          </button>
        </div>
      </div>
    </div>
  )
}
