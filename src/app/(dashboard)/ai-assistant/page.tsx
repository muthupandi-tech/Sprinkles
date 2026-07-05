"use client";

import { useState } from "react";
import { Sparkles, Menu, X } from "lucide-react";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatArea } from "@/components/chat/chat-area";

export default function AIAssistantPage() {
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(undefined);
  const [conversations, setConversations] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col md:h-[calc(100vh-6rem)]">
      {/* 1. Page Header */}
      <div className="mb-4 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight text-gray-900">
            <Sparkles className="h-8 w-8 animate-pulse text-blue-600" />
            <span>AI Communication Coach</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500 hidden sm:block">
            Simulate interviews, receive pronunciation tips, and build your corporate communication grammar style.
          </p>
        </div>
        
        {/* Mobile Sidebar Toggle */}
        <button 
          className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* 2. Main Chat Interface Wrapper */}
      <div className="flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm relative">
        
        {/* Sidebar (Chat History) */}
        <div className={`
          absolute inset-y-0 left-0 z-20 w-64 transform bg-gray-50 transition-transform duration-200 ease-in-out
          md:relative md:translate-x-0
          ${sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:shadow-none"}
        `}>
          <ChatSidebar 
            currentConversationId={currentConversationId}
            onSelectConversation={(id) => {
              setCurrentConversationId(id);
              setSidebarOpen(false); // Close sidebar on mobile after selection
            }}
            conversations={conversations}
            setConversations={setConversations}
          />
        </div>
        
        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div 
            className="absolute inset-0 z-10 bg-black/20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          <ChatArea 
            conversationId={currentConversationId}
            onConversationCreated={(id) => {
              setCurrentConversationId(id);
              // Optimistically update the sidebar with the new chat (it will be fully fetched on next load)
              setConversations(prev => [{ id, title: "New Chat", createdAt: new Date(), updatedAt: new Date() }, ...prev]);
            }}
          />
        </div>

      </div>
    </div>
  );
}
