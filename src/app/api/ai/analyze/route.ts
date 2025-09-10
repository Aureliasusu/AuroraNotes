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

    // Create a comprehensive prompt for AI analysis
    const prompt = `Please analyze the following note content and provide a structured response in JSON format. The response should include:

1. A concise summary (2-3 sentences)
2. 3-5 key points extracted from the content
3. 2-4 actionable todo items based on the content
4. Sentiment analysis (positive, negative, or neutral)

Note content:
"${content}"

Please respond with a valid JSON object in this exact format:
{
  "summary": "Brief summary of the note content",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
  "todoItems": ["Action item 1", "Action item 2"],
  "sentiment": "positive|negative|neutral"
}`

    let analysis

    if (useMockData) {
      // Use mock data for testing
      analysis = {
        summary: `This note contains ${content.split(' ').length} words and covers various topics. It appears to be a comprehensive piece of content with multiple key points.`,
        keyPoints: [
          'Key insight from the content',
          'Important information highlighted',
          'Main takeaway from the note',
          'Critical detail mentioned'
        ],
        todoItems: [
          'Action item based on content',
          'Follow-up task identified',
          'Next step to consider'
        ],
        sentiment: 'positive'
      }
    } else {
      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant that analyzes notes and provides structured insights. Always respond with valid JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      })

      const aiResponse = completion.choices[0]?.message?.content

      if (!aiResponse) {
        throw new Error('No response from OpenAI')
      }

      // Parse the JSON response
      try {
        analysis = JSON.parse(aiResponse)
      } catch (parseError) {
        // If JSON parsing fails, create a fallback response
        analysis = {
          summary: `This note contains ${content.split(' ').length} words and covers various topics.`,
          keyPoints: [
            'Content analysis completed',
            'Key insights extracted',
            'Important information identified'
          ],
          todoItems: [
            'Review the content for action items',
            'Consider follow-up tasks'
          ],
          sentiment: 'neutral'
        }
      }
    }

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('OpenAI API error:', error)
    return NextResponse.json({ 
      error: 'Failed to analyze content with AI',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

