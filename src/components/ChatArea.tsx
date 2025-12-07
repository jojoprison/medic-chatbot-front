import { useRef, useEffect, useState } from 'react';
import { SendHorizontal, User, Bot, StopCircle, ArrowDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Message, Chat } from '../lib/types';
import { cn } from '../lib/utils';

interface ChatAreaProps {
  chat: Chat | undefined;
  onSendMessage: (content: string) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  streamingContent: string;
}

export function ChatArea({ 
  chat, 
  onSendMessage, 
  isStreaming, 
  onStopStreaming, 
  streamingContent 
}: ChatAreaProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Auto-scroll to bottom when new messages arrive or streaming updates
  useEffect(() => {
    if (bottomRef.current && isStreaming) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat?.messages, streamingContent, isStreaming]);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isStreaming) {
        onSendMessage(input);
        setInput('');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isStreaming) {
      onSendMessage(input);
      setInput('');
    }
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-800 text-gray-500">
        <p>Select or create a chat to start</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full relative bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="sticky top-0 z-10 p-2 border-b border-black/5 dark:border-white/5 bg-white/95 dark:bg-gray-800/95 backdrop-blur flex justify-between items-center lg:justify-center">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
          <span className="font-semibold text-gray-700 dark:text-gray-200">ChatGPT 3.5</span>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto w-full"
      >
        <div className="flex flex-col pb-32">
          {chat.messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
              <div className="bg-white dark:bg-gray-700 p-4 rounded-full mb-4 shadow-sm">
                <Bot size={48} className="text-teal-600 dark:text-teal-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">How can I help you today?</h2>
            </div>
          ) : (
            <>
              {chat.messages.map((msg) => (
                <MessageItem key={msg.id} message={msg} />
              ))}
              {isStreaming && (
                <MessageItem 
                  message={{ 
                    id: 'streaming', 
                    role: 'assistant', 
                    content: streamingContent 
                  }} 
                  isStreaming 
                />
              )}
            </>
          )}
          <div ref={bottomRef} className="h-4" />
        </div>
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-32 right-1/2 translate-x-1/2 z-20 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full p-2 shadow-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <ArrowDown size={16} className="text-gray-600 dark:text-gray-200" />
        </button>
      )}

      {/* Composer */}
      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-white via-white to-transparent dark:from-gray-800 dark:via-gray-800 pt-10 pb-6 px-4">
        <div className="max-w-3xl mx-auto w-full">
          {isStreaming && (
            <div className="flex justify-center mb-4">
              <button 
                onClick={onStopStreaming}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded shadow-sm text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-200"
              >
                <StopCircle size={16} />
                Stop generating
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="relative flex items-end w-full p-3 bg-white dark:bg-[#40414f] border border-black/10 dark:border-gray-900/50 rounded-xl shadow-xs focus-within:shadow-sm ring-offset-2 focus-within:border-black/20 dark:focus-within:border-gray-600 overflow-hidden">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message ChatGPT..."
              className="w-full max-h-[200px] py-2 pr-10 bg-transparent border-0 focus:ring-0 resize-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-400"
              rows={1}
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className={cn(
                "absolute right-3 bottom-3 p-1.5 rounded-md transition-colors",
                input.trim() && !isStreaming
                  ? "bg-black dark:bg-white text-white dark:text-black hover:opacity-80"
                  : "bg-transparent text-gray-300 dark:text-gray-500 cursor-not-allowed"
              )}
            >
              <SendHorizontal size={16} />
            </button>
          </form>
          <div className="text-center mt-2">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              ChatGPT can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageItem({ message, isStreaming }: { message: Message, isStreaming?: boolean }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn(
      "group w-full text-gray-800 dark:text-gray-100 border-b border-black/5 dark:border-white/5",
      isUser ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-[#444654]"
    )}>
      <div className="max-w-3xl mx-auto gap-4 p-4 md:gap-6 md:p-6 flex">
        <div className="flex-shrink-0 flex flex-col relative items-end">
          <div className={cn(
            "w-8 h-8 rounded-sm flex items-center justify-center",
            isUser ? "bg-purple-600" : "bg-teal-600"
          )}>
            {isUser ? (
              <User size={20} className="text-white" />
            ) : (
              <Bot size={20} className="text-white" />
            )}
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden">
          <div className="prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 max-w-none break-words">
            {!isUser ? (
              <ReactMarkdown
                components={{
                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return match ? (
                      <div className="bg-black/80 rounded-md my-4 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 bg-white/10 text-xs text-gray-200">
                          <span>{match[1]}</span>
                          <span className="text-xs">Copy code</span>
                        </div>
                        <div className="p-4 overflow-x-auto">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </div>
                      </div>
                    ) : (
                      <code className="bg-black/10 dark:bg-white/10 rounded px-1 py-0.5" {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {message.content}
              </ReactMarkdown>
            ) : (
              <div className="whitespace-pre-wrap">{message.content}</div>
            )}
            {isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 align-middle bg-gray-900 dark:bg-gray-100 animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
