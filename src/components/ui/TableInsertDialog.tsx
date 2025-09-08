'use client'

import { useState } from 'react'
import { Table, X, Plus, Minus } from 'lucide-react'

interface TableInsertDialogProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (tableHtml: string) => void
}

export function TableInsertDialog({ isOpen, onClose, onInsert }: TableInsertDialogProps) {
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(3)
  const [hasHeader, setHasHeader] = useState(true)
  const [tableStyle, setTableStyle] = useState<'basic' | 'bordered' | 'striped' | 'modern'>('modern')

  if (!isOpen) return null

  const generateTable = () => {
    let tableHtml = '<table'
    
    // Add table style
    switch (tableStyle) {
      case 'bordered':
        tableHtml += ' style="border-collapse: collapse; width: 100%; margin: 10px 0; border: 1px solid #ccc;"'
        break
      case 'striped':
        tableHtml += ' style="border-collapse: collapse; width: 100%; margin: 10px 0;"'
        break
      case 'modern':
        tableHtml += ' style="border-collapse: collapse; width: 100%; margin: 10px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;"'
        break
      default:
        tableHtml += ' style="border-collapse: collapse; width: 100%; margin: 10px 0;"'
    }
    
    tableHtml += '>'

    // Generate header row if needed
    if (hasHeader) {
      tableHtml += '<thead><tr>'
      for (let i = 1; i <= cols; i++) {
        const headerStyle = tableStyle === 'modern' 
          ? 'style="background: #f8f9fa; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #dee2e6;"'
          : tableStyle === 'bordered'
          ? 'style="border: 1px solid #ccc; padding: 8px; background: #f5f5f5; font-weight: bold;"'
          : 'style="padding: 8px; background: #f5f5f5; font-weight: bold;"'
        
        tableHtml += `<th ${headerStyle}>Header ${i}</th>`
      }
      tableHtml += '</tr></thead>'
    }

    // Generate body rows
    tableHtml += '<tbody>'
    for (let i = 1; i <= rows; i++) {
      tableHtml += '<tr>'
      for (let j = 1; j <= cols; j++) {
        const cellStyle = tableStyle === 'modern'
          ? 'style="padding: 12px; border-bottom: 1px solid #dee2e6;"'
          : tableStyle === 'bordered'
          ? 'style="border: 1px solid #ccc; padding: 8px;"'
          : 'style="padding: 8px;"'
        
        // Add striped effect
        if (tableStyle === 'striped' && i % 2 === 0) {
          const stripedStyle = cellStyle.replace('style="', 'style="background: #f8f9fa; ')
          tableHtml += `<td ${stripedStyle}>Cell ${i}-${j}</td>`
        } else {
          tableHtml += `<td ${cellStyle}>Cell ${i}-${j}</td>`
        }
      }
      tableHtml += '</tr>'
    }
    tableHtml += '</tbody></table>'

    return tableHtml
  }

  const handleInsert = () => {
    const tableHtml = generateTable()
    onInsert(tableHtml)
    onClose()
  }

  const handleReset = () => {
    setRows(3)
    setCols(3)
    setHasHeader(true)
    setTableStyle('modern')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-96 max-w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Table className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Insert Table</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Table Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Table Size
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">Rows:</label>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setRows(Math.max(1, rows - 1))}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{rows}</span>
                  <button
                    onClick={() => setRows(Math.min(10, rows + 1))}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">Columns:</label>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setCols(Math.max(1, cols - 1))}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{cols}</span>
                  <button
                    onClick={() => setCols(Math.min(10, cols + 1))}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Table Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Table Options
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={hasHeader}
                  onChange={(e) => setHasHeader(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Include header row</span>
              </label>
            </div>
          </div>

          {/* Table Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Table Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'basic', label: 'Basic', desc: 'Simple table' },
                { value: 'bordered', label: 'Bordered', desc: 'With borders' },
                { value: 'striped', label: 'Striped', desc: 'Alternating rows' },
                { value: 'modern', label: 'Modern', desc: 'Styled table' }
              ].map((style) => (
                <label key={style.value} className="flex items-center p-2 border border-gray-300 dark:border-gray-600 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="tableStyle"
                    value={style.value}
                    checked={tableStyle === style.value}
                    onChange={(e) => setTableStyle(e.target.value as any)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div className="ml-2">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{style.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{style.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preview
            </label>
            <div className="border border-gray-300 dark:border-gray-600 rounded p-3 bg-gray-50 dark:bg-gray-700 max-h-32 overflow-auto">
              <div dangerouslySetInnerHTML={{ __html: generateTable() }} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleReset}
            className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Reset
          </button>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleInsert}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Insert Table
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
