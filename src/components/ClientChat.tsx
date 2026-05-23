import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Paperclip, 
  MessageSquare, 
  ShieldCheck, 
  Clock, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Sparkles, 
  CheckCircle, 
  Loader2, 
  AlertCircle,
  FileText
} from "lucide-react";
import { Chat, Message, FreelancerProfile } from "../types";

interface ClientChatProps {
  chats: Chat[];
  onSendMessage: (chatId: string, text: string) => void;
  onReceiveMessage: (chatId: string, text: string) => void;
  profile: FreelancerProfile;
}

export default function ClientChat({
  chats,
  onSendMessage,
  onReceiveMessage,
  profile
}: ClientChatProps) {
  const [activeChatId, setActiveChatId] = useState<string>(chats[0]?.id || "");
  const [typingText, setTypingText] = useState<string>("");
  const [isAiResponding, setIsAiResponding] = useState<boolean>(false);
  const [uploadFile, setUploadFile] = useState<any>(null);
  const [mobileShowChat, setMobileShowChat] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const activeChat = chats.find(c => c.id === activeChatId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages, activeChat?.isTyping]);

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || typingText;
    if (!textToSend.trim() || !activeChat) return;

    // Send freelancer's message
    onSendMessage(activeChat.id, textToSend);
    if (!customText) setTypingText("");

    setIsAiResponding(true);

    try {
      const response = await fetch("/api/chat/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: activeChat.clientName,
          clientTitle: activeChat.clientTitle,
          persona: activeChat.persona,
          jobTitle: activeChat.id === "kenji" 
            ? "Secure Payment Guide" 
            : activeChat.id === "liam" 
            ? "E-Commerce Checkout Refactoring" 
            : "Meditation Application Designs",
          currentMessage: textToSend,
          chatHistory: activeChat.messages.slice(-6) // send last 6 messages as context
        })
      });

      const data = await response.json();
      if (data.text) {
        // Append client's simulated response
        onReceiveMessage(activeChat.id, data.text);
      }
    } catch (err) {
      console.error("Failed to generate simulated chat response:", err);
    } finally {
      setIsAiResponding(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadFile({
        name: file.name,
        size: Math.round(file.size / 1024) + " KB",
      });
    }
  };

  const templates = [
    { 
      label: "Request Milestone 2 Approval", 
      text: "Hi, I've officially completed the Webhooks signature verification code chunks. Let me know if you can check them so we can approve Milestone 2 and trigger the escrow payout!",
      chat: "kenji"
    },
    { 
      label: "Submit E-commerce Wiremaps", 
      text: "Hello Liam! I've put together some prelim design schematics. I'm ready to begin core React development as soon as we lock the escrow contract.",
      chat: "liam"
    },
    { 
      label: "Request Color Feedback", 
      text: "Hi Sophia, I updated the color harmonies for the active breathing panel. They match your tranquil design targets closely. Please let me know if they look good.",
      chat: "sophia"
    }
  ];

  const activeTemplates = templates.filter(t => t.chat === activeChatId);

  return (
    <div id="workspace-chat-container" className="bg-white border border-slate-200 rounded-xl shadow-sm h-[75vh] flex overflow-hidden animate-fade-in">
      
      {/* 1. Left Chat Channel Roster (3 Cols) */}
      <div 
        id="chats-roster-pane" 
        className={`w-full md:w-80 border-r border-slate-150 flex flex-col h-full bg-slate-50/50 shrink-0 ${
          mobileShowChat ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="p-4 border-b border-slate-150">
          <span className="text-[10px] font-mono tracking-wider font-bold text-slate-400 block mb-2">WORKSPACE CHANNELS</span>
          <div className="text-xs text-slate-500 font-light leading-snug">
            Communicate directly with active stakeholders. Responses are simulated via AI personas.
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {chats.map((c) => {
            const isSelected = activeChatId === c.id;
            const lastMessage = c.messages[c.messages.length - 1];
            
            return (
              <div
                id={`chat-channel-row-${c.id}`}
                key={c.id}
                onClick={() => {
                  setActiveChatId(c.id);
                  setUploadFile(null);
                  setMobileShowChat(true);
                }}
                className={`p-4 flex items-start gap-3 cursor-pointer transition ${
                  isSelected ? "bg-white border-l-4 border-sky-600" : "hover:bg-slate-50/70"
                }`}
              >
                <div className="relative shrink-0">
                  <img 
                    src={c.clientAvatar} 
                    alt={c.clientName} 
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 ring-2 ring-white rounded-full"></span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h4 className="text-xs font-semibold text-slate-800 truncate">{c.clientName}</h4>
                    <span className="text-[9px] text-slate-400 font-mono">LIVE</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block truncate mb-1">{c.clientTitle}</span>
                  {lastMessage && (
                    <p className="text-[10px] text-slate-400 truncate leading-tight font-light">{lastMessage.text}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Middle Direct Chat Workspace */}
      {activeChat ? (
        <div 
          id="active-chat-content" 
          className={`flex-1 flex flex-col h-full bg-white relative ${
            mobileShowChat ? "flex" : "hidden md:flex"
          }`}
        >
          
          {/* Active Chat Header */}
          <div className="p-4 border-b border-slate-150 flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Back button on mobile */}
              <button
                id="mobile-chat-back-btn"
                type="button"
                onClick={() => setMobileShowChat(false)}
                className="md:hidden p-1.5 hover:bg-slate-150 text-slate-600 rounded-lg transition mr-1 shrink-0 cursor-pointer"
                aria-label="Back to channels list"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <img 
                src={activeChat.clientAvatar} 
                alt={activeChat.clientName} 
                className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-800 leading-none mb-1 truncate">{activeChat.clientName}</h4>
                <p className="text-[10px] text-slate-550 font-mono truncate">{activeChat.clientTitle}</p>
              </div>
            </div>
            
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/50 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
              <span>Compliant Channel</span>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/30">
            {activeChat.messages.length === 0 ? (
              <div className="py-24 text-center">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">Initiate secure discussion with {activeChat.clientName}.</p>
              </div>
            ) : (
              activeChat.messages.map((msg) => {
                const isFreelancer = msg.sender === "freelancer";
                
                return (
                  <div key={msg.id} className={`flex ${isFreelancer ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] sm:max-w-[70%] rounded-xl p-3.5 text-xs shadow-sm ${
                      isFreelancer
                        ? "bg-slate-900 text-white font-medium"
                        : "bg-white border border-slate-200 text-slate-800 font-light leading-relaxed"
                    }`}>
                      {!isFreelancer && (
                        <div className="flex items-center justify-between mb-1 opacity-70">
                          <strong className="text-[10px] font-bold">{activeChat.clientName}</strong>
                          <span className="text-[8px] font-mono">CLIENT</span>
                        </div>
                      )}
                      
                      <p className="whitespace-pre-line">{msg.text}</p>
                      
                      <div className={`text-[8px] font-mono mt-1 w-full text-right ${isFreelancer ? 'text-slate-400' : 'text-slate-400'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Simulated typing status */}
            {(isAiResponding || activeChat.isTyping) && (
              <div className="flex justify-start items-center gap-2">
                <div className="bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs shadow-sm text-slate-500 inline-flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 truncate max-w-[150px]">{activeChat.clientName} is pondering...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick-send Template dialogues */}
          {activeTemplates.length > 0 && (
            <div className="px-4 py-2 bg-slate-50 border-t border-b border-slate-150 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="text-[10px] font-mono tracking-wider font-bold text-slate-400">PITCH SUGGESTIONS:</span>
              {activeTemplates.map((tpl, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(undefined, tpl.text)}
                  className="bg-white hover:bg-slate-50 border border-slate-250 hover:border-slate-350 rounded-full py-1 px-3 text-[10px] font-medium text-slate-700 transition cursor-pointer"
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          )}

          {/* File drag-and-drop submit banner or mock file uploaded */}
          {uploadFile && (
            <div className="mx-4 mt-3 p-2 bg-slate-100 border border-slate-250 rounded-lg flex items-center justify-between text-xs animate-fade-in">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                <div className="min-w-0">
                  <span className="font-semibold text-slate-800 block leading-tight truncate">{uploadFile.name}</span>
                  <span className="text-[10px] text-slate-400 block font-mono">{uploadFile.size} • Will send upon hit</span>
                </div>
              </div>
              <button 
                onClick={() => setUploadFile(null)} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Bottom Chat Input Form */}
          <form 
            onSubmit={(e) => handleSendMessage(e)} 
            className="p-4 border-t border-slate-100 flex items-center gap-2 bg-white"
          >
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="relative hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg h-10 w-10 flex items-center justify-center transition shrink-0 cursor-pointer group"
              title="Drag & Drop Files here or click to simulate attachment"
              onClick={() => {
                setUploadFile({
                  name: `meditation_applet_v2_HMAC_codebase.zip`,
                  size: "2.4 MB"
                });
              }}
            >
              <Paperclip className="w-4.5 h-4.5 text-slate-500 group-hover:text-slate-700" />
            </div>

            <input 
              id="chat-text-input-field"
              type="text" 
              placeholder={`Message...`}
              value={typingText}
              onChange={(e) => setTypingText(e.target.value)}
              disabled={isAiResponding}
              className="flex-1 bg-slate-50 border border-slate-200/80 rounded-lg px-3.5 h-10 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
            />

            <button
              id="chat-send-message-submit"
              type="submit"
              disabled={isAiResponding || (!typingText.trim() && !uploadFile)}
              className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white disabled:text-slate-400 h-10 w-10 rounded-lg flex items-center justify-center transition shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      ) : (
        <div 
          className={`flex-1 flex flex-col justify-center items-center py-24 text-center ${
            mobileShowChat ? "flex" : "hidden md:flex"
          }`}
        >
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-500 px-6">Pick an active stakeholder channel from the left list to begin communications.</p>
        </div>
      )}

    </div>
  );
}
