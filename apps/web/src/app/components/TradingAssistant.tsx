import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader, AlertCircle, X, MessageSquare } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolsUsed?: string[];
}

interface AssistantResponse {
  success: boolean;
  answer: string;
  toolsUsed?: string[];
  metadata?: {
    latency?: number;
  };
}

interface TradingAssistantModalProps {
}

export const TradingAssistantModal: React.FC<TradingAssistantModalProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I am your trading assistant. Ask me about your positions, portfolio risk, or whether you should add to a position.',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;

    setError(null);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      if(!token){
        throw new Error('Authentication Required');
      }
      const response = await fetch('http://localhost:3000/api/agent/help', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: inputValue
        }),
      });
      if(response.status === 401){
        throw new Error('Session Expired. Login again');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: AssistantResponse = await response.json();

      if (!data.success) {
        throw new Error(data.answer || 'Failed to get response from assistant');
      }

      const assistantMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: data.answer,
        timestamp: new Date(),
        toolsUsed: data.toolsUsed,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      
      const errorMsg: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `I encountered an error: ${errorMessage}. Please try again.`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    'Can I add BTCUSDT?',
    'What is my portfolio risk?',
    'Check my positions',
  ];

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
  };

  return (
    <>
      {/* Toggle Button - Position it near the positions panel */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition z-40"
        title="Open AI Assistant"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4">
          {/* Modal Container */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-2xl w-full sm:w-[600px] h-screen sm:h-[600px] flex flex-col overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="p-4 border-b border-gray-700 bg-gray-900 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  Trading Assistant
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-700 rounded transition"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-bold">AI</span>
                    </div>
                  )}

                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-100'
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap break-words">
                      {message.content}
                    </p>

                    {message.toolsUsed && message.toolsUsed.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-600">
                        <p className="text-xs text-gray-400">
                          Tools: {message.toolsUsed.join(', ')}
                        </p>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-1">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  {message.type === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-bold">U</span>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xs font-bold">AI</span>
                  </div>
                  <div className="bg-gray-700 px-4 py-2 rounded-lg">
                    <Loader className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}

              {error && (
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                  <div className="bg-red-900 bg-opacity-30 px-4 py-2 rounded-lg text-sm text-red-200">
                    {error}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions - Only show at start */}
            {messages.length <= 1 && !isLoading && (
              <div className="px-4 py-3 border-t border-gray-700 bg-gray-900 space-y-2 flex-shrink-0">
                <p className="text-xs text-gray-400 font-medium">Quick questions:</p>
                <div className="space-y-2">
                  {quickQuestions.map((question) => (
                    <button
                      key={question}
                      onClick={() => handleQuickQuestion(question)}
                      className="w-full text-left px-3 py-2 text-xs rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition border border-gray-700 hover:border-blue-500"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <form
              onSubmit={sendMessage}
              className="p-4 border-t border-gray-700 bg-gray-900 flex-shrink-0"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about positions..."
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 rounded bg-gray-700 text-white placeholder-gray-500 border border-gray-600 focus:border-blue-500 focus:outline-none text-sm disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add this to your global CSS or Tailwind config for the slide-up animation */}
      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};