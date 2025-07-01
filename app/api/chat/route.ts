import { NextRequest, NextResponse } from "next/server";
import { auth } from '@clerk/nextjs';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

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

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Generate content
    const result = await model.generateContent(userPrompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });

  } catch (error) {
    console.error('[CHAT_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}