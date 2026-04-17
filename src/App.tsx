import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { sendMessageStream } from './services/geminiService';
import { Hexagon } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
  groundingChunks?: any[];
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: 'Hello! I am the Polytope Explorer. I can answer questions about higher-dimensional geometry, polytopes, and related concepts using the Polytope Wiki and Higher Space. What would you like to know?',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    const newUserMessage: Message = { role: 'user', text };
    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    // Add a temporary empty model message that will be updated via stream
    setMessages((prev) => [...prev, { role: 'model', text: '' }]);

    try {
      // Filter out the initial greeting message to ensure history starts with a user message
      const history = messages
        .filter((_, index) => index > 0)
        .map((m) => ({
          role: m.role,
          parts: [{ text: m.text }],
        }));

      const response = await sendMessageStream(history, text, (currentText) => {
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: 'model',
            text: currentText,
          };
          return newMessages;
        });
      });

      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: 'model',
          text: response.text,
          groundingChunks: response.groundingChunks,
        };
        return newMessages;
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: 'model',
          text: 'Sorry, I encountered an error while processing your request. Please try again.',
        };
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 py-4 px-6 flex items-center gap-3 shadow-sm z-10">
        <div className="bg-indigo-600 p-2 rounded-lg text-white">
          <Hexagon size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Polytope Explorer</h1>
          <p className="text-xs text-slate-500">Powered by Gemini & Polytope Wikis</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          {messages.map((msg, index) => (
            <ChatMessage
              key={index}
              role={msg.role}
              text={msg.text}
              groundingChunks={msg.groundingChunks}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <div className="bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}
