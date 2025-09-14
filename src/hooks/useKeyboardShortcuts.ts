'use client'

import { useEffect, useCallback } from 'react'

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  action: () => void
  description: string
}

interface UseKeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[]
  enabled?: boolean
}

export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsProps) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true'
    ) {
      // Allow some shortcuts even in input fields
      const allowedInInput = ['Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12']
      if (!allowedInInput.includes(event.key)) {
        return
      }
    }

    shortcuts.forEach((shortcut) => {
      const {
        key,
        ctrlKey = false,
        metaKey = false,
        shiftKey = false,
        altKey = false,
        action
      } = shortcut

      if (
        event.key === key &&
        event.ctrlKey === ctrlKey &&
        event.metaKey === metaKey &&
        event.shiftKey === shiftKey &&
        event.altKey === altKey
      ) {
        event.preventDefault()
        action()
      }
    })
  }, [shortcuts, enabled])

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, enabled])
}

// Common keyboard shortcuts for note editing
export const createNoteShortcuts = (actions: {
  onSave?: () => void
  onNewNote?: () => void
  onDeleteNote?: () => void
  onTogglePreview?: () => void
  onToggleFullscreen?: () => void
  onSearch?: () => void
  onToggleTheme?: () => void
  onUndo?: () => void
  onRedo?: () => void
  onBold?: () => void
  onItalic?: () => void
  onUnderline?: () => void
  onToggleTemplates?: () => void
  onToggleFolders?: () => void
  onFocusSearch?: () => void
}) => {
  const shortcuts: KeyboardShortcut[] = []

  if (actions.onSave) {
    shortcuts.push({
      key: 's',
      ctrlKey: true,
      action: actions.onSave,
      description: 'Save note'
    })
  }

  if (actions.onNewNote) {
    shortcuts.push({
      key: 'n',
      ctrlKey: true,
      action: actions.onNewNote,
      description: 'New note'
    })
  }

  if (actions.onDeleteNote) {
    shortcuts.push({
      key: 'Delete',
      ctrlKey: true,
      action: actions.onDeleteNote,
      description: 'Delete note'
    })
  }

  if (actions.onTogglePreview) {
    shortcuts.push({
      key: 'Enter',
      metaKey: true,
      action: actions.onTogglePreview,
      description: 'Toggle preview'
    })
  }

  if (actions.onToggleFullscreen) {
    shortcuts.push({
      key: 'f',
      ctrlKey: true,
      action: actions.onToggleFullscreen,
      description: 'Toggle fullscreen'
    })
  }

  if (actions.onSearch) {
    shortcuts.push({
      key: 'k',
      ctrlKey: true,
      action: actions.onSearch,
      description: 'Open search'
    })
  }

  if (actions.onToggleTheme) {
    shortcuts.push({
      key: 't',
      ctrlKey: true,
      shiftKey: true,
      action: actions.onToggleTheme,
      description: 'Toggle theme'
    })
  }

  if (actions.onUndo) {
    shortcuts.push({
      key: 'z',
      ctrlKey: true,
      action: actions.onUndo,
      description: 'Undo'
    })
  }

  if (actions.onRedo) {
    shortcuts.push({
      key: 'y',
      ctrlKey: true,
      action: actions.onRedo,
      description: 'Redo'
    })
  }

  if (actions.onBold) {
    shortcuts.push({
      key: 'b',
      ctrlKey: true,
      action: actions.onBold,
      description: 'Bold text'
    })
  }

  if (actions.onItalic) {
    shortcuts.push({
      key: 'i',
      ctrlKey: true,
      action: actions.onItalic,
      description: 'Italic text'
    })
  }

  if (actions.onUnderline) {
    shortcuts.push({
      key: 'u',
      ctrlKey: true,
      action: actions.onUnderline,
      description: 'Underline text'
    })
  }

  if (actions.onToggleTemplates) {
    shortcuts.push({
      key: 't',
      ctrlKey: true,
      action: actions.onToggleTemplates,
      description: 'Toggle templates'
    })
  }

  if (actions.onToggleFolders) {
    shortcuts.push({
      key: 'f',
      ctrlKey: true,
      shiftKey: true,
      action: actions.onToggleFolders,
      description: 'Toggle folders'
    })
  }

  if (actions.onFocusSearch) {
    shortcuts.push({
      key: '/',
      action: actions.onFocusSearch,
      description: 'Focus search'
    })
  }

  return shortcuts
}
