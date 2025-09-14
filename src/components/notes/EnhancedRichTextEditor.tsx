'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { RichTextToolbar } from './RichTextToolbar'
import toast from 'react-hot-toast'

interface EnhancedRichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
}

interface HistoryState {
  content: string
  timestamp: number
}

export function EnhancedRichTextEditor({ 
  content, 
  onChange, 
  placeholder = "Start writing...",
  className = ""
}: EnhancedRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [history, setHistory] = useState<HistoryState[]>([{ content: '', timestamp: Date.now() }])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [isComposing, setIsComposing] = useState(false)
  const lastSaveTimeRef = useRef<number>(0)

  // Save history state
  const saveToHistory = useCallback((newContent: string) => {
    const now = Date.now()
    
    // Prevent frequent saves (only save once within 500ms)
    if (now - lastSaveTimeRef.current < 500) {
      return
    }
    
    lastSaveTimeRef.current = now
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push({ content: newContent, timestamp: now })
      
      // Limit history records (max 50 entries)
      if (newHistory.length > 50) {
        newHistory.shift()
        return newHistory
      }
      
      return newHistory
    })
    
    setHistoryIndex(prev => Math.min(prev + 1, 49))
  }, [historyIndex])

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      const newContent = history[newIndex].content
      onChange(newContent)
      
      if (editorRef.current) {
        editorRef.current.innerHTML = newContent
      }
    }
  }, [historyIndex, history, onChange])

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      const newContent = history[newIndex].content
      onChange(newContent)
      
      if (editorRef.current) {
        editorRef.current.innerHTML = newContent
      }
    }
  }, [historyIndex, history, onChange])

  // Check if undo/redo is possible
  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  // Format text
  const handleFormat = useCallback((format: string, value?: string) => {
    if (editorRef.current) {
      editorRef.current.focus()
      
      try {
        if (format === 'fontSize' && value) {
          document.execCommand('fontSize', false, '7')
          const fontElements = editorRef.current.querySelectorAll('font[size="7"]')
          fontElements.forEach(el => {
            if (el instanceof HTMLElement) {
              el.removeAttribute('size')
              el.style.fontSize = value
            }
          })
        } else {
          document.execCommand(format, false, value)
        }
        
        // Trigger content change
        const newContent = editorRef.current.innerHTML
        onChange(newContent)
        saveToHistory(newContent)
      } catch (error) {
        console.error('Format error:', error)
        toast.error('Formatting failed')
      }
    }
  }, [onChange, saveToHistory])

  // Insert content
  const handleInsert = useCallback((type: string, value?: string) => {
    if (editorRef.current) {
      editorRef.current.focus()
      
      try {
        if (type === 'html' && value) {
          document.execCommand('insertHTML', false, value)
        } else if (type === 'link' && value) {
          const [text, url] = value.split('|')
          const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`
          document.execCommand('insertHTML', false, linkHtml)
        }
        
        // Trigger content change
        const newContent = editorRef.current.innerHTML
        onChange(newContent)
        saveToHistory(newContent)
      } catch (error) {
        console.error('Insert error:', error)
        toast.error('Insert failed')
      }
    }
  }, [onChange, saveToHistory])

  // Handle image upload
  const handleImageUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      const imgHtml = `<img src="${imageUrl}" alt="Uploaded image" style="max-width: 100%; height: auto; margin: 10px 0;" />`
      handleInsert('html', imgHtml)
      toast.success('Image uploaded successfully')
    }
    reader.onerror = () => {
      toast.error('Failed to upload image')
    }
    reader.readAsDataURL(file)
  }, [handleInsert])

  // Handle content change
  const handleContentChange = useCallback(() => {
    if (editorRef.current && !isComposing) {
      const newContent = editorRef.current.innerHTML
      onChange(newContent)
      saveToHistory(newContent)
    }
  }, [onChange, saveToHistory, isComposing])

  // Handle keyboard events
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle undo/redo shortcuts
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
        return
      }
      if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
        e.preventDefault()
        redo()
        return
      }
    }

    // Handle other shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault()
          handleFormat('bold')
          break
        case 'i':
          e.preventDefault()
          handleFormat('italic')
          break
        case 'u':
          e.preventDefault()
          handleFormat('underline')
          break
        case 's':
          e.preventDefault()
          toast.success('Content saved to history')
          break
      }
    }
  }, [undo, redo, handleFormat])

  // Handle input method
  const handleCompositionStart = useCallback(() => {
    setIsComposing(true)
  }, [])

  const handleCompositionEnd = useCallback(() => {
    setIsComposing(false)
    // Trigger content change after input method ends
    setTimeout(() => {
      if (editorRef.current) {
        const newContent = editorRef.current.innerHTML
        onChange(newContent)
        saveToHistory(newContent)
      }
    }, 100)
  }, [onChange, saveToHistory])

  // Initialize content
  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content
    }
  }, [content])

  // Initialize history
  useEffect(() => {
    if (content && history.length === 1 && history[0].content === '') {
      setHistory([{ content, timestamp: Date.now() }])
      setHistoryIndex(0)
    }
  }, [content, history])

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Toolbar */}
      <RichTextToolbar
        onFormat={handleFormat}
        onInsert={handleInsert}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onImageUpload={handleImageUpload}
      />
      
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleContentChange}
        onKeyDown={handleKeyDown}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        className="flex-1 p-4 overflow-y-auto bg-transparent text-gray-900 dark:text-white focus:outline-none"
        style={{ minHeight: '200px' }}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
      />
      
      {/* Styles */}
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        
        [contenteditable] {
          line-height: 1.6;
        }
        
        [contenteditable] h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 1rem 0;
        }
        
        [contenteditable] h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.8rem 0;
        }
        
        [contenteditable] h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0.6rem 0;
        }
        
        [contenteditable] h4 {
          font-size: 1.1rem;
          font-weight: bold;
          margin: 0.5rem 0;
        }
        
        [contenteditable] blockquote {
          border-left: 4px solid #ccc;
          margin: 1rem 0;
          padding-left: 1rem;
          font-style: italic;
          color: #666;
        }
        
        [contenteditable] pre {
          background: #f4f4f4;
          padding: 1rem;
          border-radius: 4px;
          margin: 1rem 0;
          overflow-x: auto;
          font-family: 'Courier New', monospace;
        }
        
        [contenteditable] code {
          background: #f4f4f4;
          padding: 0.2rem 0.4rem;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
        }
        
        [contenteditable] table {
          border-collapse: collapse;
          width: 100%;
          margin: 1rem 0;
        }
        
        [contenteditable] table td {
          border: 1px solid #ccc;
          padding: 0.5rem;
        }
        
        [contenteditable] img {
          max-width: 100%;
          height: auto;
          margin: 0.5rem 0;
        }
        
        [contenteditable] a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        [contenteditable] a:hover {
          color: #1d4ed8;
        }
      `}</style>
    </div>
  )
}
