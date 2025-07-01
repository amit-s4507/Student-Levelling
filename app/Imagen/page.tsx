"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Image from 'next/image';

export default function ImagenPage() {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        body: JSON.stringify({ prompt: prompt.trim() }),
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Learning Visual Generator</h1>
      
      <Card className="p-6 max-w-2xl mx-auto">
        <form onSubmit={generateImage} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Describe what you want to visualize
            </label>
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., Diagram of photosynthesis process"
              className="w-full"
            />
          </div>
          <Button type="submit" disabled={isLoading || !prompt.trim()}>
            {isLoading ? "Generating..." : "Generate Image"}
          </Button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="mt-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Generating your visualization...</p>
          </div>
        )}

        {image && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Generated Image</h2>
            <div className="relative aspect-square w-full max-w-lg mx-auto">
              <Image
                src={image}
                alt={prompt}
                fill
                className="rounded-lg object-contain"
              />
            </div>
            <p className="mt-4 text-sm text-gray-600 text-center">
              Prompt: {prompt}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}