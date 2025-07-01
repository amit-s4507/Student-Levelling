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

    if (!process.env.STABLE_DIFFUSION_API_KEY) {
      return new NextResponse("Stable Diffusion API key not configured", { status: 500 });
    }

    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${process.env.STABLE_DIFFUSION_API_KEY}`,
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: prompt,
            weight: 1
          }
        ],
        cfg_scale: 7,
        clip_guidance_preset: 'FAST_BLUE',
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 30,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Stable Diffusion API error: ${error.message || response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.artifacts?.[0]?.base64) {
      throw new Error('No image generated');
    }

    const imageUrl = `data:image/png;base64,${result.artifacts[0].base64}`;

    return NextResponse.json({ imageUrl });

  } catch (error) {
    console.error('[IMAGE_GENERATION_ERROR]', error);
    return new NextResponse(error instanceof Error ? error.message : "Internal Error", { status: 500 });
  }
} 