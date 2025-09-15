'use client'

import { useAuthStore } from '@/store/useAuthStore'
import { useNotesStore } from '@/store/useNotesStore'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function DebugPage() {
  const { user, session, loading: authLoading } = useAuthStore()
  const { notes, loading: notesLoading, error, fetchNotes } = useNotesStore()
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    const runDebug = async () => {
      if (!user) return

      try {
        // Test direct Supabase query
        const { data: directNotes, error: directError } = await supabase
          .from('notes')
          .select('*')
          .eq('user_id', user.id)
          .limit(5)

        setDebugInfo({
          user: {
            id: user.id,
            email: user.email,
          },
          session: session ? 'exists' : 'null',
          directQuery: {
            success: !directError,
            error: directError?.message,
            notesCount: directNotes?.length || 0,
            notes: directNotes
          },
          store: {
            notesCount: notes.length,
            loading: notesLoading,
            error: error
          }
        })
      } catch (err) {
        setDebugInfo({
          error: err instanceof Error ? err.message : 'Unknown error'
        })
      }
    }

    runDebug()
  }, [user, session, notes, notesLoading, error])

  const handleFetchNotes = async () => {
    await fetchNotes()
  }

  const handleTestCreate = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          title: 'Debug Test Note ' + Date.now(),
          content: 'This is a test note from debug page',
          user_id: user.id,
          is_archived: false,
          is_pinned: false
        })
        .select()
        .single()

      if (error) {
        console.error('Create error:', error)
        alert('Create failed: ' + error.message)
      } else {
        console.log('Create success:', data)
        alert('Note created successfully!')
        await fetchNotes() // Refresh the list
      }
    } catch (err) {
      console.error('Create exception:', err)
      alert('Create exception: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  if (authLoading) {
    return <div className="p-8">Loading authentication...</div>
  }

  if (!user) {
    return <div className="p-8">Please log in to see debug info.</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Information</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">User Info</h2>
          <pre className="text-sm">{JSON.stringify(debugInfo?.user, null, 2)}</pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Direct Supabase Query</h2>
          <pre className="text-sm">{JSON.stringify(debugInfo?.directQuery, null, 2)}</pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Store State</h2>
          <pre className="text-sm">{JSON.stringify(debugInfo?.store, null, 2)}</pre>
        </div>

        <div className="space-x-4">
          <button
            onClick={handleFetchNotes}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Fetch Notes from Store
          </button>
          
          <button
            onClick={handleTestCreate}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Test Create Note
          </button>
        </div>

        {debugInfo?.error && (
          <div className="bg-red-100 p-4 rounded">
            <h2 className="text-lg font-semibold mb-2 text-red-800">Error</h2>
            <pre className="text-sm text-red-700">{debugInfo.error}</pre>
          </div>
        )}
      </div>
    </div>
  )
}

