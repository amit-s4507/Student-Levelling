import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { userPrompt } = body;

    if (!userPrompt) {
      return new NextResponse('Missing prompt', { status: 400 });
    }

    const systemPrompt = `You are a helpful AI tutor. Your goal is to help students learn and understand concepts better. 
    Be clear, concise, and encouraging in your responses. If a student asks about a topic you're not sure about, 
    be honest and suggest reliable resources for learning more.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return NextResponse.json({
      text: response.choices[0].message.content
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal Server Error',
      { status: 500 }
    );
  }
}