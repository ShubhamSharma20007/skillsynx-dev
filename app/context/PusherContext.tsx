"use client";
import { createContext, useEffect, useState, useContext, useRef } from 'react';
import * as Ably from 'ably';
import { generateAIChatBoTResponse } from '@/services/ai-chats';

// Types
type MessageType = {
  role: string;
  content: string;
};

type AblyMessageData = MessageType & { 
  stream?: boolean 
};

type AblyContextType = {
  isConnected: boolean;
  hasStreamingMessageRef: React.MutableRefObject<boolean>;
  messages: MessageType[];
  sendMessage: (message?: string) => Promise<void>;
  streaming: boolean;
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
};

// Create context with the correct type
const AblyContext = createContext<AblyContextType | null>(null);

export const AblyProvider = ({ children }: { children: React.ReactNode }) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const currentStreamRef = useRef<string>('');
  const hasStreamingMessageRef = useRef<boolean>(false);
  const ablyRef = useRef<Ably.Realtime | null>(null); // For managing the Ably instance

  useEffect(() => {
    // Initialize Ably with the key directly for client-side
    // Note: In production, it's better to use token authentication
    const ably = new Ably.Realtime({
      key: process.env.NEXT_PUBLIC_ABLY_SECRET_KEY || '',
    });
  
    ablyRef.current = ably;
  
    // Subscribe to the chat channel
    const channel = ably.channels.get('chat');
  
    const handleChatResponse = (message: any) => {
      const data = message.data as AblyMessageData;
      
      if (data.stream) {
        if (!hasStreamingMessageRef.current) {
          hasStreamingMessageRef.current = true;
          currentStreamRef.current = data.content || '';
  
          setMessages(prev => [...prev, {
            role: data.role,
            content: data.content || ''
          }]);
        } else {
          currentStreamRef.current += data.content || '';
  
          setMessages(prev => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            if (lastIndex >= 0) {
              updated[lastIndex] = {
                ...updated[lastIndex],
                content: currentStreamRef.current
              };
            }
            return updated;
          });
        }
      }
    };
  
    const handleStreamComplete = (message: any) => {
      const data = message.data as MessageType;
      
      hasStreamingMessageRef.current = false;
      currentStreamRef.current = '';
  
      setMessages(prev => {
        const idx = prev.findLastIndex(msg => msg.role === 'assistant');
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = data;
          return updated;
        }
        return [...prev, data];
      });
  
      setStreaming(false);
    };
  
    // Subscribe to events
    channel.subscribe('chat_response', handleChatResponse);
    channel.subscribe('stream_complete', handleStreamComplete);
  
    // Connection state handling
    ably.connection.on('connected', () => {
      setIsConnected(true);
    });

    ably.connection.on('disconnected', () => {
      setIsConnected(false);
    });
  
    return () => {
      channel.unsubscribe('chat_response', handleChatResponse);
      channel.unsubscribe('stream_complete', handleStreamComplete);
      ably.connection.off();
      ably.close();
    };
  }, []);
  
  const sendMessage = async (message: string = '') => {
    if (!ablyRef.current) return;

    setStreaming(true);
    hasStreamingMessageRef.current = false;
    currentStreamRef.current = '';

    setMessages(prev => [...prev, { role: 'user', content: message }]);

    setTimeout(() => {
      if (!hasStreamingMessageRef.current) {
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      }
    }, 300);

    await generateAIChatBoTResponse(message);
  };

  return (
    <AblyContext.Provider
      value={{
        isConnected,
        hasStreamingMessageRef,
        messages,
        setMessages,
        sendMessage,
        streaming,
      }}
    >
      {children}
    </AblyContext.Provider>
  );
};

// Custom hook to use the Ably context
export const useAbly = () => {
  const context = useContext(AblyContext);
  if (!context) {
    throw new Error('useAbly must be used within an AblyProvider');
  }
  return context;
};