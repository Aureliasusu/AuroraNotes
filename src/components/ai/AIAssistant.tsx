'use client'

import { useState, useEffect } from 'react'
import { useNotesStore } from '@/store/useNotesStore'
import { Bot, Sparkles, MessageSquare, Lightbulb, List, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'

interface AIAnalysis {
  summary: string
  keyPoints: string[]
  todoItems: string[]
  sentiment: string
}

export function AIAssistant() {
  const { selectedNote } = useNotesStore()
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    if (selectedNote) {
      analyzeNote()
    } else {
      setAnalysis(null)
      setChatHistory([])
    }
  }, [selectedNote])

  const analyzeNote = async () => {
    if (!selectedNote || !selectedNote.content.trim()) return

    setIsAnalyzing(true)
    setLoading(true)

    try {
      // Simulate AI analysis (replace with actual OpenAI API call)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockAnalysis: AIAnalysis = {
        summary: `This note appears to be about ${selectedNote.title.toLowerCase()}. It contains ${selectedNote.content.split(' ').length} words and covers various aspects of the topic.`,
        keyPoints: [
          'Key point 1 from the note content',
          'Important insight 2',
          'Main takeaway 3',
          'Critical information 4'
        ],
        todoItems: [
          'Action item 1 based on content',
          'Follow-up task 2',
          'Next steps 3'
        ],
        sentiment: 'positive'
      }

      setAnalysis(mockAnalysis)
      toast.success('Note analysis complete!')
    } catch (error) {
      toast.error('Failed to analyze note')
    } finally {
      setLoading(false)
      setIsAnalyzing(false)
    }
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatMessage.trim() || !selectedNote) return

    const userMessage = chatMessage
    setChatMessage('')
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }])

    // Simulate AI response (replace with actual OpenAI API call)
    setTimeout(() => {
      const aiResponse = `Based on your note "${selectedNote.title}", here's what I can tell you about "${userMessage}": [AI response would go here]`
      setChatHistory(prev => [...prev, { role: 'assistant', content: aiResponse }])
    }, 1000)
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return 'text-green-600'
      case 'negative': return 'text-red-600'
      case 'neutral': return 'text-gray-600'
      default: return 'text-gray-600'
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
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : analysis ? (
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

