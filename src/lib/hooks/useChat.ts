import { useState, useCallback, useEffect, useRef } from 'react';
import { Chat, Message, Role } from '../types';

const MOCK_RESPONSE = `This is a simulated streaming response. I am a frontend mock that looks like ChatGPT. 

Here's a code block example:
\`\`\`typescript
const hello = "world";
console.log(hello);
\`\`\`

And some list items:
- Item 1
- Item 2
- Item 3

I can simulate token-by-token generation to match the feel of a real LLM.`;

export function useChat() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('gpt-chats');
    if (saved) {
      setChats(JSON.parse(saved));
    } else {
      createNewChat();
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem('gpt-chats', JSON.stringify(chats));
    }
  }, [chats]);

  const createNewChat = useCallback(() => {
    const newChat: Chat = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    return newChat.id;
  }, []);

  const currentChat = chats.find(c => c.id === currentChatId) || chats[0];

  const updateChatMessages = useCallback((chatId: string, messages: Message[]) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, messages } : chat
    ));
  }, []);

  const updateChatTitle = useCallback((chatId: string, title: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, title } : chat
    ));
  }, []);

  const deleteChat = useCallback((chatId: string) => {
    setChats(prev => {
      const newChats = prev.filter(c => c.id !== chatId);
      if (currentChatId === chatId) {
        setCurrentChatId(newChats[0]?.id || null);
      }
      return newChats;
    });
  }, [currentChatId]);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
      
      // Save what we have so far
      if (currentChatId && streamingContent) {
        const assistantMsg: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: streamingContent
        };
        
        setChats(prev => prev.map(chat => {
          if (chat.id === currentChatId) {
            return {
              ...chat,
              messages: [...chat.messages, assistantMsg]
            };
          }
          return chat;
        }));
        setStreamingContent('');
      }
    }
  }, [currentChatId, streamingContent]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !currentChatId) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content
    };

    // Add user message immediately
    setChats(prev => prev.map(chat => {
      if (chat.id === currentChatId) {
        // Generate title if it's the first message
        const title = chat.messages.length === 0 ? content.slice(0, 30) : chat.title;
        return {
          ...chat,
          title,
          messages: [...chat.messages, userMsg]
        };
      }
      return chat;
    }));

    setIsStreaming(true);
    setStreamingContent('');
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simulate streaming
    const tokens = MOCK_RESPONSE.split(/(?=[ \n])/); // Split by words/spaces roughly
    let accumulated = '';

    for (const token of tokens) {
      if (signal.aborted) break;
      
      await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 50)); // Random typing speed
      accumulated += token;
      setStreamingContent(accumulated);
    }

    if (!signal.aborted) {
      setIsStreaming(false);
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: accumulated
      };

      setChats(prev => prev.map(chat => 
        chat.id === currentChatId ? { ...chat, messages: [...chat.messages, assistantMsg] } : chat
      ));
      setStreamingContent('');
    }
  }, [currentChatId]);

  return {
    chats,
    currentChat,
    currentChatId,
    setCurrentChatId,
    createNewChat,
    deleteChat,
    updateChatTitle,
    sendMessage,
    isStreaming,
    streamingContent,
    stopStreaming
  };
}
