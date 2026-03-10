import React from 'react';
import { ChatSession, ViewState } from './types';
import { MessageSquare, Plus, Menu, ChevronRight, Settings } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  toggleSidebar,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  currentView,
  onChangeView
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleSidebar}
      />

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-50
        h-[100dvh] bg-[#1E1F20] flex flex-col
        border-r border-[#444746] shadow-[4px_0_24px_rgba(0,0,0,0.5)]
        transition-transform duration-300 ease-in-out
        w-[300px]
        md:relative md:translate-x-0 md:h-full md:shadow-none md:border-r-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-[300px]'}
        ${!isOpen && 'md:hidden'} 
      `}>
        {/* Header */}
        <div className="p-5 flex items-center justify-between shrink-0">
          <button onClick={toggleSidebar} className="text-gemini-textSecondary md:hidden hover:text-white transition-colors">
            <Menu size={24} />
          </button>
          <div className="hidden md:flex items-center gap-2 text-gemini-textSecondary text-sm font-medium hover:bg-[#2D2E2F] px-3 py-2 rounded-lg cursor-pointer transition-colors">
            Dealr v2.0 <ChevronRight size={14} />
          </div>
        </div>

        {/* New Chat Action */}
        <div className="px-4 mb-4 shrink-0">
          <button
            onClick={() => {
                onNewChat();
                if (window.innerWidth < 768) toggleSidebar();
            }}
            className="w-full flex items-center gap-3 bg-[#131314] hover:bg-[#2D2E2F] text-gemini-textSecondary py-4 px-5 rounded-full transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md border border-transparent hover:border-[#444746]"
          >
            <Plus size={20} className="text-gemini-text" />
            <span className="text-gemini-text">New chat</span>
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 custom-scrollbar">
            <div className="mb-2 px-4 text-xs font-semibold text-gemini-textSecondary/80 mt-4">
                Recent
            </div>
            <div className="space-y-1">
                {sessions.map((session) => (
                    <button
                    key={session.id}
                    onClick={() => {
                        onSelectSession(session.id);
                        onChangeView('chat');
                        if (window.innerWidth < 768) toggleSidebar();
                    }}
                    className={`w-full flex items-center gap-3 py-2.5 px-4 rounded-full text-sm text-left truncate transition-colors group ${
                        currentSessionId === session.id && currentView === 'chat'
                        ? 'bg-[#004A77] text-[#C2E7FF]' 
                        : 'text-gemini-text hover:bg-[#2D2E2F]'
                    }`}
                    >
                    <MessageSquare size={16} className={`shrink-0 ${currentSessionId === session.id ? 'text-[#C2E7FF]' : 'text-gemini-textSecondary group-hover:text-white'}`} />
                    <span className="truncate">{session.title || 'Untitled Chat'}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* Footer / Settings */}
        <div className="p-3 mt-auto shrink-0 bg-[#1E1F20]">
          <button
            onClick={() => {
                onChangeView('knowledge-base');
                if (window.innerWidth < 768) toggleSidebar();
            }}
            className={`w-full flex items-center gap-4 py-3 px-4 rounded-full text-sm transition-colors ${
                currentView === 'knowledge-base' 
                ? 'bg-[#2D2E2F] text-white' 
                : 'text-gemini-text hover:bg-[#2D2E2F]'
            }`}
          >
            <div className="bg-[#444746] p-1.5 rounded-md">
                <Settings size={16} className="text-white" />
            </div>
            <div className="flex flex-col items-start">
                <span className="font-medium">Training</span>
            </div>
          </button>
          
           <div className="mt-2 px-4 py-2 flex items-center gap-2 text-xs text-gemini-textSecondary/50">
             <div className="w-2 h-2 rounded-full bg-green-500"></div>
             System Operational
           </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;