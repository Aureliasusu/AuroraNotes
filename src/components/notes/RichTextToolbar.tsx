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
  Redo
} from 'lucide-react'

interface RichTextToolbarProps {
  onFormat: (format: string, value?: string) => void
  onInsert: (type: string, value?: string) => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
}

export function RichTextToolbar({ 
  onFormat, 
  onInsert, 
  onUndo, 
  onRedo, 
  canUndo, 
  canRedo 
}: RichTextToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showHighlightPicker, setShowHighlightPicker] = useState(false)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const colorPickerRef = useRef<HTMLDivElement>(null)

  const colors = [
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
    '#FF0000', '#FF6600', '#FFCC00', '#00FF00', '#0066FF', '#6600FF',
    '#FF0066', '#FF3366', '#FF6699', '#FF99CC', '#FFCCFF', '#CC99FF'
  ]

  const handleColorSelect = (color: string) => {
    onFormat('foreColor', color)
    setShowColorPicker(false)
  }

  const handleHighlightSelect = (color: string) => {
    onFormat('backColor', color)
    setShowHighlightPicker(false)
  }

  const handleLinkInsert = () => {
    if (linkUrl && linkText) {
      onInsert('link', `${linkText}|${linkUrl}`)
      setLinkUrl('')
      setLinkText('')
      setShowLinkDialog(false)
    }
  }

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

        {/* Lists */}
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
            onClick={() => onFormat('formatBlock', 'blockquote')}
            icon={Quote}
            title="Quote"
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
          <div className="relative">
            <ToolbarButton
              onClick={() => setShowColorPicker(!showColorPicker)}
              icon={Palette}
              title="Text Color"
            />
            {showColorPicker && (
              <div
                ref={colorPickerRef}
                className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-lg z-10"
              >
                <div className="grid grid-cols-6 gap-1">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorSelect(color)}
                      className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <ToolbarButton
              onClick={() => setShowHighlightPicker(!showHighlightPicker)}
              icon={Highlighter}
              title="Highlight Color"
            />
            {showHighlightPicker && (
              <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-lg z-10">
                <div className="grid grid-cols-6 gap-1">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleHighlightSelect(color)}
                      className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Code */}
        <div className="flex items-center space-x-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
          <ToolbarButton
            onClick={() => onFormat('formatBlock', 'pre')}
            icon={Code}
            title="Code Block"
          />
        </div>

        {/* Insert */}
        <div className="flex items-center space-x-1">
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
    </div>
  )
}
