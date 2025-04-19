"use client";
import { createContext, useEffect, useState, useContext, useRef } from 'react';
import * as Ably from 'ably';
import { generateAIChatBoTResponse } from '@/services/ai-chats';
import { useAuth } from '@clerk/nextjs'; // Import Clerk auth hook

// Types
type MessageType = {
  role: string;
  content: string;
};

type AblyMessageData = MessageType & { 
  stream?: boolean;
  userId?: string;
};

type AblyContextType = {
  isConnected: boolean;
  hasStreamingMessageRef: React.MutableRefObject<boolean>;
  messages: MessageType[];
  sendMessage: (message?: string) => Promise<void>;
  streaming: boolean;
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
  clearMessages: () => void;
};

// Create context with the correct type
const AblyContext = createContext<AblyContextType | null>(null);

export const AblyProvider = ({ children }: { children: React.ReactNode }) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const currentStreamRef = useRef<string>('');
  const hasStreamingMessageRef = useRef<boolean>(false);
  const ablyRef = useRef<Ably.Realtime | null>(null);
  const { userId } = useAuth(); // Get the current user ID from Clerk
  
  useEffect(() => {
    // Initialize Ably
    const ably = new Ably.Realtime({
      key: process.env.NEXT_PUBLIC_ABLY_KEY || '',
      // Alternative: use token authentication
      authUrl: '/api/ably-token',
    });
  
    ablyRef.current = ably;
  
    // Subscribe to the chat channel
    const channel = ably.channels.get('chat');
  
    const handleChatResponse = (message: any) => {
      const data = message.data as AblyMessageData;
      
      // Only process messages for the current user
      if (data.userId && data.userId !== userId) {
        return;
      }
      
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
      const data = message.data as AblyMessageData;
      
      // Only process messages for the current user
      if (data.userId && data.userId !== userId) {
        return;
      }
      
      hasStreamingMessageRef.current = false;
      currentStreamRef.current = '';
  
      setMessages(prev => {
        const idx = prev.findLastIndex(msg => msg.role === 'assistant');
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            content: data.content || updated[idx].content
          };
          return updated;
        }
        return [...prev, {
          role: data.role,
          content: data.content || ''
        }];
      });
  
      setStreaming(false);
    };
  
    // Subscribe to events
    channel.subscribe('chat_response', handleChatResponse);
    channel.subscribe('stream_complete', handleStreamComplete);
  
    // Connection state handling
    ably.connection.on('connected', () => {
      setIsConnected(true);
      console.log('Connected to Ably');
    });

    ably.connection.on('disconnected', () => {
      setIsConnected(false);
      console.log('Disconnected from Ably');
    });
  
    return () => {
      channel.unsubscribe('chat_response', handleChatResponse);
      channel.unsubscribe('stream_complete', handleStreamComplete);
      ably.connection.off();
      ably.close();
    };
  }, [userId]); // Reinitialize connection if user ID changes
  
  const sendMessage = async (message: string = '') => {
    if (!ablyRef.current || !message.trim()) return;

    setStreaming(true);
    hasStreamingMessageRef.current = false;
    currentStreamRef.current = '';

    // Add user message to state
    setMessages(prev => [...prev, { role: 'user', content: message }]);

    // Add an empty assistant message as a placeholder if no streaming message appears
    setTimeout(() => {
      if (!hasStreamingMessageRef.current) {
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      }
    }, 300);

    try {
      await generateAIChatBoTResponse(message);
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages(prev => {
        const idx = prev.findLastIndex(msg => msg.role === 'assistant');
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = {
            role: 'assistant',
            content: 'Sorry, there was an error generating a response. Please try again.'
          };
          return updated;
        }
        return [...prev, {
          role: 'assistant',
          content: 'Sorry, there was an error generating a response. Please try again.'
        }];
      });
      setStreaming(false);
    }
  };

  // Add a function to clear messages
  const clearMessages = () => {
    setMessages([]);
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
        clearMessages,
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