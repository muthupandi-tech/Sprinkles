"use client";

import { useChat, type Message } from "ai/react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Loader2, Bot, User, AlertCircle, Copy, Check, Sparkles, RefreshCw } from "lucide-react";
import { getMessages } from "@/app/actions/chat";

interface ChatAreaProps {
  conversationId: string | undefined;
  onConversationCreated: (id: string) => void;
}

export function ChatArea({ conversationId, onConversationCreated }: ChatAreaProps) {
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  const { messages, input, handleInputChange, handleSubmit, setMessages, isLoading, reload } = useChat({
    api: "/api/chat",
    body: {
      conversationId,
    },
    initialMessages,
    onResponse: (response) => {
      const newConversationId = response.headers.get("x-conversation-id");
      if (newConversationId && !conversationId) {
        onConversationCreated(newConversationId);
      }
    },
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    async function loadMessages() {
      if (!conversationId) {
        setMessages([]);
        setInitialMessages([]);
        return;
      }
      
      setLoadingHistory(true);
      const res = await getMessages(conversationId);
      if (res.success && res.messages) {
        const formattedMessages: Message[] = res.messages.map((m: any) => ({
          id: m.id,
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
          createdAt: new Date(m.createdAt),
        }));
        setInitialMessages(formattedMessages);
        setMessages(formattedMessages);
      }
      setLoadingHistory(false);
    }
    
    loadMessages();
  }, [conversationId, setMessages]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleSuggestion = (text: string) => {
    handleInputChange({ target: { value: text } } as any);
  };

  const suggestions = [
    "I want to practice for a software job interview.",
    "Give me an advanced vocabulary word to learn.",
    "Help me improve my accent pronunciation.",
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      {/* Messages Body */}
      <div className="flex-1 space-y-6 overflow-y-auto p-4 md:p-6">
        {loadingHistory ? (
          <div className="flex h-full items-center justify-center text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2 text-sm font-medium">Loading history...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Sparkles className="h-8 w-8 animate-pulse" />
            </div>
            <h2 className="text-xl font-extrabold text-gray-900">Sprinkles AI Coach</h2>
            <p className="mt-2 max-w-md text-sm text-gray-500">
              Your personal mentor for spoken English, interview prep, vocabulary, and confident communication.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {suggestions.map((sug) => (
                <button
                  key={sug}
                  onClick={() => handleSuggestion(sug)}
                  className="cursor-pointer rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition-all hover:border-blue-500 hover:text-blue-600 shadow-sm"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex max-w-[85%] gap-4 ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              {/* Avatar circle */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-sm ${
                  msg.role === "user" ? "bg-blue-600 text-white" : "bg-purple-100 text-purple-700 border border-purple-200"
                }`}
              >
                {msg.role === "user" ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              </div>

              {/* Message block */}
              <div className="space-y-1.5 min-w-0">
                <div
                  className={`rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "rounded-tr-none bg-blue-600 text-white shadow-md font-medium"
                      : "rounded-tl-none border border-gray-100 bg-gray-50 text-gray-800"
                  }`}
                >
                  {msg.role === "user" ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-gray-800 prose-pre:text-gray-100 prose-headings:font-bold prose-a:text-blue-600">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>

                {/* Actions & Timestamp */}
                <div className={`flex items-center gap-3 mt-1 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <span className="text-[10px] font-medium text-gray-400">
                    {msg.createdAt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  
                  {msg.role === "assistant" && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => copyToClipboard(msg.content)}
                        className="text-gray-400 hover:text-gray-700 transition-colors"
                        title="Copy text"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                      <button 
                        onClick={() => reload()}
                        className="text-gray-400 hover:text-gray-700 transition-colors"
                        title="Regenerate response"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {isLoading && messages.length > 0 && messages[messages.length - 1].role === "user" && (
          <div className="mr-auto flex max-w-[80%] items-center gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700 border border-purple-200 shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-none border border-gray-100 bg-gray-50 px-5 py-4 text-sm shadow-sm">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"></span>
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:0.2s]"></span>
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}

        <div ref={scrollRef}></div>
      </div>

      {/* Chat Input Footer */}
      <form
        onSubmit={handleSubmit}
        className="flex shrink-0 items-center gap-3 border-t border-gray-100 bg-white p-4 sm:px-6"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Ask Sprinkles a question or type 'vocab'..."
            className="w-full rounded-full border border-gray-200 bg-gray-50 px-5 py-3 pr-12 text-sm font-medium transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-1.5 top-1.5 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:shadow-none"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4 ml-0.5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
