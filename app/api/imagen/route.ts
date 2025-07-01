import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { prompt } = await req.json();

    if (!prompt) {
      return new NextResponse("Missing prompt", { status: 400 });
    }

    // TODO: Replace with actual image generation API integration
    // For now, return a mock image URL
    const mockImages = [
      "https://placehold.co/600x400/e2e8f0/1e293b?text=Generated+Learning+Visual",
      "https://placehold.co/600x400/f1f5f9/1e293b?text=Educational+Diagram",
      "https://placehold.co/600x400/f8fafc/1e293b?text=Learning+Visualization"
    ];

    const randomImage = mockImages[Math.floor(Math.random() * mockImages.length)];

    return NextResponse.json({
      imageUrl: randomImage
    });

  } catch (error) {
    console.error('[IMAGE_GENERATION_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 