import React from 'react';
import Markdown from 'react-markdown';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'model';
  text: string;
  groundingChunks?: any[];
}

export function ChatMessage({ role, text, groundingChunks }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-4`}>
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isUser ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'}`}>
          {isUser ? <User size={20} /> : <Bot size={20} />}
        </div>
        
        <div className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-5 py-4 rounded-2xl ${isUser ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 shadow-sm rounded-tl-sm'}`}>
            {text ? (
              <div className={`prose prose-sm max-w-none ${isUser ? 'prose-invert text-white' : 'text-slate-800'}`}>
                <Markdown>{text}</Markdown>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 h-6 px-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            )}
          </div>
          
          {groundingChunks && groundingChunks.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {groundingChunks.map((chunk, index) => {
                const url = chunk.web?.uri;
                const title = chunk.web?.title;
                if (!url) return null;
                
                return (
                  <a 
                    key={index} 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded-md transition-colors border border-slate-200"
                  >
                    <span className="truncate max-w-[200px]">{title || url}</span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
