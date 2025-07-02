"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function ImagenPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("realistic");
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  if (isLoaded && !user) {
    router.push('/sign-in');
    return null;
  }

  const generateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setImage(null);

    try {
      const response = await fetch("/api/imagen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          prompt: prompt.trim(),
          style: style
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      setImage(data.imageUrl);
    } catch (err) {
      setError("Failed to generate image. Please try again.");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Learning Visual Generator</h1>
      <Card className="p-6 bg-card">
        <form onSubmit={generateImage} className="space-y-4">
          <div className="mb-6">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Describe the learning concept you want to visualize..."
              rows={4}
              disabled={isLoading}
            />
            <div className="flex justify-between mt-2">
              <Button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {isLoading ? 'Generating...' : 'Generate Image'}
              </Button>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                disabled={isLoading}
              >
                <option value="realistic">Realistic</option>
                <option value="cartoon">Cartoon</option>
                <option value="sketch">Sketch</option>
                <option value="diagram">Diagram</option>
              </select>
            </div>
          </div>
        </form>

        <div className="mt-6">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}
          
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="shrink-0">⚠️</div>
                <div>{error}</div>
              </div>
            </div>
          )}

          {image && (
            <div className="relative aspect-square w-full max-w-2xl mx-auto overflow-hidden rounded-lg shadow-xl">
              <Image
                src={image}
                alt="Generated image"
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}