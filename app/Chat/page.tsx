"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Markdown from 'react-markdown';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import '../../styles/ai.css';

export default function ChatPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  if (isLoaded && !user) {
    router.push('/sign-in');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userPrompt: userMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch (error) {
      console.error("Error:", error);
      setError("Sorry, I encountered an error. Please try again.");
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
      <h1 className="text-3xl font-bold mb-8 text-center">AI Study Assistant</h1>
      <Card className="p-6 bg-card">
        <div className="chat-container">
          <div className="messages space-y-4 mb-4 max-h-[60vh] overflow-y-auto" id="messages">
            {messages.map((message, index) => (
              <Card 
                key={index} 
                className={`p-4 ${
                  message.role === 'assistant' 
                    ? 'bg-blue-50 dark:bg-blue-900 dark:text-white border-blue-200 dark:border-blue-800' 
                    : 'bg-white dark:bg-gray-800 dark:text-white border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    {message.role === 'assistant' ? '🤖' : '👤'}
                  </div>
                  <div className="flex-1 prose dark:prose-invert max-w-none">
                    <Markdown>{message.content}</Markdown>
                  </div>
                </div>
              </Card>
            ))}
            {isLoading && (
              <Card className="p-4 bg-blue-50 dark:bg-blue-900 dark:text-white animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    🤖
                  </div>
                  <div>Thinking...</div>
                </div>
              </Card>
            )}
            {error && (
              <Card className="p-4 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-200">
                <div className="flex items-center gap-3">
                  <div className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-800">
                    ⚠️
                  </div>
                  <div>{error}</div>
                </div>
              </Card>
            )}
          </div>
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about your studies..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                {isLoading ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}