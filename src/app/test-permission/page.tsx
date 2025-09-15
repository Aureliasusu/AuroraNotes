'use client'

import React, { useState, useEffect } from 'react'
import { useNotesStore } from '@/store/useNotesStore'
import { useAuthStore } from '@/store/useAuthStore'
import { supabase } from '@/lib/supabase'

export default function TestPermissionPage() {
  const { notes, selectedNote, setSelectedNote, updateNote, fetchNotes } = useNotesStore()
  const { user } = useAuthStore()
  const [testResult, setTestResult] = useState<any>(null)

  // Load notes when component mounts
  useEffect(() => {
    if (user) {
      fetchNotes()
    }
  }, [user, fetchNotes])

  const testPermission = async () => {
    if (!user || !selectedNote) return

    try {
      // Test direct Supabase query
      const { data: directNotes, error: directError } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)

      // Test update permission
      const { data: updateData, error: updateError } = await supabase
        .from('notes')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedNote.id)
        .select()

      // Test store update
      const storeResult = await updateNote(selectedNote.id, {
        title: selectedNote.title + ' (test)'
      })

      setTestResult({
        user: {
          id: user.id,
          email: user.email,
        },
        selectedNote: {
          id: selectedNote.id,
          title: selectedNote.title,
          user_id: selectedNote.user_id
        },
        directQuery: {
          success: !directError,
          error: directError?.message,
          data: directNotes
        },
        updateQuery: {
          success: !updateError,
          error: updateError?.message,
          data: updateData
        },
        storeUpdate: {
          success: !!storeResult,
          result: storeResult
        }
      })
    } catch (err) {
      setTestResult({
        error: err instanceof Error ? err.message : 'Unknown error'
      })
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Permission Test Page</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">User & Notes Info</h2>
          <pre className="text-sm">
            {JSON.stringify({
              user: user ? { id: user.id, email: user.email } : null,
              notesCount: notes.length,
              selectedNote: selectedNote ? { id: selectedNote.id, title: selectedNote.title, user_id: selectedNote.user_id } : null
            }, null, 2)}
          </pre>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Select a Note</h2>
          <div className="space-y-1">
            {notes.map(note => (
              <button
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className={`w-full p-2 text-left border rounded ${
                  selectedNote?.id === note.id 
                    ? 'bg-blue-100 border-blue-500' 
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                {note.title || 'Untitled Note'} (User: {note.user_id})
              </button>
            ))}
          </div>
        </div>

        {selectedNote && (
          <div className="bg-blue-50 p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">Permission Test</h2>
            <button
              onClick={testPermission}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Test Permission
            </button>
          </div>
        )}

        {testResult && (
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">Test Result</h2>
            <pre className="text-sm">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
