import { Plus, MessageSquare, Trash2, Edit2, User, Settings, LogOut, PanelLeftClose } from 'lucide-react';
import { Chat } from '../lib/types';
import { cn } from '../lib/utils';
import { useState } from 'react';

interface SidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ 
  chats, 
  currentChatId, 
  onSelectChat, 
  onNewChat, 
  onDeleteChat, 
  onRenameChat,
  isOpen,
  onClose
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleStartEdit = (e: React.MouseEvent, chat: Chat) => {
    e.stopPropagation();
    setEditingId(chat.id);
    setEditValue(chat.title);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId && editValue.trim()) {
      onRenameChat(editingId, editValue.trim());
      setEditingId(null);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Delete this chat?')) {
      onDeleteChat(id);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar Content */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-[260px] bg-black text-gray-100 flex flex-col transition-transform duration-300 transform lg:relative lg:translate-x-0 dark:bg-black bg-gray-900",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-3 flex-shrink-0">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 1024) onClose();
            }}
            className="flex items-center gap-3 w-full px-3 py-3 rounded-md border border-white/20 hover:bg-white/10 transition-colors text-sm text-white"
          >
            <Plus size={16} />
            <span>New chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-600">
          <div className="text-xs font-medium text-gray-500 px-3 py-2">Today</div>
          
          {chats.map(chat => (
            <div
              key={chat.id}
              onClick={() => {
                onSelectChat(chat.id);
                if (window.innerWidth < 1024) onClose();
              }}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-3 rounded-md cursor-pointer text-sm transition-colors break-all pr-16",
                currentChatId === chat.id ? "bg-white/10" : "hover:bg-white/5 text-gray-100"
              )}
            >
              <MessageSquare size={16} className="text-gray-400 flex-shrink-0" />
              
              {editingId === chat.id ? (
                <form onSubmit={handleSaveEdit} className="flex-1 z-20">
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => setEditingId(null)}
                    className="w-full bg-transparent border border-blue-500 rounded px-1 outline-none text-white"
                    onClick={(e) => e.stopPropagation()}
                  />
                </form>
              ) : (
                <span className="truncate flex-1">{chat.title}</span>
              )}

              {/* Actions (visible on hover or active) */}
              {(currentChatId === chat.id || editingId === chat.id) && !editingId && (
                <div className="absolute right-2 flex items-center gap-1 bg-gradient-to-l from-gray-900 pl-6 group-hover:from-gray-800">
                  <button 
                    onClick={(e) => handleStartEdit(e, chat)}
                    className="p-1 hover:text-white text-gray-400 transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={(e) => handleDelete(e, chat.id)}
                    className="p-1 hover:text-white text-gray-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-white/20 mt-auto">
          <button className="flex items-center gap-3 w-full px-3 py-3 rounded-md hover:bg-white/10 transition-colors text-sm text-white group">
            <div className="w-8 h-8 rounded-sm bg-purple-600 flex items-center justify-center text-white font-semibold">
              U
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium">User</div>
            </div>
            <Settings size={16} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>
    </>
  );
}
