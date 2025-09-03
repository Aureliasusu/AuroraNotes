'use client'

import { useState, useEffect } from 'react'
import { useNotesStore } from '@/store/useNotesStore'
import { Note } from '@/types/database'
import { Plus, Search, Pin, Archive, Trash2, Tag } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

export function NotesList() {
  const { notes, loading, selectedNote, createNote, setSelectedNote, togglePin, toggleArchive, deleteNote } = useNotesStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'pinned' | 'archived'>('all')

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || 
                         (filter === 'pinned' && note.is_pinned) ||
                         (filter === 'archived' && note.is_archived)
    
    return matchesSearch && matchesFilter
  })

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

  const handleDeleteNote = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this note?')) {
      const success = await deleteNote(noteId)
      if (success) {
        toast.success('Note deleted successfully')
      }
    }
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
          <button
            onClick={handleCreateNote}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
          <div className="p-2 space-y-2">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => handleNoteClick(note)}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedNote?.id === note.id
                    ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700'
                    : 'note-card hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1">
                    {note.title}
                  </h3>
                  <div className="flex items-center space-x-1">
                    {note.is_pinned && (
                      <Pin className="h-3 w-3 text-yellow-500" />
                    )}
                    <button
                      onClick={(e) => handleTogglePin(e, note.id)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    >
                      <Pin className="h-3 w-3 text-gray-400 hover:text-yellow-500" />
                    </button>
                    <button
                      onClick={(e) => handleToggleArchive(e, note.id)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    >
                      <Archive className="h-3 w-3 text-gray-400 hover:text-blue-500" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteNote(e, note.id)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    >
                      <Trash2 className="h-3 w-3 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                  {truncateText(note.content)}
                </p>
                
                {note.tags.length > 0 && (
                  <div className="flex items-center space-x-1 mb-2">
                    <Tag className="h-3 w-3 text-gray-400" />
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 2 && (
                        <span className="text-xs text-gray-500">+{note.tags.length - 2}</span>
                      )}
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

