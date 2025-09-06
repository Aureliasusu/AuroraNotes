'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { useNotesStore } from '@/store/useNotesStore'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { ResizableLayout } from '@/components/layout/ResizableLayout'

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
      <div className="h-full">
        <ResizableLayout />
      </div>
    </DashboardLayout>
  )
}

