import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, noteId } = body

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    // Check if we should use mock data (for quota issues)
    const useMockData = process.env.USE_MOCK_AI === 'true'

    // Basic text analysis
    const words = content.split(/\s+/).filter(word => word.length > 0)
    const sentences = content.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0)
    const wordCount = words.length
    const sentenceCount = sentences.length
    const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0

    // Count syllables (simplified)
    const syllables = words.reduce((total, word) => {
      return total + Math.max(1, word.toLowerCase().replace(/[^aeiou]/g, '').length)
    }, 0)

    // Calculate readability score (simplified Flesch Reading Ease)
    const readabilityScore = Math.max(0, Math.min(100, 
      206.835 - (1.015 * avgWordsPerSentence) - (84.6 * (syllables / wordCount))
    ))

    let analysis

    if (useMockData) {
      // Use mock data for testing
      analysis = {
        readabilityScore: Math.round(readabilityScore),
        wordCount,
        sentenceCount,
        avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
        sentiment: 'positive',
        keyWords: ['writing', 'assistant', 'AI', 'analysis', 'content'],
        suggestions: [
          {
            type: 'grammar',
            message: 'Consider using more active voice in your sentences',
            severity: 'suggestion',
            position: { start: 0, end: 50 },
            suggestion: 'Try rewriting passive constructions'
          },
          {
            type: 'style',
            message: 'Your writing could benefit from more varied sentence lengths',
            severity: 'warning',
            position: { start: 0, end: 100 },
            suggestion: 'Mix short and long sentences for better flow'
          },
          {
            type: 'structure',
            message: 'Consider adding more transitional phrases',
            severity: 'suggestion',
            position: { start: 0, end: 150 },
            suggestion: 'Use words like "however", "therefore", "moreover"'
          }
        ]
      }
    } else {
      // Call OpenAI API for advanced analysis
      const prompt = `Please analyze the following text for writing quality and provide suggestions. Return a JSON response with:

1. readabilityScore: A score from 0-100 (higher is more readable)
2. sentiment: "positive", "negative", or "neutral"
3. keyWords: Array of 5-8 most important keywords
4. suggestions: Array of writing suggestions with:
   - type: "grammar", "spelling", "style", "structure", or "completion"
   - message: Description of the issue
   - severity: "error", "warning", or "suggestion"
   - position: {start: number, end: number}
   - suggestion: Optional improvement suggestion

Text to analyze:
"${content}"

Please respond with valid JSON only.`

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an AI writing assistant that analyzes text quality and provides constructive feedback. Always respond with valid JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      })

      const aiResponse = completion.choices[0]?.message?.content

      if (!aiResponse) {
        throw new Error('No response from OpenAI')
      }

      try {
        const aiAnalysis = JSON.parse(aiResponse)
        analysis = {
          readabilityScore: aiAnalysis.readabilityScore || Math.round(readabilityScore),
          wordCount,
          sentenceCount,
          avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
          sentiment: aiAnalysis.sentiment || 'neutral',
          keyWords: aiAnalysis.keyWords || [],
          suggestions: aiAnalysis.suggestions || []
        }
      } catch (parseError) {
        // Fallback to basic analysis
        analysis = {
          readabilityScore: Math.round(readabilityScore),
          wordCount,
          sentenceCount,
          avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
          sentiment: 'neutral',
          keyWords: words.slice(0, 5),
          suggestions: [
            {
              type: 'style',
              message: 'Content analysis completed',
              severity: 'suggestion',
              position: { start: 0, end: content.length },
              suggestion: 'Consider reviewing your writing for clarity and flow'
            }
          ]
        }
      }
    }

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('Writing analysis error:', error)
    return NextResponse.json({ 
      error: 'Failed to analyze writing with AI',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
