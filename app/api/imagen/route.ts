import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import OpenAI from 'openai';

// Validate OpenAI API key
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
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { prompt, style = 'realistic' } = body;

    if (!prompt) {
      return new NextResponse('Missing prompt', { status: 400 });
    }

    // Enhance prompt based on style
    let enhancedPrompt = prompt;
    switch (style) {
      case 'cartoon':
        enhancedPrompt = `Create a cartoon-style educational illustration of: ${prompt}. Use bright colors and simple shapes.`;
        break;
      case 'sketch':
        enhancedPrompt = `Create a detailed sketch/drawing of: ${prompt}. Use clean lines and clear visual hierarchy.`;
        break;
      case 'diagram':
        enhancedPrompt = `Create a clear, educational diagram of: ${prompt}. Include labels and arrows where appropriate.`;
        break;
      default:
        enhancedPrompt = `Create a realistic, detailed visualization of: ${prompt}. Focus on educational clarity.`;
    }

    try {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "natural"
      });

      if (!response.data?.[0]?.url) {
        throw new Error('No image URL received from OpenAI');
      }

      return NextResponse.json({
        imageUrl: response.data[0].url
      });
    } catch (openaiError) {
      console.error('OpenAI API Error:', openaiError);
      if (openaiError.status === 429) {
        return new NextResponse('Rate limit exceeded. Please try again later.', { status: 429 });
      }
      return new NextResponse('Failed to generate image. Please try again.', { status: 500 });
    }

  } catch (error) {
    console.error('Image Generation API Error:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal Server Error',
      { status: 500 }
    );
  }
} 