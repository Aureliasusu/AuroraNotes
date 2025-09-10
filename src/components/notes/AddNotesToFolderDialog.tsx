'use client'

import { useState, useEffect } from 'react'
import { useNotesStore } from '@/store/useNotesStore'
import { useFoldersStore } from '@/store/useFoldersStore'
import { Note, Folder } from '@/types/database'
import { X, Check, Search, FileText } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface AddNotesToFolderDialogProps {
  folderId: string
  folderName: string
  onClose: () => void
}

export function AddNotesToFolderDialog({ folderId, folderName, onClose }: AddNotesToFolderDialogProps) {
  const { notes, moveToFolder } = useNotesStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  // Filter notes that are not already in this folder
  const availableNotes = notes.filter(note => 
    note.folder_id !== folderId && 
    !note.is_archived &&
    (note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     note.content.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleNoteSelect = (noteId: string) => {
    setSelectedNotes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(noteId)) {
        newSet.delete(noteId)
      } else {
        newSet.add(noteId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedNotes.size === availableNotes.length) {
      setSelectedNotes(new Set())
    } else {
      setSelectedNotes(new Set(availableNotes.map(note => note.id)))
    }
  }

  const handleAddNotes = async () => {
    if (selectedNotes.size === 0) return

    setLoading(true)
    try {
      // Move all selected notes to the folder
      for (const noteId of selectedNotes) {
        await moveToFolder(noteId, folderId)
      }
      
      onClose()
    } catch (error) {
      console.error('Error adding notes to folder:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Add Notes to "{folderName}"
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-4">
          {availableNotes.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No available notes to add to this folder</p>
              <p className="text-sm mt-2">All notes are already in this folder or archived</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Select All */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                    selectedNotes.size === availableNotes.length
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-gray-300 dark:border-gray-500'
                  }`}>
                    {selectedNotes.size === availableNotes.length && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <span>
                    {selectedNotes.size === availableNotes.length ? 'Deselect All' : 'Select All'}
                  </span>
                </button>
                <span className="text-sm text-gray-500">
                  {selectedNotes.size} of {availableNotes.length} selected
                </span>
              </div>

              {/* Notes */}
              {availableNotes.map(note => (
                <div
                  key={note.id}
                  onClick={() => handleNoteSelect(note.id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedNotes.has(note.id)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-4 h-4 border-2 rounded flex items-center justify-center mt-1 ${
                      selectedNotes.has(note.id)
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300 dark:border-gray-500'
                    }`}>
                      {selectedNotes.has(note.id) && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">
                        {note.title || 'Untitled Note'}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {note.content?.replace(/<[^>]*>/g, '').substring(0, 100) || 'No content'}
                      </p>
                      <div className="flex items-center mt-2 space-x-2 text-xs text-gray-400">
                        <span>{formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}</span>
                        {note.tags && note.tags.length > 0 && (
                          <span>• {note.tags.length} tag{note.tags.length > 1 ? 's' : ''}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-500">
            {selectedNotes.size} note{selectedNotes.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleAddNotes}
              disabled={selectedNotes.size === 0 || loading}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : `Add ${selectedNotes.size} Note${selectedNotes.size !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
