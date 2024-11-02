import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, Send, X, Loader2, Image as ImageIcon, Lock } from 'lucide-react';
import { sendMessage, analyzeScreenshot } from '../services/openrouter';
import { ChatMessage } from '../types/chat';
import { StockAnalysisWidget } from './chat/StockAnalysisWidget';
import { useRecentStocksStore } from '../hooks/useRecentStocks';
import { ChartAnalysisWidget } from './chat/ChartAnalysisWidget';
import { useSubscriptionStore } from '../stores/useSubscriptionStore';

interface ChatWidgetProps {
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  initialMessage?: string | null;
  isPremium?: boolean;
}

export function ChatWidget({ isOpen: controlledIsOpen, onOpenChange, initialMessage, isPremium = false }: ChatWidgetProps) {
  const { setSubscriptionPopupOpen } = useSubscriptionStore();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your AI trading assistant. How can I help you analyze markets or stocks today? You can also share chart screenshots for technical analysis.",
      timestamp: Date.now(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addStock = useRecentStocksStore(state => state.addStock);

  const actualIsOpen = controlledIsOpen ?? isOpen;
  const setActualIsOpen = useCallback((value: boolean) => {
    setIsOpen(value);
    onOpenChange?.(value);
  }, [onOpenChange]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (initialMessage && actualIsOpen) {
      handleSend(initialMessage);
    }
  }, [initialMessage, actualIsOpen]);

  const handleFollowUpAction = useCallback(async (action: string, symbol: string) => {
    if (!isPremium) {
      setSubscriptionPopupOpen(true);
      return;
    }
    const actionMessage = `${action} for ${symbol}`;
    setMessage(actionMessage);
    await handleSend(actionMessage);
  }, [isPremium, setSubscriptionPopupOpen]);

  const isJsonString = useCallback((str: string) => {
    try {
      const result = JSON.parse(str);
      return result && typeof result === 'object';
    } catch (e) {
      return false;
    }
  }, []);

  const renderMessage = useCallback((msg: ChatMessage) => {
    if (msg.content.startsWith('CHART_ANALYSIS:')) {
      return <ChartAnalysisWidget analysis={msg.content.replace('CHART_ANALYSIS:', '')} />;
    }
    
    if (isJsonString(msg.content)) {
      const data = JSON.parse(msg.content);
      if (data.symbol && data.aiRating) {
        setTimeout(() => {
          addStock({
            symbol: data.symbol,
            name: data.summary.split(' - ')[0],
            timestamp: new Date().toLocaleTimeString(),
          });
        }, 0);
        return <StockAnalysisWidget {...data} onFollowUpAction={handleFollowUpAction} />;
      }
    }
    return <div className="whitespace-pre-wrap">{msg.content}</div>;
  }, [addStock, handleFollowUpAction, isJsonString]);

  const handleSend = async (customMessage?: string) => {
    const messageToSend = customMessage || message;
    if (!messageToSend.trim() || isLoading) return;

    if (!isPremium) {
      setMessages(prev => [
        ...prev,
        {
          role: 'user',
          content: messageToSend,
          timestamp: Date.now(),
        },
        {
          role: 'assistant',
          content: "This is a premium feature. Please subscribe to access advanced AI trading insights and analysis.",
          timestamp: Date.now(),
        }
      ]);
      setMessage('');
      setSubscriptionPopupOpen(true);
      return;
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: messageToSend,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendMessage([...messages, userMessage]);
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const processImage = async (file: File) => {
    if (!isPremium) {
      setSubscriptionPopupOpen(true);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const base64Data = base64.split(',')[1];

      const userMessage: ChatMessage = {
        role: 'user',
        content: 'Please analyze this chart:',
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, userMessage]);

      const analysis = await analyzeScreenshot(base64Data);
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: `CHART_ANALYSIS:${analysis}`,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze the image';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      await processImage(file);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await processImage(file);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {!actualIsOpen && (
        <button
          onClick={() => setActualIsOpen(true)}
          className="fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          aria-label="Open AI Chat"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {actualIsOpen && (
        <div className="fixed bottom-6 right-6 w-[450px] h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">AI Trading Assistant</h3>
              {!isPremium && (
                <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full flex items-center">
                  <Lock className="w-3 h-3 mr-1" />
                  Limited
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setMessages([
                    {
                      role: 'assistant',
                      content: "Hello! I'm your AI trading assistant. How can I help you analyze markets or stocks today? You can also share chart screenshots for technical analysis.",
                      timestamp: Date.now(),
                    },
                  ]);
                  setError(null);
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm text-gray-600 dark:text-gray-300"
              >
                Clear
              </button>
              <button
                onClick={() => setActualIsOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            className={`flex-1 overflow-y-auto p-4 space-y-4 ${
              isDragging ? 'bg-blue-50 dark:bg-blue-900/20' : ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isDragging && (
              <div className="absolute inset-0 flex items-center justify-center bg-blue-500/10 backdrop-blur-sm">
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 text-blue-500" />
                  <p className="text-blue-600 dark:text-blue-400 font-medium">
                    Drop your chart screenshot here
                  </p>
                </div>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`rounded-lg p-3 max-w-[90%] ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                >
                  {renderMessage(msg)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-600 dark:text-gray-300" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            {error && (
              <div className="mb-2 text-sm text-red-500 dark:text-red-400">
                {error}
              </div>
            )}
            <div className="flex space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title="Upload chart screenshot"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isPremium ? "Ask about stocks, market analysis, or upload a chart..." : "Subscribe to unlock AI trading insights"}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none h-10 leading-5"
                rows={1}
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !message.trim()}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}