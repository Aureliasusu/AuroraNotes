'use client'

import { useState, useEffect } from 'react'
import { useNotesStore } from '@/store/useNotesStore'
import { X, Minimize2, Maximize2, Save, Eye, Edit3 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import toast from 'react-hot-toast'
import { RichTextToolbar } from './RichTextToolbar'

interface FullscreenEditorProps {
  onClose: () => void
}

export function FullscreenEditor({ onClose }: FullscreenEditorProps) {
  const { selectedNote, updateNote } = useNotesStore()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [editorMode, setEditorMode] = useState<'markdown' | 'rich'>('rich')
  const [isFullscreen, setIsFullscreen] = useState(true)

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title)
      setContent(selectedNote.content)
    }
  }, [selectedNote])

  useEffect(() => {
    // Prevent body scroll when in fullscreen
    if (isFullscreen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isFullscreen])

  const handleSave = async () => {
    if (!selectedNote) return

    try {
      await updateNote(selectedNote.id, {
        title,
        content,
      })
      toast.success('Note saved!')
    } catch (error) {
      toast.error('Failed to save note')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
    if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSave()
    }
  }

  // Rich text editor functions
  const handleFormat = (format: string, value?: string) => {
    const editor = document.getElementById('fullscreen-editor')
    if (editor) {
      document.execCommand(format, false, value)
      editor.focus()
    }
  }

  const handleInsert = (type: string, value?: string) => {
    const editor = document.getElementById('fullscreen-editor')
    if (editor) {
      if (type === 'link' && value) {
        const [text, url] = value.split('|')
        const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`
        document.execCommand('insertHTML', false, linkHtml)
      }
      editor.focus()
    }
  }

  const handleUndo = () => {
    const editor = document.getElementById('fullscreen-editor')
    if (editor) {
      document.execCommand('undo')
      editor.focus()
    }
  }

  const handleRedo = () => {
    const editor = document.getElementById('fullscreen-editor')
    if (editor) {
      document.execCommand('redo')
      editor.focus()
    }
  }

  const handleEditorChange = () => {
    const editor = document.getElementById('fullscreen-editor')
    if (editor) {
      const newContent = editor.innerHTML
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No note selected</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Please select a note to edit in fullscreen mode</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Fullscreen Editor</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        </div>

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
            onClick={handleSave}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center space-x-1"
          >
            <Save className="h-4 w-4" />
            <span>Save</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Close fullscreen (Esc)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Title Input */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
          className="text-2xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 w-full"
        />
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {showPreview ? (
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  className="markdown-content"
                >
                  {content}
                </ReactMarkdown>
              </div>
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
                  id="fullscreen-editor"
                  contentEditable
                  onInput={handleEditorChange}
                  dangerouslySetInnerHTML={{ __html: content }}
                  className="w-full h-full p-8 overflow-y-auto bg-transparent text-gray-900 dark:text-white focus:outline-none"
                  style={{ minHeight: '100%' }}
                  suppressContentEditableWarning={true}
                />
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start writing your note... (Use Markdown for formatting)"
                  className="w-full h-full p-8 resize-none bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-mono text-sm leading-relaxed"
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center justify-between">
          <span>
            {content.length} characters • {content.split(' ').filter(word => word.length > 0).length} words
            {editorMode === 'rich' && ' • Rich Text Mode'}
            {editorMode === 'markdown' && ' • Markdown Mode'}
          </span>
          <span>
            Press Ctrl+S to save • Press Esc to close
          </span>
        </div>
      </div>
    </div>
  )
}
