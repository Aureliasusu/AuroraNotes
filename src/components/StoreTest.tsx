'use client'

import { useAuthStore } from '@/store/useAuthStore'
import { useNotesStore } from '@/store/useNotesStore'

export function StoreTest() {
  const { user, profile, loading } = useAuthStore()
  const { notes, totalNotes } = useNotesStore()

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Store Status</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Auth Loading:</strong> {loading ? 'Yes' : 'No'}
        </div>
        
        <div>
          <strong>User:</strong> {user ? `${user.email} (${user.id})` : 'None'}
        </div>
        
        <div>
          <strong>Profile:</strong> {profile ? profile.full_name : 'None'}
        </div>
        
        <div>
          <strong>Notes Count:</strong> {totalNotes}
        </div>
        
        <div>
          <strong>Notes:</strong> {notes.map(note => note.title).join(', ') || 'None'}
        </div>
      </div>
    </div>
  )
}
