import { NextRequest, NextResponse } from "next/server";
import { auth } from '@clerk/nextjs';

import { GoogleGenerativeAI } from "@google/generative-ai";

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

    // TODO: Replace with actual AI model integration
    // For now, return a mock response
    const mockResponses = [
      "That's a great question about mathematics! Let me help you understand the concept better...",
      "When it comes to programming, the key concept you're asking about works like this...",
      "In science, this phenomenon can be explained by...",
      "Here's a step-by-step approach to solve this problem...",
      "Let me break down this concept into simpler terms..."
    ];

    const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];

    return NextResponse.json({
      text: randomResponse + "\n\nNote: This is a mock response. The actual AI integration will provide more detailed and accurate answers."
    });

  } catch (error) {
    console.error('[CHAT_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}