'use client'

import { useState } from 'react'
import { Download, FileText, FileJson, File, X, Check } from 'lucide-react'
import { Note } from '@/types/database'

interface NoteExportProps {
  note: Note
  isOpen: boolean
  onClose: () => void
}

type ExportFormat = 'markdown' | 'json' | 'txt' | 'html'

export function NoteExport({ note, isOpen, onClose }: NoteExportProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('markdown')
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)

  const formats = [
    {
      id: 'markdown' as ExportFormat,
      name: 'Markdown',
      description: 'Plain text with Markdown formatting',
      icon: FileText,
      extension: '.md'
    },
    {
      id: 'json' as ExportFormat,
      name: 'JSON',
      description: 'Structured data format',
      icon: FileJson,
      extension: '.json'
    },
    {
      id: 'txt' as ExportFormat,
      name: 'Plain Text',
      description: 'Plain text without formatting',
      icon: File,
      extension: '.txt'
    },
    {
      id: 'html' as ExportFormat,
      name: 'HTML',
      description: 'Web page format',
      icon: FileText,
      extension: '.html'
    }
  ]

  const exportNote = async () => {
    if (!note) return

    setIsExporting(true)
    setExportSuccess(false)

    try {
      let content = ''
      let mimeType = ''
      let filename = ''

      switch (selectedFormat) {
        case 'markdown':
          content = `# ${note.title}\n\n${note.content}\n\n---\n\n**Tags:** ${note.tags.join(', ')}\n**Created:** ${new Date(note.created_at).toLocaleString()}\n**Updated:** ${new Date(note.updated_at).toLocaleString()}`
          mimeType = 'text/markdown'
          filename = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`
          break

        case 'json':
          content = JSON.stringify({
            id: note.id,
            title: note.title,
            content: note.content,
            tags: note.tags,
            created_at: note.created_at,
            updated_at: note.updated_at,
            user_id: note.user_id,
            folder_id: note.folder_id
          }, null, 2)
          mimeType = 'application/json'
          filename = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
          break

        case 'txt':
          content = `${note.title}\n\n${note.content}\n\nTags: ${note.tags.join(', ')}\nCreated: ${new Date(note.created_at).toLocaleString()}\nUpdated: ${new Date(note.updated_at).toLocaleString()}`
          mimeType = 'text/plain'
          filename = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`
          break

        case 'html':
          content = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${note.title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1 { color: #333; border-bottom: 2px solid #007acc; padding-bottom: 10px; }
        .meta { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .tags { display: flex; flex-wrap: wrap; gap: 5px; }
        .tag { background: #007acc; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
    </style>
</head>
<body>
    <h1>${note.title}</h1>
    <div class="content">${note.content.replace(/\n/g, '<br>')}</div>
    <div class="meta">
        <div class="tags">
            ${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        <p><strong>Created:</strong> ${new Date(note.created_at).toLocaleString()}</p>
        <p><strong>Updated:</strong> ${new Date(note.updated_at).toLocaleString()}</p>
    </div>
</body>
</html>`
          mimeType = 'text/html'
          filename = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`
          break
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setExportSuccess(true)
      setTimeout(() => {
        setExportSuccess(false)
        onClose()
      }, 2000)

    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Download className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Export Note</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Choose format and download</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Export Format</h3>
            <div className="space-y-2">
              {formats.map((format) => {
                const IconComponent = format.icon
                return (
                  <label
                    key={format.id}
                    className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedFormat === format.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="format"
                      value={format.id}
                      checked={selectedFormat === format.id}
                      onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <IconComponent className="h-5 w-5 text-gray-500" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {format.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {format.description}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {format.extension}
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Note Preview */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Note Preview</h3>
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border">
              <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                {note.title}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {note.content.length} characters • {note.tags.length} tags
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Created: {new Date(note.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {exportSuccess ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <Check className="h-4 w-4" />
                  <span>Export successful!</span>
                </div>
              ) : (
                'Click export to download your note'
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={exportNote}
                disabled={isExporting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
