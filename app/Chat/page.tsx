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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">AI Study Assistant</h1>
      
      <div className="space-y-4 mb-8 h-[60vh] overflow-y-auto">
        {messages.map((message, index) => (
          <Card key={index} className={`p-4 ${message.role === 'assistant' ? 'bg-blue-50' : 'bg-gray-50'}`}>
            <div className="flex items-start">
              <div className="font-bold mr-2">
                {message.role === 'assistant' ? '🤖 AI:' : '👤 You:'}
              </div>
              <div className="flex-1">
                <Markdown>{message.content}</Markdown>
              </div>
            </div>
          </Card>
        ))}
        {isLoading && (
          <Card className="p-4 bg-blue-50">
            <div className="flex items-center">
              <div className="font-bold mr-2">🤖 AI:</div>
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
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send"}
        </Button>
      </form>
    </div>
  );
}