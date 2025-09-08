'use client'

import { useState, useRef } from 'react'
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  Type,
  List,
  ListOrdered,
  Quote,
  Code,
  Palette,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Image,
  Undo,
  Redo,
  Table,
  Minus,
  Plus,
  Upload
} from 'lucide-react'
import { ColorPicker } from '../ui/ColorPicker'
import { TableInsertDialog } from '../ui/TableInsertDialog'

interface RichTextToolbarProps {
  onFormat: (format: string, value?: string) => void
  onInsert: (type: string, value?: string) => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  onImageUpload?: (file: File) => void
}

export function RichTextToolbar({ 
  onFormat, 
  onInsert, 
  onUndo, 
  onRedo, 
  canUndo, 
  canRedo,
  onImageUpload
}: RichTextToolbarProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [showFontSize, setShowFontSize] = useState(false)
  const [showTableDialog, setShowTableDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const [currentTextColor, setCurrentTextColor] = useState('#000000')
  const [currentHighlightColor, setCurrentHighlightColor] = useState('#FFFF00')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleTextColorSelect = (color: string) => {
    setCurrentTextColor(color)
    onFormat('foreColor', color)
  }

  const handleHighlightColorSelect = (color: string) => {
    setCurrentHighlightColor(color)
    onFormat('backColor', color)
  }

  const handleLinkInsert = () => {
    if (linkUrl && linkText) {
      onInsert('link', `${linkText}|${linkUrl}`)
      setLinkUrl('')
      setLinkText('')
      setShowLinkDialog(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && onImageUpload) {
      onImageUpload(file)
    }
  }

  const handleTableInsert = (tableHtml: string) => {
    onInsert('html', tableHtml)
  }

  const insertCodeBlock = () => {
    const codeHtml = `
      <pre style="background: #f4f4f4; padding: 10px; border-radius: 4px; margin: 10px 0; overflow-x: auto;">
        <code>// Your code here</code>
      </pre>
    `
    onInsert('html', codeHtml)
  }

  const insertQuote = () => {
    const quoteHtml = `
      <blockquote style="border-left: 4px solid #ccc; margin: 10px 0; padding-left: 16px; font-style: italic; color: #666;">
        Your quote here
      </blockquote>
    `
    onInsert('html', quoteHtml)
  }

  const insertHorizontalRule = () => {
    onInsert('html', '<hr style="margin: 20px 0; border: none; border-top: 1px solid #ccc;">')
  }

  const fontSizeOptions = [
    { value: '12px', label: '12px' },
    { value: '14px', label: '14px' },
    { value: '16px', label: '16px' },
    { value: '18px', label: '18px' },
    { value: '20px', label: '20px' },
    { value: '24px', label: '24px' },
    { value: '28px', label: '28px' },
    { value: '32px', label: '32px' }
  ]

  const ToolbarButton = ({ 
    onClick, 
    icon: Icon, 
    title, 
    disabled = false,
    active = false 
  }: {
    onClick: () => void
    icon: any
    title: string
    disabled?: boolean
    active?: boolean
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
        active ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : ''
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  )

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2">
      <div className="flex items-center space-x-1 flex-wrap">
        {/* Undo/Redo */}
        <div className="flex items-center space-x-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
          <ToolbarButton
            onClick={onUndo}
            icon={Undo}
            title="Undo"
            disabled={!canUndo}
          />
          <ToolbarButton
            onClick={onRedo}
            icon={Redo}
            title="Redo"
            disabled={!canRedo}
          />
        </div>

        {/* Text Formatting */}
        <div className="flex items-center space-x-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
          <ToolbarButton
            onClick={() => onFormat('bold')}
            icon={Bold}
            title="Bold"
          />
          <ToolbarButton
            onClick={() => onFormat('italic')}
            icon={Italic}
            title="Italic"
          />
          <ToolbarButton
            onClick={() => onFormat('underline')}
            icon={Underline}
            title="Underline"
          />
          <ToolbarButton
            onClick={() => onFormat('strikeThrough')}
            icon={Strikethrough}
            title="Strikethrough"
          />
        </div>

        {/* Headers */}
        <div className="flex items-center space-x-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
          <select
            onChange={(e) => onFormat('formatBlock', e.target.value)}
            className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            title="Text Style"
          >
            <option value="div">Normal</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
            <option value="h5">Heading 5</option>
            <option value="h6">Heading 6</option>
          </select>
        </div>

        {/* Font Size */}
        <div className="flex items-center space-x-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
          <div className="relative">
            <ToolbarButton
              onClick={() => setShowFontSize(!showFontSize)}
              icon={Type}
              title="Font Size"
            />
            {showFontSize && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-lg z-10">
                {fontSizeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onFormat('fontSize', option.value)
                      setShowFontSize(false)
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Lists & Blocks */}
        <div className="flex items-center space-x-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
          <ToolbarButton
            onClick={() => onFormat('insertUnorderedList')}
            icon={List}
            title="Bullet List"
          />
          <ToolbarButton
            onClick={() => onFormat('insertOrderedList')}
            icon={ListOrdered}
            title="Numbered List"
          />
          <ToolbarButton
            onClick={insertQuote}
            icon={Quote}
            title="Quote Block"
          />
          <ToolbarButton
            onClick={insertCodeBlock}
            icon={Code}
            title="Code Block"
          />
          <ToolbarButton
            onClick={() => setShowTableDialog(true)}
            icon={Table}
            title="Insert Table"
          />
          <ToolbarButton
            onClick={insertHorizontalRule}
            icon={Minus}
            title="Horizontal Rule"
          />
        </div>

        {/* Alignment */}
        <div className="flex items-center space-x-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
          <ToolbarButton
            onClick={() => onFormat('justifyLeft')}
            icon={AlignLeft}
            title="Align Left"
          />
          <ToolbarButton
            onClick={() => onFormat('justifyCenter')}
            icon={AlignCenter}
            title="Align Center"
          />
          <ToolbarButton
            onClick={() => onFormat('justifyRight')}
            icon={AlignRight}
            title="Align Right"
          />
        </div>

        {/* Colors */}
        <div className="flex items-center space-x-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
          <ColorPicker
            onColorSelect={handleTextColorSelect}
            currentColor={currentTextColor}
            title="Text Color"
            type="text"
          />
          <ColorPicker
            onColorSelect={handleHighlightColorSelect}
            currentColor={currentHighlightColor}
            title="Highlight Color"
            type="highlight"
          />
        </div>

        {/* Insert */}
        <div className="flex items-center space-x-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <ToolbarButton
            onClick={() => fileInputRef.current?.click()}
            icon={Image}
            title="Insert Image"
          />
          <div className="relative">
            <ToolbarButton
              onClick={() => setShowLinkDialog(true)}
              icon={Link}
              title="Insert Link"
            />
            {showLinkDialog && (
              <div className="absolute top-full left-0 mt-1 p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-lg z-10 w-64">
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Link text"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <input
                    type="url"
                    placeholder="URL"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleLinkInsert}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Insert
                    </button>
                    <button
                      onClick={() => setShowLinkDialog(false)}
                      className="px-3 py-1 text-sm bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table Insert Dialog */}
      <TableInsertDialog
        isOpen={showTableDialog}
        onClose={() => setShowTableDialog(false)}
        onInsert={handleTableInsert}
      />
    </div>
  )
}
