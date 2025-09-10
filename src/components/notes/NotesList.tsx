'use client'

import { useState, useEffect } from 'react'
import { useNotesStore } from '@/store/useNotesStore'
import { Note } from '@/types/database'
import { Plus, Search, Pin, Archive, Trash2, Tag, GripVertical, FileText, Star, BarChart3, Folder, Move } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { NoteTemplates } from './NoteTemplates'
import { FolderManager } from './FolderManager'
import { AdvancedSearch } from './AdvancedSearch'
import { NoteStats } from './NoteStats'
import { MoveToFolderDialog } from './MoveToFolderDialog'
import { AddNotesToFolderDialog } from './AddNotesToFolderDialog'

// Sortable Note Item Component
function SortableNoteItem({ note, isSelected, onNoteClick, onTogglePin, onToggleArchive, onToggleStar, onMoveToFolder, onDelete }: {
  note: Note
  isSelected: boolean
  onNoteClick: (note: Note) => void
  onTogglePin: (e: React.MouseEvent, noteId: string) => void
  onToggleArchive: (e: React.MouseEvent, noteId: string) => void
  onToggleStar: (e: React.MouseEvent, noteId: string) => void
  onMoveToFolder: (noteId: string) => void
  onDelete: (e: React.MouseEvent, noteId: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
        isSelected ? 'bg-blue-50 dark:bg-blue-900 border-l-4 border-l-blue-500' : ''
      }`}
      onClick={() => onNoteClick(note)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-white truncate">
            {note.title || 'Untitled Note'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
            {note.content?.replace(/<[^>]*>/g, '').substring(0, 100) || 'No content'}
          </p>
          <div className="flex items-center mt-2 space-x-2">
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
            </span>
            {note.tags && note.tags.length > 0 && (
              <div className="flex items-center space-x-1">
                <Tag className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-400">
                  {note.tags.length} tag{note.tags.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>
        
          <div className="flex items-center space-x-1 ml-2">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
          
          {/* Action Buttons */}
          <button
            onClick={(e) => onToggleStar(e, note.id)}
            className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
              note.is_starred ? 'text-yellow-500' : 'text-gray-400'
            }`}
            title={note.is_starred ? 'Unstar note' : 'Star note'}
          >
            <Star className="h-4 w-4" />
          </button>
          
          <button
            onClick={(e) => onTogglePin(e, note.id)}
            className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
              note.is_pinned ? 'text-yellow-500' : 'text-gray-400'
            }`}
            title={note.is_pinned ? 'Unpin note' : 'Pin note'}
          >
            <Pin className="h-4 w-4" />
          </button>
          
          <button
            onClick={(e) => onToggleArchive(e, note.id)}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400"
            title={note.is_archived ? 'Unarchive note' : 'Archive note'}
          >
            <Archive className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => onMoveToFolder(note.id)}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400"
            title="Move to folder"
          >
            <Move className="h-4 w-4" />
          </button>
          
          <button
            onClick={(e) => onDelete(e, note.id)}
            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 text-gray-400 hover:text-red-500"
            title="Delete note"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function NotesList() {
  const { notes, loading, selectedNote, createNote, setSelectedNote, togglePin, toggleArchive, toggleStar, moveToFolder, deleteNote, reorderNotes } = useNotesStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'pinned' | 'archived' | 'starred'>('all')
  const [showTemplates, setShowTemplates] = useState(false)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [showNoteStats, setShowNoteStats] = useState(false)
  const [searchResults, setSearchResults] = useState<Note[] | null>(null)
  const [showMoveDialog, setShowMoveDialog] = useState(false)
  const [noteToMove, setNoteToMove] = useState<string | null>(null)
  const [showAddNotesDialog, setShowAddNotesDialog] = useState(false)
  const [targetFolder, setTargetFolder] = useState<{ id: string; name: string } | null>(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const filteredNotes = (searchResults || notes).filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || 
                         (filter === 'pinned' && note.is_pinned) ||
                         (filter === 'archived' && note.is_archived) ||
                         (filter === 'starred' && note.is_starred)
    const matchesFolder = selectedFolderId === null || 
                         (selectedFolderId === 'starred' && note.is_starred) ||
                         note.folder_id === selectedFolderId
    
    return matchesSearch && matchesFilter && matchesFolder
  })

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = filteredNotes.findIndex(note => note.id === active.id)
      const newIndex = filteredNotes.findIndex(note => note.id === over?.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedNotes = arrayMove(filteredNotes, oldIndex, newIndex)
        
        // Update the order in the store
        await reorderNotes(reorderedNotes.map(note => note.id))
        toast.success('Notes reordered successfully!')
      }
    }
  }

  const handleCreateNote = async () => {
    const newNote = await createNote({
      title: 'Untitled Note',
      content: '',
      tags: [],
      is_archived: false,
      is_pinned: false,
    })

    if (newNote) {
      toast.success('New note created!')
    }
  }

  const handleSelectTemplate = async (template: any) => {
    const newNote = await createNote({
      title: template.name,
      content: template.content,
      tags: template.tags,
      is_archived: false,
      is_pinned: false,
    })

    if (newNote) {
      toast.success(`Note created from ${template.name} template!`)
      setShowTemplates(false)
    }
  }

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note)
  }

  const handleTogglePin = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation()
    await togglePin(noteId)
  }

  const handleToggleArchive = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation()
    await toggleArchive(noteId)
  }

  const handleToggleStar = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation()
    await toggleStar(noteId)
  }

  const handleDeleteNote = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this note?')) {
      const success = await deleteNote(noteId)
      if (success) {
        toast.success('Note deleted successfully')
      }
    }
  }

  const handleFolderSelect = (folderId: string | null) => {
    setSelectedFolderId(folderId)
    setSearchResults(null) // Clear search results when changing folders
  }

  const handleSearchResults = (results: Note[]) => {
    setSearchResults(results)
    setShowAdvancedSearch(false)
  }

  const clearSearch = () => {
    setSearchResults(null)
    setSearchTerm('')
  }

  const handleMoveToFolder = (noteId: string) => {
    setNoteToMove(noteId)
    setShowMoveDialog(true)
  }

  const handleCloseMoveDialog = () => {
    setShowMoveDialog(false)
    setNoteToMove(null)
  }

  const handleAddNotesToFolder = (folderId: string, folderName: string) => {
    setTargetFolder({ id: folderId, name: folderName })
    setShowAddNotesDialog(true)
  }

  const handleCloseAddNotesDialog = () => {
    setShowAddNotesDialog(false)
    setTargetFolder(null)
  }

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notes</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowNoteStats(true)}
              className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              title="View statistics"
            >
              <BarChart3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowAdvancedSearch(true)}
              className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              title="Advanced search"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowTemplates(true)}
              className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              title="Create from template"
            >
              <FileText className="h-4 w-4" />
            </button>
            <button
              onClick={handleCreateNote}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              title="Create new note"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchResults && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pinned')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              filter === 'pinned'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Pinned
          </button>
          <button
            onClick={() => setFilter('starred')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              filter === 'starred'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <Star className="h-3 w-3 inline mr-1" />
            Starred
          </button>
          <button
            onClick={() => setFilter('archived')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              filter === 'archived'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Archived
          </button>
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
            <p className="text-sm">No notes found</p>
            <button
              onClick={handleCreateNote}
              className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
            >
              Create your first note
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredNotes.map(note => note.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredNotes.map((note) => (
                  <SortableNoteItem
                    key={note.id}
                    note={note}
                    isSelected={selectedNote?.id === note.id}
                    onNoteClick={handleNoteClick}
                    onTogglePin={handleTogglePin}
                    onToggleArchive={handleToggleArchive}
                    onToggleStar={handleToggleStar}
                    onMoveToFolder={handleMoveToFolder}
                    onDelete={handleDeleteNote}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Folder Manager */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <FolderManager
          selectedFolderId={selectedFolderId}
          onFolderSelect={handleFolderSelect}
          onFolderCreate={() => {}} // Will be implemented
          onFolderUpdate={() => {}} // Will be implemented
          onFolderDelete={() => {}} // Will be implemented
          onAddNotesToFolder={handleAddNotesToFolder}
        />
      </div>

      {/* Modals */}
      {showTemplates && (
        <NoteTemplates
          onSelectTemplate={handleSelectTemplate}
          onClose={() => setShowTemplates(false)}
        />
      )}

      {showAdvancedSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <AdvancedSearch
            onSearchResults={handleSearchResults}
            onClose={() => setShowAdvancedSearch(false)}
          />
        </div>
      )}

      {showNoteStats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <NoteStats
            onClose={() => setShowNoteStats(false)}
          />
        </div>
      )}

      {showMoveDialog && noteToMove && (
        <MoveToFolderDialog
          noteId={noteToMove}
          currentFolderId={notes.find(n => n.id === noteToMove)?.folder_id || null}
          onClose={handleCloseMoveDialog}
        />
      )}

      {showAddNotesDialog && targetFolder && (
        <AddNotesToFolderDialog
          folderId={targetFolder.id}
          folderName={targetFolder.name}
          onClose={handleCloseAddNotesDialog}
        />
      )}
    </div>
  )
}

