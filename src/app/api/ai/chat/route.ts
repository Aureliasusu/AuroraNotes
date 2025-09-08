import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, noteContent, noteTitle, chatHistory } = body

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    // Build conversation context
    const systemMessage = {
      role: "system" as const,
      content: `You are an AI assistant helping users understand and work with their notes. 
      
Current note context:
Title: "${noteTitle}"
Content: "${noteContent}"

Please provide helpful, accurate responses based on the note content. If the user asks about something not related to the note, politely redirect them back to the note content.`
    }

    // Convert chat history to OpenAI format
    const messages = [
      systemMessage,
      ...chatHistory.map((msg: any) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content
      }))
    ]

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    })

    const aiResponse = completion.choices[0]?.message?.content

    if (!aiResponse) {
      throw new Error('No response from OpenAI')
    }

    return NextResponse.json({ response: aiResponse })
  } catch (error) {
    console.error('OpenAI Chat API error:', error)
    return NextResponse.json({ 
      error: 'Failed to get AI response',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
