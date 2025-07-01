import { NextRequest, NextResponse } from "next/server";
import { auth } from '@clerk/nextjs';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Prepare the chat context
const context = `You are an AI tutor helping students learn various subjects. You should:
1. Provide clear, concise explanations
2. Use examples when helpful
3. Break down complex topics into simpler parts
4. Encourage critical thinking
5. Be patient and supportive`;

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { userPrompt } = await req.json();

    if (!userPrompt) {
      return new NextResponse("Missing prompt", { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: context },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 1000
    });

    const text = completion.choices[0]?.message?.content || "No response generated";
    return NextResponse.json({ text });

  } catch (error) {
    console.error('[CHAT_ERROR]', error);
    return new NextResponse(error instanceof Error ? error.message : "Internal Error", { status: 500 });
  }
}