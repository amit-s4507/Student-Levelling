"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Markdown from 'react-markdown';

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

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

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">AI Study Assistant</h1>
      
      <div className="space-y-4 mb-8 h-[60vh] overflow-y-auto p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
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
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything about your studies..."
          className="flex-1 dark:bg-gray-800 dark:text-white dark:border-gray-700"
        />
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
        >
          {isLoading ? "Sending..." : "Send"}
        </Button>
      </form>
    </div>
  );
}