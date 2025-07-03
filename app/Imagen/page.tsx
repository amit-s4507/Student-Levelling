"use client";

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function ImagenPage() {
    const [prompt, setPrompt] = useState('');
    const [style, setStyle] = useState('realistic');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const generateImage = async () => {
        if (!prompt) {
            setError('Please enter a prompt');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/imagen', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt, style }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate image');
            }

            const data = await response.json();
            setImageUrl(data.url);
        } catch (error) {
            console.error('Error generating image:', error);
            setError('Failed to generate image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                        Learning Visual Generator
                    </h1>

                    <Card className="p-6 mb-8 glass border-primary/20">
                        <div className="flex flex-col gap-4">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Describe what you want to visualize..."
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        className="w-full bg-background/50"
                                    />
                                </div>
                                <Select
                                    value={style}
                                    onValueChange={setStyle}
                                >
                                    <SelectTrigger className="w-[180px] bg-background/50">
                                        <SelectValue placeholder="Select style" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="realistic">Realistic</SelectItem>
                                        <SelectItem value="cartoon">Cartoon</SelectItem>
                                        <SelectItem value="artistic">Artistic</SelectItem>
                                        <SelectItem value="minimalist">Minimalist</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                onClick={generateImage}
                                disabled={loading || !prompt}
                                className="w-full"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin"></div>
                                        Generating...
                                    </div>
                                ) : (
                                    'Generate Image'
                                )}
                            </Button>
                        </div>
                    </Card>

                    {error && (
                        <Card className="p-6 mb-8 border-destructive/20 bg-destructive/5">
                            <p className="text-destructive text-center">{error}</p>
                        </Card>
                    )}

                    {imageUrl && !loading && (
                        <Card className="p-6 glass border-primary/20">
                            <div className="aspect-square relative rounded-lg overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={imageUrl}
                                    alt={prompt}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </Card>
                    )}

                    {loading && (
                        <Card className="p-6 glass border-primary/20">
                            <div className="aspect-square flex items-center justify-center bg-background/50 rounded-lg">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-muted-foreground">Creating your visualization...</p>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}