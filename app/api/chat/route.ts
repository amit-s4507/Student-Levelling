import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { message: 'You must be logged in to use the chat' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userPrompt } = body;

    if (!userPrompt) {
      return NextResponse.json(
        { message: 'Message is required' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a helpful AI tutor specializing in programming, mathematics, and science. 
    Your goal is to help students learn and understand concepts better. 
    Be clear, concise, and encouraging in your responses.
    If a student asks about a topic you're not sure about, be honest and suggest reliable resources for learning more.
    Use markdown formatting to make your responses more readable, including code blocks with proper syntax highlighting when sharing code examples.
    Break down complex concepts into simpler parts and provide examples when possible.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      presence_penalty: 0.6,
      frequency_penalty: 0.5,
    });

    if (!response.choices[0]?.message?.content) {
      throw new Error('No response from AI');
    }

    return NextResponse.json({
      text: response.choices[0].message.content,
      usage: response.usage
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { message: 'OpenAI API error. Please try again later.' },
        { status: error.status || 500 }
      );
    }
    
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}