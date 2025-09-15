'use client'

import { useState, useEffect } from 'react'
import { useNotesStore } from '@/store/useNotesStore'
import { useAuthStore } from '@/store/useAuthStore'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

export default function SimpleDashboardPage() {
  const { user } = useAuthStore()
  const { notes, selectedNote, setSelectedNote, fetchNotes, updateNote } = useNotesStore()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    if (user) {
      fetchNotes()
    }
  }, [user, fetchNotes])

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title)
      setContent(selectedNote.content)
    }
  }, [selectedNote])

  const handleSave = async () => {
    if (!selectedNote) return
    
    try {
      await updateNote(selectedNote.id, {
        title,
        content
      })
      console.log('✅ Note saved successfully')
    } catch (error) {
      console.error('❌ Error saving note:', error)
    }
  }

  if (!user) {
    return <div className="p-4">Please log in first</div>
  }

  return (
    <DashboardLayout>
      <div className="h-full flex">
        {/* Notes List */}
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notes</h2>
          </div>
          <div className="overflow-y-auto">
            {notes.map(note => (
              <div
                key={note.id}
                onClick={() => {
                  console.log('🔍 Clicking note:', note.id, note.title)
                  console.log('🔍 User can edit:', note.user_id === user.id)
                  setSelectedNote(note)
                }}
                className={`p-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  selectedNote?.id === note.id ? 'bg-blue-50 dark:bg-blue-900' : ''
                }`}
              >
                <h3 className="font-medium text-gray-900 dark:text-white">{note.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {note.user_id === user.id ? '✅ You own this note' : '❌ Not your note'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Note Editor */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
          {selectedNote ? (
            <>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white w-full"
                  placeholder="Note title..."
                />
              </div>
              <div className="flex-1 p-4">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-full bg-transparent border-none outline-none text-gray-900 dark:text-white resize-none"
                  placeholder="Note content..."
                />
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Save Note
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">No note selected</h3>
                <p className="text-sm">Select a note from the sidebar to start editing</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

