'use client'

import { useState, useEffect, useRef } from 'react'
import { useNotesStore } from '@/store/useNotesStore'
import { 
  Bot, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Lightbulb, 
  BookOpen, 
  Target,
  Zap,
  MessageSquare,
  TrendingUp
} from 'lucide-react'
import toast from 'react-hot-toast'

interface WritingSuggestion {
  type: 'grammar' | 'spelling' | 'style' | 'structure' | 'completion'
  message: string
  severity: 'error' | 'warning' | 'suggestion'
  position: { start: number; end: number }
  suggestion?: string
}

interface WritingAnalysis {
  readabilityScore: number
  wordCount: number
  sentenceCount: number
  avgWordsPerSentence: number
  sentiment: 'positive' | 'negative' | 'neutral'
  keyWords: string[]
  suggestions: WritingSuggestion[]
}

interface CompletionSuggestion {
  text: string
  confidence: number
  type: 'sentence' | 'paragraph' | 'keyword'
}

export function SmartWritingAssistant() {
  const { selectedNote } = useNotesStore()
  const [analysis, setAnalysis] = useState<WritingAnalysis | null>(null)
  const [completions, setCompletions] = useState<CompletionSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showCompletions, setShowCompletions] = useState(false)
  const [cursorPosition, setCursorPosition] = useState(0)
  const [selectedSuggestion, setSelectedSuggestion] = useState<CompletionSuggestion | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedNote && selectedNote.content) {
      analyzeWriting()
    } else {
      setAnalysis(null)
      setCompletions([])
    }
  }, [selectedNote])

  const analyzeWriting = async () => {
    if (!selectedNote || !selectedNote.content.trim()) return

    setIsAnalyzing(true)
    setLoading(true)

    try {
      const response = await fetch('/api/ai/writing-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: selectedNote.content,
          noteId: selectedNote.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to analyze writing')
      }

      const { analysis } = await response.json()
      setAnalysis(analysis)
      toast.success('Writing analysis complete!')
    } catch (error) {
      console.error('Writing analysis error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to analyze writing')
    } finally {
      setLoading(false)
      setIsAnalyzing(false)
    }
  }

  const getCompletions = async (text: string, position: number) => {
    if (!text.trim() || position < 0) return

    try {
      const response = await fetch('/api/ai/writing-completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: text,
          position: position,
          noteId: selectedNote?.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get completions')
      }

      const { completions } = await response.json()
      setCompletions(completions)
      setShowCompletions(true)
    } catch (error) {
      console.error('Completion error:', error)
      toast.error('Failed to get writing suggestions')
    }
  }

  const handleTextChange = (e: React.FormEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    const text = target.textContent || ''
    const position = getCursorPosition(target)
    setCursorPosition(position)
    
    // Debounce completion requests
    const timeoutId = setTimeout(() => {
      if (text.length > 10) {
        getCompletions(text, position)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }

  const getCursorPosition = (element: HTMLDivElement): number => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return 0
    
    const range = selection.getRangeAt(0)
    const preCaretRange = range.cloneRange()
    preCaretRange.selectNodeContents(element)
    preCaretRange.setEnd(range.endContainer, range.endOffset)
    return preCaretRange.toString().length
  }

  const applySuggestion = (suggestion: CompletionSuggestion) => {
    if (!selectedNote || !editorRef.current) return

    const editor = editorRef.current
    const text = editor.textContent || ''
    const newText = text.slice(0, cursorPosition) + suggestion.text + text.slice(cursorPosition)
    
    editor.textContent = newText
    setShowCompletions(false)
    setSelectedSuggestion(null)
    
    // Update note content
    // This would typically update the note in the store
    toast.success('Suggestion applied!')
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-600 bg-red-50 dark:bg-red-900/20'
      case 'warning': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
      case 'suggestion': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <AlertCircle className="h-4 w-4" />
      case 'warning': return <AlertCircle className="h-4 w-4" />
      case 'suggestion': return <Lightbulb className="h-4 w-4" />
      default: return <CheckCircle className="h-4 w-4" />
    }
  }

  if (!selectedNote) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">Smart Writing Assistant</h3>
          <p className="text-sm">Select a note to get AI-powered writing assistance</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-purple-600" />
            Smart Writing Assistant
          </h2>
          <button
            onClick={analyzeWriting}
            disabled={isAnalyzing}
            className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center space-x-1"
          >
            <Sparkles className="h-4 w-4" />
            <span>{isAnalyzing ? 'Analyzing...' : 'Analyze'}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : analysis ? (
          <>
            {/* Writing Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-purple-600" />
                Writing Statistics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{analysis.wordCount}</div>
                  <div className="text-xs text-gray-500">Words</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{analysis.sentenceCount}</div>
                  <div className="text-xs text-gray-500">Sentences</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{analysis.avgWordsPerSentence.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">Avg Words/Sentence</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{analysis.readabilityScore}</div>
                  <div className="text-xs text-gray-500">Readability</div>
                </div>
              </div>
            </div>

            {/* Key Words */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <Target className="h-4 w-4 mr-2 text-green-600" />
                Key Words
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.keyWords.map((word, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-full"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>

            {/* Writing Suggestions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <Lightbulb className="h-4 w-4 mr-2 text-yellow-600" />
                Writing Suggestions
              </h3>
              <div className="space-y-2">
                {analysis.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${getSeverityColor(suggestion.severity)}`}
                  >
                    <div className="flex items-start space-x-2">
                      {getSeverityIcon(suggestion.severity)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{suggestion.message}</p>
                        {suggestion.suggestion && (
                          <p className="text-xs mt-1 opacity-75">
                            Suggestion: {suggestion.suggestion}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Completion Suggestions */}
            {showCompletions && completions.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                  <Zap className="h-4 w-4 mr-2 text-blue-600" />
                  Smart Completions
                </h3>
                <div className="space-y-2">
                  {completions.map((completion, index) => (
                    <button
                      key={index}
                      onClick={() => applySuggestion(completion)}
                      className="w-full p-3 text-left bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-800 dark:text-blue-300">
                          {completion.text}
                        </span>
                        <span className="text-xs text-blue-600 dark:text-blue-400">
                          {Math.round(completion.confidence * 100)}% confidence
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <BookOpen className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Click "Analyze" to get AI-powered writing assistance</p>
          </div>
        )}
      </div>
    </div>
  )
}
