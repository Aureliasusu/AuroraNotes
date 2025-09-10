'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { useFoldersStore } from '@/store/useFoldersStore'
import { Folder } from '@/types/database'
import { 
  Folder as FolderIcon, 
  FolderOpen, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronRight, 
  ChevronDown,
  Palette,
  FileText
} from 'lucide-react'
import toast from 'react-hot-toast'

interface FolderManagerProps {
  selectedFolderId: string | null
  onFolderSelect: (folderId: string | null) => void
  onFolderCreate: (folder: Folder) => void
  onFolderUpdate: (folder: Folder) => void
  onFolderDelete: (folderId: string) => void
  onAddNotesToFolder: (folderId: string, folderName: string) => void
}

export function FolderManager({ 
  selectedFolderId, 
  onFolderSelect, 
  onFolderCreate, 
  onFolderUpdate, 
  onFolderDelete,
  onAddNotesToFolder
}: FolderManagerProps) {
  const { user } = useAuthStore()
  const { folders, loading, fetchFolders, createFolder, updateFolder, deleteFolder } = useFoldersStore()
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderColor, setNewFolderColor] = useState('#3b82f6')

  const folderColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ]

  useEffect(() => {
    if (user) {
      fetchFolders()
    }
  }, [user, fetchFolders])

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newFolderName.trim()) return

    const newFolder = await createFolder({
      name: newFolderName.trim(),
      color: newFolderColor,
      parent_id: null,
    })

    if (newFolder) {
      onFolderCreate(newFolder)
      setNewFolderName('')
      setShowCreateForm(false)
    }
  }

  const handleUpdateFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingFolder || !newFolderName.trim()) return

    const updatedFolder = await updateFolder(editingFolder.id, {
      name: newFolderName.trim(),
      color: newFolderColor,
    })

    if (updatedFolder) {
      onFolderUpdate(updatedFolder)
      setEditingFolder(null)
      setNewFolderName('')
    }
  }

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('Are you sure you want to delete this folder? Notes in this folder will be moved to "Unorganized".')) {
      return
    }

    const success = await deleteFolder(folderId)
    if (success) {
      onFolderDelete(folderId)
    }
  }

  const toggleFolderExpansion = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
      }
      return newSet
    })
  }

  const startEditing = (folder: Folder) => {
    setEditingFolder(folder)
    setNewFolderName(folder.name)
    setNewFolderColor(folder.color)
  }

  const cancelEditing = () => {
    setEditingFolder(null)
    setNewFolderName('')
    setShowCreateForm(false)
  }

  const renderFolderForm = (isEditing: boolean = false) => (
    <form onSubmit={isEditing ? handleUpdateFolder : handleCreateFolder} className="p-2">
      <div className="space-y-2">
        <input
          type="text"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          placeholder="Folder name"
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          autoFocus
          required
        />
        
        <div className="flex items-center space-x-2">
          <Palette className="h-4 w-4 text-gray-500" />
          <div className="flex space-x-1">
            {folderColors.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setNewFolderColor(color)}
                className={`w-6 h-6 rounded-full border-2 ${
                  newFolderColor === color ? 'border-gray-900 dark:border-white' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
          </button>
          <button
            type="button"
            onClick={cancelEditing}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  )

  return (
    <div className="space-y-1">
      {/* All Notes */}
      <button
        onClick={() => onFolderSelect(null)}
        className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
          selectedFolderId === null
            ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        <FolderIcon className="h-4 w-4 mr-2" />
        All Notes
      </button>

      {/* Starred Notes */}
      <button
        onClick={() => onFolderSelect('starred')}
        className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
          selectedFolderId === 'starred'
            ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        <span className="h-4 w-4 mr-2">⭐</span>
        Starred
      </button>

      {/* Folders */}
      {folders.map(folder => (
        <div key={folder.id}>
          <div className="flex items-center">
            <button
              onClick={() => toggleFolderExpansion(folder.id)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              {expandedFolders.has(folder.id) ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
            
            <button
              onClick={() => onFolderSelect(folder.id)}
              className={`flex-1 flex items-center px-2 py-2 text-sm rounded-md transition-colors ${
                selectedFolderId === folder.id
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div
                className="w-4 h-4 mr-2 rounded-sm"
                style={{ backgroundColor: folder.color }}
              />
              {folder.name}
            </button>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => onAddNotesToFolder(folder.id, folder.name)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-green-600"
                title="Add notes to this folder"
              >
                <FileText className="h-3 w-3" />
              </button>
              <button
                onClick={() => startEditing(folder)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Edit folder"
              >
                <Edit2 className="h-3 w-3" />
              </button>
              <button
                onClick={() => handleDeleteFolder(folder.id)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-600"
                title="Delete folder"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>

          {editingFolder?.id === folder.id && (
            <div className="ml-6 mt-1">
              {renderFolderForm(true)}
            </div>
          )}
        </div>
      ))}

      {/* Create New Folder */}
      {showCreateForm ? (
        <div className="ml-6">
          {renderFolderForm()}
        </div>
      ) : (
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full flex items-center px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Folder
        </button>
      )}
    </div>
  )
}
