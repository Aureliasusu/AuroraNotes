'use client'

import { useState, useEffect } from 'react'
import { useNotesStore } from '@/store/useNotesStore'
import { useAuthStore } from '@/store/useAuthStore'
import { supabase } from '@/lib/supabase'

export default function DebugPermissionPage() {
  const { user } = useAuthStore()
  const { notes, selectedNote, setSelectedNote, fetchNotes } = useNotesStore()
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    if (user) {
      fetchNotes()
    }
  }, [user, fetchNotes])

  const testNoteSelection = async (noteId: string) => {
    console.log('🔍 Testing note selection for:', noteId)
    
    try {
      // Find the note
      const note = notes.find(n => n.id === noteId)
      if (!note) {
        console.error('Note not found:', noteId)
        return
      }

      console.log('🔍 Note found:', note)
      console.log('🔍 Current user:', user)
      console.log('🔍 Note owner:', note.user_id)
      console.log('🔍 User can edit:', note.user_id === user?.id)

      // Test direct Supabase query
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .single()

      console.log('🔍 Direct Supabase query result:', { data, error })

      // Test setSelectedNote
      console.log('🔍 Setting selected note...')
      setSelectedNote(note)
      console.log('🔍 Selected note set successfully')

      setDebugInfo({
        note,
        user,
        canEdit: note.user_id === user?.id,
        directQuery: { data, error },
        selectedNoteSet: true
      })

    } catch (error) {
      console.error('🔍 Error during note selection test:', error)
      setDebugInfo({
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
    }
  }

  if (!user) {
    return <div className="p-4">Please log in first</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Permission Debug Page</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">User Info</h2>
        <p className="text-gray-700 dark:text-gray-300">Logged in as: {user.email} (ID: {user.id})</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Notes ({notes.length})</h2>
        <div className="space-y-2">
          {notes.map(note => (
            <div key={note.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{note.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Owner: {note.user_id}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Can edit: {note.user_id === user.id ? '✅ Yes' : '❌ No'}
                  </p>
                </div>
                <button
                  onClick={() => testNoteSelection(note.id)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Test Selection
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {debugInfo && (
        <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Debug Info</h2>
          <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Instructions</h2>
        <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300">
          <li>Click "Test Selection" on any note</li>
          <li>Check browser console for debug messages (🔍 prefix)</li>
          <li>Look for any error messages or permission popups</li>
          <li>Report what you see</li>
        </ol>
      </div>
    </div>
  )
}

