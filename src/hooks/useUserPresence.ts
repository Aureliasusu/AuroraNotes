'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/useAuthStore'

interface OnlineUser {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  online_at: string
  note_id?: string
}

export function useUserPresence(noteId?: string) {
  const { user } = useAuthStore()
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [isOnline, setIsOnline] = useState(false)
  const channelRef = useRef<any>(null)

  useEffect(() => {
    if (!user) {
      // User not logged in, clean up state
      setOnlineUsers([])
      setIsOnline(false)
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
      return
    }

    // For now, set user as online immediately (simplified version)
    setIsOnline(true)
    setOnlineUsers([{
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name || '',
      avatar_url: user.user_metadata?.avatar_url || '',
      online_at: new Date().toISOString(),
      note_id: noteId
    }])

    // TODO: Implement full Realtime presence when Supabase Realtime is enabled
    // Create online status channel
    const channel = supabase
      .channel('user-presence')
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const allUsers = Object.values(state).flat() as OnlineUser[]
        // Only show users from current note
        const currentNoteUsers = allUsers.filter(user => user.note_id === noteId)
        console.log('🔍 Presence sync - Current noteId:', noteId)
        console.log('🔍 All users:', allUsers.map(u => ({ id: u.id, note_id: u.note_id })))
        console.log('🔍 Filtered users for current note:', currentNoteUsers.map(u => ({ id: u.id, note_id: u.note_id })))
        setOnlineUsers(currentNoteUsers)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }: any) => {
        const users = Object.values(newPresences).flat() as OnlineUser[]
        // Only add users from current note
        const currentNoteUsers = users.filter(user => user.note_id === noteId)
        console.log('🔍 User joined - Current noteId:', noteId)
        console.log('🔍 New users:', users.map(u => ({ id: u.id, note_id: u.note_id })))
        console.log('🔍 Filtered new users for current note:', currentNoteUsers.map(u => ({ id: u.id, note_id: u.note_id })))
        setOnlineUsers(prev => [...prev, ...currentNoteUsers])
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }: any) => {
        const users = Object.values(leftPresences).flat() as OnlineUser[]
        // Only remove users from current note
        const currentNoteUsers = users.filter(user => user.note_id === noteId)
        console.log('🔍 User left - Current noteId:', noteId)
        console.log('🔍 Left users:', users.map(u => ({ id: u.id, note_id: u.note_id })))
        console.log('🔍 Filtered left users for current note:', currentNoteUsers.map(u => ({ id: u.id, note_id: u.note_id })))
        setOnlineUsers(prev => 
          prev.filter(user => !currentNoteUsers.some(leftUser => leftUser.id === user.id))
        )
      })
      .subscribe(async (status: any) => {
        if (status === 'SUBSCRIBED') {
          // After successful subscription, send own online status
          try {
            await channel.track({
              id: user.id,
              email: user.email || '',
              full_name: user.user_metadata?.full_name || '',
              avatar_url: user.user_metadata?.avatar_url || '',
              online_at: new Date().toISOString(),
              note_id: noteId
            })
            setIsOnline(true)
          } catch (error) {
            // Keep online status even if tracking fails
          }
        }
      })

    channelRef.current = channel

    // Cleanup function
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
      setIsOnline(false)
    }
  }, [user, noteId])

  // Update current user's editing note
  const updateCurrentNote = async (newNoteId?: string) => {
    if (channelRef.current && user) {
      await channelRef.current.track({
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || '',
        avatar_url: user.user_metadata?.avatar_url || '',
        online_at: new Date().toISOString(),
        note_id: newNoteId
      })
    }
  }

  return {
    onlineUsers,
    isOnline,
    updateCurrentNote
  }
}
