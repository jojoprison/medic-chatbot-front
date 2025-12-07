"use client";

import { useState, useEffect } from "react";
import { Menu, PanelLeft } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { ChatArea } from "@/components/ChatArea";
import { useChat } from "@/lib/hooks/useChat";

export default function Home() {
  const {
    chats,
    currentChat,
    currentChatId,
    setCurrentChatId,
    createNewChat,
    deleteChat,
    updateChatTitle,
    sendMessage,
    isStreaming,
    stopStreaming,
    streamingContent
  } = useChat();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Initialize theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <main className="flex h-screen w-full bg-gray-900 overflow-hidden relative">
      {/* Mobile Sidebar Toggle (visible only when sidebar closed on mobile) */}
      <div className="fixed top-2 left-2 z-50 lg:hidden">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 bg-white/50 dark:bg-black/50 rounded-md backdrop-blur-sm"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Desktop Sidebar Toggle (visible on desktop) */}
      <div className="fixed top-2 left-2 z-50 hidden lg:block">
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
            title="Open sidebar"
          >
            <PanelLeft size={24} />
          </button>
        )}
      </div>

      <div className={`flex-shrink-0 bg-black overflow-hidden transition-[width] duration-300 ${isSidebarOpen ? 'w-0 lg:w-[260px]' : 'w-0'}`}>
        <Sidebar
          chats={chats}
          currentChatId={currentChatId}
          onSelectChat={setCurrentChatId}
          onNewChat={createNewChat}
          onDeleteChat={deleteChat}
          onRenameChat={updateChatTitle}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      <div className="flex-1 flex flex-col h-full relative min-w-0 bg-white dark:bg-gray-800">
         {/* Desktop Sidebar Toggle (inside main area when sidebar is open) */}
        {isSidebarOpen && (
           <div className="absolute top-2 left-2 z-20 hidden lg:block">
             <button
               onClick={() => setIsSidebarOpen(false)}
               className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
               title="Close sidebar"
             >
               <PanelLeft size={24} />
             </button>
           </div>
        )}

        <ChatArea
          chat={currentChat}
          onSendMessage={sendMessage}
          isStreaming={isStreaming}
          onStopStreaming={stopStreaming}
          streamingContent={streamingContent}
        />
      </div>

      {/* Theme Toggle Floating (or I can integrate it properly) */}
      <button
        onClick={toggleTheme}
        className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        title="Toggle Theme"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </main>
  );
}
