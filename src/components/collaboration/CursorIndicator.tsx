'use client'

import { useEffect, useRef } from 'react'

interface CursorIndicatorProps {
  editingUsers: Array<{
    id: string
    email: string
    full_name?: string
    avatar_url?: string
    cursor_position?: number
    isTyping?: boolean
  }>
  editorRef: React.RefObject<HTMLElement>
}

export function CursorIndicator({ editingUsers, editorRef }: CursorIndicatorProps) {
  const cursorRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  useEffect(() => {
    if (!editorRef.current) return

    const editor = editorRef.current
    const editorRect = editor.getBoundingClientRect()

    // Remove old cursors
    cursorRefs.current.forEach((cursorEl) => {
      if (cursorEl.parentNode) {
        cursorEl.parentNode.removeChild(cursorEl)
      }
    })
    cursorRefs.current.clear()

    // Add new cursors for other users
    editingUsers.forEach((user) => {
      if (!user.cursor_position || user.cursor_position < 0) return

      const cursorEl = document.createElement('div')
      cursorEl.className = `absolute pointer-events-none z-10 ${
        user.isTyping ? 'animate-pulse' : ''
      }`
      cursorEl.style.backgroundColor = getColorForUser(user.id)
      cursorEl.style.width = '2px'
      cursorEl.style.height = '20px'
      cursorEl.style.borderRadius = '1px'
      
      // Add user info tooltip
      cursorEl.title = `${user.full_name || user.email} ${user.isTyping ? 'is typing...' : 'is editing'}`
      
      // Add user avatar
      const avatarEl = document.createElement('div')
      avatarEl.className = 'absolute -top-6 -left-2 w-4 h-4 rounded-full border border-white shadow-sm flex items-center justify-center text-xs text-white font-medium'
      avatarEl.style.backgroundColor = getColorForUser(user.id)
      
      if (user.avatar_url) {
        const img = document.createElement('img')
        img.src = user.avatar_url
        img.alt = user.full_name || user.email
        img.className = 'w-full h-full rounded-full object-cover'
        avatarEl.appendChild(img)
      } else {
        avatarEl.textContent = (user.full_name || user.email).charAt(0).toUpperCase()
      }
      
      cursorEl.appendChild(avatarEl)
      
      // Position cursor
      try {
        const textNode = getTextNodeAtPosition(editor, user.cursor_position)
        if (textNode) {
          const range = document.createRange()
          range.setStart(textNode, Math.min(user.cursor_position, textNode.textContent?.length || 0))
          range.setEnd(textNode, Math.min(user.cursor_position, textNode.textContent?.length || 0))
          
          const rect = range.getBoundingClientRect()
          cursorEl.style.left = `${rect.left - editorRect.left}px`
          cursorEl.style.top = `${rect.top - editorRect.top}px`
        }
      } catch (error) {
        console.warn('Could not position cursor for user:', user.id, error)
      }

      editor.appendChild(cursorEl)
      cursorRefs.current.set(user.id, cursorEl)
    })

    return () => {
      // Cleanup on unmount
      cursorRefs.current.forEach((cursorEl) => {
        if (cursorEl.parentNode) {
          cursorEl.parentNode.removeChild(cursorEl)
        }
      })
      cursorRefs.current.clear()
    }
  }, [editingUsers, editorRef])

  return null
}

// Helper function to get text node at specific position
function getTextNodeAtPosition(element: HTMLElement, position: number): Text | null {
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null
  )

  let currentPos = 0
  let node: Text | null = null

  while ((node = walker.nextNode() as Text)) {
    const nodeLength = node.textContent?.length || 0
    if (currentPos + nodeLength >= position) {
      return node
    }
    currentPos += nodeLength
  }

  return null
}

// Generate consistent color for user
function getColorForUser(userId: string): string {
  const colors = [
    '#3B82F6', // blue
    '#EF4444', // red
    '#10B981', // green
    '#F59E0B', // yellow
    '#8B5CF6', // purple
    '#F97316', // orange
    '#06B6D4', // cyan
    '#84CC16', // lime
  ]
  
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colors[Math.abs(hash) % colors.length]
}
