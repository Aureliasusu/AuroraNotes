'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { useNotesStore } from '@/store/useNotesStore'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { NotesList } from '@/components/notes/NotesList'
import { NoteEditor } from '@/components/notes/NoteEditor'
import { AIAssistant } from '@/components/ai/AIAssistant'

export default function DashboardPage() {
  const { user, loading } = useAuthStore()
  const { fetchNotes } = useNotesStore()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchNotes()
    }
  }, [user, fetchNotes])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to home
  }

  return (
    <DashboardLayout>
      <div className="flex h-full">
        {/* Sidebar with notes list */}
        <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <NotesList />
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex">
            {/* Note editor */}
            <div className="flex-1">
              <NoteEditor />
            </div>

            {/* AI Assistant sidebar */}
            <div className="w-96 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <AIAssistant />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

