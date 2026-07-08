"use client";

import { useState, useEffect } from "react";
import { Plus, MessageSquare, MoreVertical, Trash2, Edit2, Check, X } from "lucide-react";
import { getConversations, renameConversation, deleteConversation } from "@/app/actions/chat";

interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatSidebarProps {
  currentConversationId: string | undefined;
  onSelectConversation: (id: string | undefined) => void;
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
}

export function ChatSidebar({
  currentConversationId,
  onSelectConversation,
  conversations,
  setConversations,
}: ChatSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  useEffect(() => {
    async function loadConversations() {
      const res = await getConversations();
      if (res.success && res.conversations) {
        setConversations(res.conversations as unknown as Conversation[]);
      }
    }
    loadConversations();
  }, [setConversations]);

  const handleNewChat = () => {
    onSelectConversation(undefined);
  };

  const handleRenameSubmit = async (id: string) => {
    if (!editTitle.trim()) {
      setEditingId(null);
      return;
    }

    // Optimistic UI
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title: editTitle } : c)));
    setEditingId(null);
    setDropdownOpen(null);

    await renameConversation(id, editTitle);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this chat?")) {
      // Optimistic UI
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (currentConversationId === id) {
        onSelectConversation(undefined);
      }
      setDropdownOpen(null);
      await deleteConversation(id);
    }
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden border-r border-gray-100 bg-gray-50">
      <div className="p-4">
        <button
          onClick={handleNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-800 shadow-sm transition-all hover:border-blue-500 hover:text-blue-600 hover:shadow"
        >
          <Plus className="h-4 w-4" />
          <span>New Chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <h3 className="mb-2 px-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
          History
        </h3>

        {conversations.length === 0 ? (
          <p className="px-3 py-4 text-xs text-gray-400">No previous chats.</p>
        ) : (
          <div className="space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group relative flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 transition-colors ${
                  currentConversationId === conv.id
                    ? "bg-blue-100/50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100/80"
                }`}
                onClick={() => {
                  if (editingId !== conv.id) {
                    onSelectConversation(conv.id);
                  }
                }}
              >
                <MessageSquare
                  className={`h-4 w-4 shrink-0 ${currentConversationId === conv.id ? "text-blue-600" : "text-gray-400"}`}
                />

                {editingId === conv.id ? (
                  <div
                    className="flex flex-1 items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      autoFocus
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleRenameSubmit(conv.id)}
                      className="w-full flex-1 rounded border border-blue-500 bg-white px-1.5 py-0.5 text-sm outline-none"
                    />
                    <button
                      onClick={() => handleRenameSubmit(conv.id)}
                      className="rounded p-0.5 text-green-600 hover:bg-green-50"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded p-0.5 text-gray-500 hover:bg-gray-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <span className="flex-1 truncate text-sm font-medium">{conv.title}</span>
                )}

                {/* Dropdown Menu Toggle */}
                {editingId !== conv.id && (
                  <button
                    className={`shrink-0 rounded-md p-1 text-gray-400 transition-opacity hover:bg-gray-200 hover:text-gray-700 ${dropdownOpen === conv.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDropdownOpen(dropdownOpen === conv.id ? null : conv.id);
                    }}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                )}

                {/* Dropdown Menu */}
                {dropdownOpen === conv.id && (
                  <div
                    className="absolute top-10 right-2 z-10 w-36 rounded-lg border border-gray-100 bg-white p-1 shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        setEditTitle(conv.title);
                        setEditingId(conv.id);
                        setDropdownOpen(null);
                      }}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Rename
                    </button>
                    <button
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(conv.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
