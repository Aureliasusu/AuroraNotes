'use client'

import { useState, useEffect, useRef } from 'react'
import { useNotesStore } from '@/store/useNotesStore'
import { useCollaborativeEditing } from '@/hooks/useCollaborativeEditing'
import { useUserPresence } from '@/hooks/useUserPresence'
import { Save, Tag, X, Eye, Edit3, Maximize2, Users } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import toast from 'react-hot-toast'
import { RichTextToolbar } from './RichTextToolbar'
import { FullscreenEditor } from './FullscreenEditor'
import { EnhancedRichTextEditor } from './EnhancedRichTextEditor'
import { CollaborationStatus } from '../collaboration/CollaborationStatus'

export function NoteEditor() {
  const { selectedNote, updateNote } = useNotesStore()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  
  // Collaborative editing functionality
  const {
    editingUsers,
    isEditing: isCollaborativeEditing,
    lastSaved,
    startEditing,
    stopEditing,
    saveNoteContent,
    broadcastCursorMove,
    broadcastUserTyping
  } = useCollaborativeEditing(selectedNote?.id)

  // Get online status from user presence
  const { isOnline } = useUserPresence(selectedNote?.id)

  const [showPreview, setShowPreview] = useState(false)
  const [editorMode, setEditorMode] = useState<'markdown' | 'rich'>('rich')
  const [showFullscreen, setShowFullscreen] = useState(false)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title)
      setContent(selectedNote.content)
      setTags(selectedNote.tags)
      setIsEditing(false)
      // Start collaborative editing when note is selected
      startEditing()
    } else {
      setTitle('')
      setContent('')
      setTags([])
      setIsEditing(false)
      // Stop collaborative editing when no note is selected
      stopEditing()
    }
  }, [selectedNote, startEditing, stopEditing])

  const handleAutoSave = async () => {
    if (!selectedNote) return

    try {
      await updateNote(selectedNote.id, {
        title,
        content,
        tags,
      })
      
      // Save content for collaborative editing
      await saveNoteContent(content)
    } catch (error) {
      toast.error('Failed to save note')
    }
  }

  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    if (selectedNote && (title !== selectedNote.title || content !== selectedNote.content || JSON.stringify(tags) !== JSON.stringify(selectedNote.tags))) {
      autoSaveTimeoutRef.current = setTimeout(handleAutoSave, 1000)
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [title, content, tags, selectedNote])

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      setShowPreview(!showPreview)
    }
  }

  // Handle content change for collaborative editing
  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    // Broadcast user typing
    broadcastUserTyping()
  }

  // Handle cursor movement for collaborative editing
  const handleCursorMove = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement
    broadcastCursorMove(target.selectionStart)
  }


  if (!selectedNote) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No note selected</h3>
          <p className="text-sm">Select a note from the sidebar to start editing</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Editor Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            className="text-2xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 w-full"
          />
          <div className="flex items-center space-x-2">
            {/* Editor Mode Toggle */}
            <div className="flex bg-gray-200 dark:bg-gray-700 rounded">
              <button
                onClick={() => setEditorMode('rich')}
                className={`px-3 py-1 text-sm rounded-l transition-colors flex items-center space-x-1 ${
                  editorMode === 'rich'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <Edit3 className="h-4 w-4" />
                <span>Rich</span>
              </button>
              <button
                onClick={() => setEditorMode('markdown')}
                className={`px-3 py-1 text-sm rounded-r transition-colors flex items-center space-x-1 ${
                  editorMode === 'markdown'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <span>Markdown</span>
              </button>
            </div>

            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center space-x-1"
            >
              <Eye className="h-4 w-4" />
              <span>{showPreview ? 'Edit' : 'Preview'}</span>
            </button>
            <button
              onClick={handleAutoSave}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center space-x-1"
            >
              <Save className="h-4 w-4" />
              <span>Save</span>
            </button>
            <button
              onClick={() => setShowFullscreen(true)}
              className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors flex items-center space-x-1"
              title="Fullscreen editor"
            >
              <Maximize2 className="h-4 w-4" />
              <span>Fullscreen</span>
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center space-x-2">
          <Tag className="h-4 w-4 text-gray-400" />
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded flex items-center space-x-1"
              >
                <span>{tag}</span>
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-blue-600 dark:hover:text-blue-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <div className="flex items-center space-x-1">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Add tag..."
                className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-transparent text-gray-700 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={handleAddTag}
                className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Collaboration Status */}
      {selectedNote && (
        <CollaborationStatus
          editingUsers={editingUsers}
          isOnline={isOnline}
          lastSaved={lastSaved}
        />
      )}

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {showPreview ? (
          <div className="h-full overflow-y-auto p-6">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                className="markdown-content"
              >
                {content}
              </ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Editor */}
            <div className="flex-1 overflow-hidden">
              {editorMode === 'rich' ? (
                <EnhancedRichTextEditor
                  content={content}
                  onChange={handleContentChange}
                  placeholder="Start writing your note... (Use toolbar for formatting)"
                  className="h-full"
                />
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onSelect={handleCursorMove}
                  onKeyUp={handleCursorMove}
                  placeholder="Start writing your note... (Use Markdown for formatting, Cmd+Enter for preview)"
                  className="w-full h-full p-6 resize-none bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-mono text-sm leading-relaxed"
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Editor Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center justify-between">
          <span>
            {content.length} characters • {content.split(' ').filter(word => word.length > 0).length} words
            {editorMode === 'rich' && ' • Rich Text Mode'}
            {editorMode === 'markdown' && ' • Markdown Mode'}
          </span>
          <span>
            {editorMode === 'rich' && 'Use toolbar for formatting'}
            {editorMode === 'markdown' && 'Press Cmd+Enter to toggle preview'}
          </span>
        </div>
      </div>

      {/* Fullscreen Editor */}
      {showFullscreen && (
        <FullscreenEditor onClose={() => setShowFullscreen(false)} />
      )}
    </div>
  )
}

