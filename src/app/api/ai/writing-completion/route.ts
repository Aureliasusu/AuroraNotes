import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, position, noteId } = body

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    // Check if we should use mock data (for quota issues)
    const useMockData = process.env.USE_MOCK_AI === 'true'

    let completions

    if (useMockData) {
      // Use mock data for testing
      completions = [
        {
          text: ' to improve your writing',
          confidence: 0.85,
          type: 'sentence'
        },
        {
          text: ' and make it more engaging',
          confidence: 0.78,
          type: 'sentence'
        },
        {
          text: ' with better structure',
          confidence: 0.72,
          type: 'sentence'
        },
        {
          text: 'AI',
          confidence: 0.90,
          type: 'keyword'
        },
        {
          text: 'writing',
          confidence: 0.88,
          type: 'keyword'
        }
      ]
    } else {
      // Call OpenAI API for smart completions
      const prompt = `Given the following text and cursor position, provide 3-5 smart completion suggestions. 

Text: "${content}"
Cursor position: ${position}

Return a JSON array of completion suggestions with:
- text: The suggested completion text
- confidence: A number between 0 and 1 indicating confidence
- type: "sentence", "paragraph", or "keyword"

Focus on:
1. Natural language completion
2. Contextually relevant suggestions
3. Different types of completions (sentence, keyword, etc.)

Please respond with valid JSON only.`

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an AI writing assistant that provides smart text completions. Always respond with valid JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      })

      const aiResponse = completion.choices[0]?.message?.content

      if (!aiResponse) {
        throw new Error('No response from OpenAI')
      }

      try {
        completions = JSON.parse(aiResponse)
      } catch (parseError) {
        // Fallback to basic completions
        completions = [
          {
            text: ' to enhance your content',
            confidence: 0.8,
            type: 'sentence'
          },
          {
            text: ' and improve clarity',
            confidence: 0.75,
            type: 'sentence'
          }
        ]
      }
    }

    return NextResponse.json({ completions })
  } catch (error) {
    console.error('Writing completion error:', error)
    return NextResponse.json({ 
      error: 'Failed to get writing completions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
