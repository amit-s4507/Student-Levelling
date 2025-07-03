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

    const { prompt, style } = await request.json();
    if (!prompt) {
      return new NextResponse('Prompt is required', { status: 400 });
    }

    // Enhance prompt based on style
    let enhancedPrompt = prompt;
    switch (style) {
      case 'realistic':
        enhancedPrompt = `Create a photorealistic image of ${prompt}. The image should be highly detailed, with natural lighting, textures, and shadows. Focus on creating a lifelike representation with accurate proportions and materials.`;
        break;
      case 'cartoon':
        enhancedPrompt = `Create a cartoon-style illustration of ${prompt}. Use bold colors, clean lines, and simplified shapes. The style should be playful and engaging, similar to modern animated shows.`;
        break;
      case 'artistic':
        enhancedPrompt = `Create an artistic interpretation of ${prompt}. Use expressive brushstrokes, creative color combinations, and artistic composition. The style should be reminiscent of digital paintings with attention to mood and atmosphere.`;
        break;
      case 'minimalist':
        enhancedPrompt = `Create a minimalist design of ${prompt}. Use simple geometric shapes, limited color palette, and clean composition. Focus on essential elements while maintaining visual impact.`;
        break;
      default:
        enhancedPrompt = `Create a high-quality, visually appealing image of ${prompt}. Ensure proper composition, lighting, and detail.`;
    }

    // Add quality and composition guidelines
    enhancedPrompt += ' The image should be well-composed, centered, with good lighting and contrast. Ensure high quality output with clear details and professional finish.';

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: "vivid"
    });

    if (!response.data?.[0]?.url) {
      throw new Error('No image URL received from OpenAI');
    }

    return NextResponse.json({
      url: response.data[0].url
    });
  } catch (error) {
    console.error('Image generation error:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal Server Error',
      { status: 500 }
    );
  }
} 