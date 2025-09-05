'use client'

import { useState, useEffect, useRef } from 'react'
import { useNotesStore } from '@/store/useNotesStore'
import { Save, Tag, X, Eye, Edit3 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import toast from 'react-hot-toast'
import { RichTextToolbar } from './RichTextToolbar'

export function NoteEditor() {
  const { selectedNote, updateNote } = useNotesStore()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [editorMode, setEditorMode] = useState<'markdown' | 'rich'>('rich')
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title)
      setContent(selectedNote.content)
      setTags(selectedNote.tags)
      setIsEditing(false)
    } else {
      setTitle('')
      setContent('')
      setTags([])
      setIsEditing(false)
    }
  }, [selectedNote])

  const handleAutoSave = async () => {
    if (!selectedNote) return

    try {
      await updateNote(selectedNote.id, {
        title,
        content,
        tags,
      })
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

  // Rich text editor functions
  const handleFormat = (format: string, value?: string) => {
    if (editorRef.current) {
      document.execCommand(format, false, value)
      editorRef.current.focus()
    }
  }

  const handleInsert = (type: string, value?: string) => {
    if (editorRef.current) {
      if (type === 'link' && value) {
        const [text, url] = value.split('|')
        const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`
        document.execCommand('insertHTML', false, linkHtml)
      }
      editorRef.current.focus()
    }
  }

  const handleUndo = () => {
    if (editorRef.current) {
      document.execCommand('undo')
      editorRef.current.focus()
    }
  }

  const handleRedo = () => {
    if (editorRef.current) {
      document.execCommand('redo')
      editorRef.current.focus()
    }
  }

  const handleEditorChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML
      setContent(newContent)
    }
  }

  const canUndo = () => {
    return document.queryCommandEnabled('undo')
  }

  const canRedo = () => {
    return document.queryCommandEnabled('redo')
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
            {/* Rich Text Toolbar */}
            {editorMode === 'rich' && (
              <RichTextToolbar
                onFormat={handleFormat}
                onInsert={handleInsert}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={canUndo()}
                canRedo={canRedo()}
              />
            )}
            
            {/* Editor */}
            <div className="flex-1 overflow-hidden">
              {editorMode === 'rich' ? (
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={handleEditorChange}
                  onKeyDown={handleKeyDown}
                  dangerouslySetInnerHTML={{ __html: content }}
                  className="w-full h-full p-6 overflow-y-auto bg-transparent text-gray-900 dark:text-white focus:outline-none"
                  style={{ minHeight: '200px' }}
                  suppressContentEditableWarning={true}
                />
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={handleKeyDown}
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
    </div>
  )
}

