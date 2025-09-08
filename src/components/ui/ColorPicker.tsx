'use client'

import { useState, useRef, useEffect } from 'react'
import { Palette, X } from 'lucide-react'

interface ColorPickerProps {
  onColorSelect: (color: string) => void
  currentColor?: string
  title?: string
  className?: string
  type?: 'text' | 'highlight'
}

export function ColorPicker({ 
  onColorSelect, 
  currentColor = '#000000', 
  title = "Choose Color",
  className = "",
  type = 'text'
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customColor, setCustomColor] = useState('#000000')
  const pickerRef = useRef<HTMLDivElement>(null)

  // 预设颜色组
  const colorGroups = type === 'highlight' ? [
    {
      name: 'Highlight Colors',
      colors: ['#FFFF00', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#F44336', '#E91E63', '#9C27B0']
    },
    {
      name: 'Light Colors',
      colors: ['#FFF9C4', '#FFF59D', '#FFF176', '#FFEE58', '#FFEB3B', '#FDD835', '#FBC02D', '#F9A825']
    },
    {
      name: 'Pastel Colors',
      colors: ['#FFCDD2', '#F8BBD9', '#E1BEE7', '#C5CAE9', '#BBDEFB', '#B3E5FC', '#B2EBF2', '#B2DFDB']
    },
    {
      name: 'Warm Colors',
      colors: ['#FFECB3', '#FFE0B2', '#FFCCBC', '#FFAB91', '#FF8A65', '#FF7043', '#FF5722', '#D84315']
    },
    {
      name: 'Cool Colors',
      colors: ['#B3E5FC', '#B2EBF2', '#B2DFDB', '#C8E6C9', '#DCEDC8', '#F0F4C3', '#FFF9C4', '#FFECB3']
    }
  ] : [
    {
      name: 'Basic Colors',
      colors: ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF']
    },
    {
      name: 'Gray Scale',
      colors: ['#F8F9FA', '#E9ECEF', '#DEE2E6', '#CED4DA', '#ADB5BD', '#6C757D', '#495057', '#343A40', '#212529']
    },
    {
      name: 'Red Colors',
      colors: ['#FFF5F5', '#FED7D7', '#FEB2B2', '#FC8181', '#F56565', '#E53E3E', '#C53030', '#9B2C2C', '#742A2A']
    },
    {
      name: 'Orange Colors',
      colors: ['#FFFAF0', '#FEEBC8', '#FBD38D', '#F6AD55', '#ED8936', '#DD6B20', '#C05621', '#9C4221', '#7B341E']
    },
    {
      name: 'Yellow Colors',
      colors: ['#FFFFF0', '#FEFCBF', '#FAF089', '#F6E05E', '#ECC94B', '#D69E2E', '#B7791F', '#975A16', '#744210']
    },
    {
      name: 'Green Colors',
      colors: ['#F0FFF4', '#C6F6D5', '#9AE6B4', '#68D391', '#48BB78', '#38A169', '#2F855A', '#276749', '#22543D']
    },
    {
      name: 'Blue Colors',
      colors: ['#EBF8FF', '#BEE3F8', '#90CDF4', '#63B3ED', '#4299E1', '#3182CE', '#2C5282', '#2A4365', '#1A365D']
    },
    {
      name: 'Purple Colors',
      colors: ['#FAF5FF', '#E9D8FD', '#D6BCFA', '#B794F6', '#9F7AEA', '#805AD5', '#6B46C1', '#553C9A', '#44337A']
    },
    {
      name: 'Pink Colors',
      colors: ['#FFF5F7', '#FED7E2', '#FBB6CE', '#F687B3', '#ED64A6', '#D53F8C', '#B83280', '#97266D', '#702459']
    }
  ]

  const handleColorClick = (color: string) => {
    onColorSelect(color)
    setIsOpen(false)
  }

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomColor(e.target.value)
  }

  const handleCustomColorSubmit = () => {
    onColorSelect(customColor)
    setIsOpen(false)
  }

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className={`relative ${className}`} ref={pickerRef}>
      {/* 触发按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center space-x-1"
        title={title}
      >
        <div 
          className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600"
          style={{ backgroundColor: currentColor }}
        />
        <Palette className="h-4 w-4" />
      </button>

      {/* 颜色选择器面板 */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-50 w-80">
          {/* 头部 */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Current Color Display */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div 
                className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
                style={{ backgroundColor: currentColor }}
              />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Current Color</p>
                <p className="text-sm font-mono text-gray-900 dark:text-white">{currentColor}</p>
              </div>
            </div>
          </div>

          {/* Custom Color Picker */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Custom Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={customColor}
                onChange={handleCustomColorChange}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
                placeholder="#000000"
              />
              <button
                onClick={handleCustomColorSubmit}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          </div>

          {/* 预设颜色组 */}
          <div className="max-h-64 overflow-y-auto">
            {colorGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="mb-3">
                <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {group.name}
                </h4>
                <div className="grid grid-cols-9 gap-1">
                  {group.colors.map((color, colorIndex) => (
                    <button
                      key={colorIndex}
                      onClick={() => handleColorClick(color)}
                      className={`w-6 h-6 rounded border-2 transition-all hover:scale-110 ${
                        currentColor === color 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Actions */}
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600 flex justify-between">
            <button
              onClick={() => handleColorClick('#000000')}
              className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Reset to Black
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
