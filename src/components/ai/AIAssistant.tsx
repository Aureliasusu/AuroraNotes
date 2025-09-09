'use client'

import { useState, useEffect } from 'react'
import { useNotesStore } from '@/store/useNotesStore'
import { Bot, Sparkles, MessageSquare, Lightbulb, List, TrendingUp, BookOpen, Target, Zap, AlertCircle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface AIAnalysis {
  summary: string
  keyPoints: string[]
  todoItems: string[]
  sentiment: string
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

interface WritingSuggestion {
  type: 'grammar' | 'spelling' | 'style' | 'structure' | 'completion'
  message: string
  severity: 'error' | 'warning' | 'suggestion'
  position: { start: number; end: number }
  suggestion?: string
}

export function AIAssistant() {
  const { selectedNote } = useNotesStore()
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
  const [writingAnalysis, setWritingAnalysis] = useState<WritingAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState<'analysis' | 'writing'>('analysis')

  useEffect(() => {
    if (selectedNote) {
      analyzeNote()
      analyzeWriting()
    } else {
      setAnalysis(null)
      setWritingAnalysis(null)
      setChatHistory([])
    }
  }, [selectedNote])

  const analyzeNote = async () => {
    if (!selectedNote || !selectedNote.content.trim()) return

    setIsAnalyzing(true)
    setLoading(true)

    try {
      // Call real OpenAI API
      const response = await fetch('/api/ai/analyze', {
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
        throw new Error(errorData.error || 'Failed to analyze note')
      }

      const { analysis } = await response.json()
      setAnalysis(analysis)
      toast.success('Note analysis complete!')
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to analyze note')
    } finally {
      setLoading(false)
      setIsAnalyzing(false)
    }
  }

  const analyzeWriting = async () => {
    if (!selectedNote || !selectedNote.content.trim()) return

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
      setWritingAnalysis(analysis)
    } catch (error) {
      console.error('Writing analysis error:', error)
      // Don't show error toast for writing analysis as it's secondary
    }
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatMessage.trim() || !selectedNote) return

    const userMessage = chatMessage
    setChatMessage('')
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }])

    try {
      // Call real OpenAI API for chat
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          noteContent: selectedNote.content,
          noteTitle: selectedNote.title,
          chatHistory: chatHistory,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get AI response')
      }

      const { response: aiResponse } = await response.json()
      setChatHistory(prev => [...prev, { role: 'assistant', content: aiResponse }])
    } catch (error) {
      console.error('Chat error:', error)
      toast.error('Failed to get AI response')
      // Add error message to chat
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }])
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return 'text-green-600'
      case 'negative': return 'text-red-600'
      case 'neutral': return 'text-gray-600'
      default: return 'text-gray-600'
    }
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
          <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">AI Assistant</h3>
          <p className="text-sm">Select a note to get AI-powered insights</p>
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
            <Bot className="h-5 w-5 mr-2 text-blue-600" />
            AI Assistant
          </h2>
          <button
            onClick={analyzeNote}
            disabled={isAnalyzing}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-1"
          >
            <Sparkles className="h-4 w-4" />
            <span>{isAnalyzing ? 'Analyzing...' : 'Analyze'}</span>
          </button>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-center space-x-1 ${
              activeTab === 'analysis'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Analysis</span>
          </button>
          <button
            onClick={() => setActiveTab('writing')}
            className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-center space-x-1 ${
              activeTab === 'writing'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Writing</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : activeTab === 'analysis' ? (
          // Analysis Tab Content
          analysis ? (
            <>
              {/* Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2 text-blue-600" />
                  Summary
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {analysis.summary}
                </p>
              </div>

              {/* Key Points */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2 text-yellow-600" />
                  Key Points
                </h3>
                <ul className="space-y-1">
                  {analysis.keyPoints.map((point, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Todo Items */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                  <List className="h-4 w-4 mr-2 text-green-600" />
                  Action Items
                </h3>
                <ul className="space-y-1">
                  {analysis.todoItems.map((item, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                      <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sentiment */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-purple-600" />
                  Sentiment
                </h3>
                <span className={`text-sm font-medium capitalize ${getSentimentColor(analysis.sentiment)}`}>
                  {analysis.sentiment}
                </span>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Sparkles className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">Click "Analyze" to get AI insights about this note</p>
            </div>
          )
        ) : (
          // Writing Tab Content
          writingAnalysis ? (
            <>
              {/* Writing Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-purple-600" />
                  Writing Statistics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{writingAnalysis.wordCount}</div>
                    <div className="text-xs text-gray-500">Words</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{writingAnalysis.sentenceCount}</div>
                    <div className="text-xs text-gray-500">Sentences</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{writingAnalysis.avgWordsPerSentence.toFixed(1)}</div>
                    <div className="text-xs text-gray-500">Avg Words/Sentence</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{writingAnalysis.readabilityScore}</div>
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
                  {writingAnalysis.keyWords.map((word, index) => (
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
                  {writingAnalysis.suggestions.map((suggestion, index) => (
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
            </>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">Writing analysis will appear here</p>
            </div>
          )
        )}

        {/* Chat Section */}
        {analysis && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Ask about this note</h3>
            
            {/* Chat History */}
            <div className="space-y-3 mb-4 max-h-32 overflow-y-auto">
              {chatHistory.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleChatSubmit} className="flex space-x-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!chatMessage.trim()}
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Ask
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

