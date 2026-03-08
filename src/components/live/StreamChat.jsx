import React, { useRef, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Pin, AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { db } from "@/api/db";
import ChatModeration from "./ChatModeration";
import ChatFAQ from "./ChatFAQ";
import ModerationSuggestions from "./ModerationSuggestions";
import ModerationDashboard from "./ModerationDashboard";

export default function StreamChat({ messages, user, isHost, message, setMessage, onSend, onPin, streamTitle = "", streamDescription = "", streamId = "" }) {
  const [chatTab, setChatTab] = useState("messages");
  const [moderationAction, setModerationAction] = useState(null);
  const [pinnedMsgId, setPinnedMsgId] = useState(null);
  const [bannedEmails, setBannedEmails] = useState([]);
  const bottomRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  const deleteMessage = async (msgId) => {
    try {
      await db.entities.LiveChat.delete(msgId);
      queryClient.invalidateQueries({ queryKey: ["stream-chat", streamId] });
      toast.success("Message deleted");
    } catch(e) { toast.error("Could not delete message"); }
  };

  const banUser = (email) => {
    if (window.confirm(`Ban ${email} from this stream?`)) {
      setBannedEmails(prev => [...prev, email]);
      toast.success(`${email} banned from stream`);
    }
  };

  const pinnedMessages = messages?.filter(m => m.is_pinned) || [];
  const regularMessages = messages?.filter(m => !m.is_pinned && !bannedEmails.includes(m.sender_email)) || [];

  return (
    <div className="flex flex-col h-full">
      {/* Chat Tabs */}
      <div className="flex gap-1 px-4 pt-3 pb-0 border-b border-slate-200 overflow-x-auto">
        {[
          { key: "messages", label: "Chat" },
          { key: "moderation", label: "Moderation", hidden: !isHost },
          { key: "dashboard", label: "Dashboard", hidden: !isHost },
          { key: "faq", label: "FAQ" }
        ]
          .filter(tab => !tab.hidden)
          .map(tab => (
            <button
              key={tab.key}
              onClick={() => setChatTab(tab.key)}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
                chatTab === tab.key
                  ? "border-red-600 text-slate-800"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
      </div>

      {/* Messages Tab */}
      {chatTab === "messages" && (
        <>
          {/* Pinned messages */}
          {pinnedMessages.length > 0 && (
            <div className="px-4 pt-3 space-y-2">
              {pinnedMessages.map(msg => (
                <div key={msg.id} className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-start gap-2">
                  <Pin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-amber-800">{msg.sender_name}</p>
                    <p className="text-xs text-amber-900 break-words">{msg.message}</p>
                  </div>
                  {isHost && (
                    <button onClick={() => onPin(msg)} className="text-amber-400 hover:text-amber-600">
                      <Pin className="w-3.5 h-3.5 fill-current" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Local pinned message banner */}
          {pinnedMsgId && (() => {
            const pinned = messages?.find(m => m.id === pinnedMsgId);
            return pinned ? (
              <div className="flex items-start gap-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl mb-2 mx-2">
                <Pin className="w-3 h-3 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-yellow-400">{pinned.sender_name}</span>
                  <p className="text-xs text-slate-300">{pinned.message}</p>
                </div>
              </div>
            ) : null;
          })()}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {regularMessages.length === 0 && pinnedMessages.length === 0 && (
              <div className="text-center py-12">
                <p className="text-4xl mb-2">💬</p>
                <p className="text-slate-400 text-sm">No messages yet. Start the chat!</p>
              </div>
            )}

            {regularMessages.map(msg => {
              const isMe = msg.sender_email === user?.email;
              return (
                <div key={msg.id} className="flex items-start gap-2 group hover:bg-slate-50 rounded-xl p-1.5 transition-colors">
                  <Avatar className="w-7 h-7 flex-shrink-0">
                    <AvatarImage src={msg.sender_avatar} />
                    <AvatarFallback className="text-[10px] bg-gradient-to-br from-purple-200 to-pink-200 font-bold">
                      {msg.sender_name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className={`font-bold text-xs truncate ${isMe ? "text-red-700" : "text-slate-800"}`}>
                        {msg.sender_name}
                        {msg.is_host_tag && (
                          <Badge className="ml-1 bg-red-600 text-white text-[9px] px-1 py-0">Host</Badge>
                        )}
                      </p>
                      <p className="text-[10px] text-slate-400 flex-shrink-0">{formatDistanceToNow(new Date(msg.created_date))}</p>
                    </div>
                    <p className="text-sm text-slate-700 break-words leading-snug">{msg.message}</p>
                  </div>
                  {isHost && (
                    <div className="opacity-0 group-hover:opacity-100 flex gap-1 ml-auto transition-opacity flex-shrink-0">
                      <button
                        onClick={() => onPin(msg)}
                        title="Pin (persistent)"
                        className="p-1 rounded text-slate-300 hover:text-amber-500 transition-all"
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setPinnedMsgId(prev => prev === msg.id ? null : msg.id)}
                        title="Pin locally"
                        className={`p-1 rounded ${pinnedMsgId === msg.id ? "text-yellow-400" : "text-slate-500 hover:text-yellow-400"}`}
                      >
                        <Pin className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        title="Delete"
                        className="p-1 rounded text-slate-500 hover:text-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      {msg.sender_email !== user?.email && (
                        <button
                          onClick={() => banUser(msg.sender_email)}
                          title="Ban"
                          className="p-1 rounded text-slate-500 hover:text-orange-400 text-xs"
                        >
                          🚫
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        </>
      )}

      {/* Moderation Tab */}
      {chatTab === "moderation" && isHost && (
        <div className="flex-1 overflow-y-auto p-4">
          <ChatModeration messages={messages} streamId={streamId} isHost={isHost} />
        </div>
      )}

      {/* Dashboard Tab */}
      {chatTab === "dashboard" && isHost && (
        <div className="flex-1 overflow-y-auto p-4">
          <ModerationDashboard streamId={streamId} isHost={isHost} />
        </div>
      )}

      {/* FAQ Tab */}
      {chatTab === "faq" && (
        <div className="flex-1 overflow-y-auto p-4">
          <ChatFAQ streamTitle={streamTitle} streamDescription={streamDescription} isHost={isHost} />
        </div>
      )}

      {/* Moderation Suggestions */}
      {isHost && message && (
        <div className="px-3 pt-2">
          <ModerationSuggestions 
            message={message} 
            streamId={streamId} 
            isHost={isHost}
            onAction={(action, msg) => {
              setModerationAction({ action, message: msg });
              toast.success(`Action: ${action}`);
            }}
          />
        </div>
      )}

      {/* Input */}
      {user ? (
        <div className="p-3 border-t border-slate-100 bg-white">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && onSend()}
              placeholder="Say something..."
              className="rounded-xl text-sm h-9 border-slate-200"
            />
            <Button
              onClick={onSend}
              disabled={!message.trim()}
              className="bg-red-600 hover:bg-red-700 rounded-xl px-3 h-9"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-3 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">Log in to chat</p>
        </div>
      )}
    </div>
  );
}