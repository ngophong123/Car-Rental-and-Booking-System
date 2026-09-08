"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, Car, Phone, ChevronRight, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/axios";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface RecommendedVehicle {
  id: string;
  name: string;
  seatCount: number;
  basePrice: number;
  image: string | null;
  type?: string;
  brand?: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  vehicles?: RecommendedVehicle[];
  quickSuggestions?: string[];
  time: string;
}

const INITIAL_SUGGESTIONS = [
  "🚗 Tìm xe 7 chỗ đi du lịch",
  "💰 Xe giá rẻ dưới 1 triệu",
  "📋 Cần giấy tờ gì để thuê xe?",
  "✈️ Đưa đón sân bay giá sao?"
];

export function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Xin chào! Em là Trợ lý Ảo AI của Minh Khoa. Em có thể giúp anh/chị tìm xe phù hợp, kiểm tra giá thuê và hướng dẫn thủ tục thuê xe nhanh chóng!",
      quickSuggestions: INITIAL_SUGGESTIONS,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue("");
    setLoading(true);

    try {
      const res = await api.post("/ai/chat", { message: text });
      if (res.data.success) {
        const { reply, recommendedVehicles, quickSuggestions } = res.data.data;
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: reply,
          vehicles: recommendedVehicles,
          quickSuggestions: quickSuggestions || INITIAL_SUGGESTIONS,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (error) {
      console.error("AI error", error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "Dạ, hiện tại kết nối đang bận một chút. Anh/chị có thể gọi trực tiếp tới Hotline **0859 354 724** để được tư vấn ngay lập tức ạ!",
        quickSuggestions: ["Gọi hotline 0859354724", "Xem danh sách xe"],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Trigger Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300"
          >
            <div className="relative">
              <Sparkles className="h-6 w-6 animate-spin text-amber-300" style={{ animationDuration: '6s' }} />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <span className="hidden sm:inline font-semibold text-sm">Hỏi AI Tìm Xe</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-4 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 text-white flex items-center justify-center shadow-md shadow-emerald-500/30 shrink-0 ring-2 ring-white/20">
                  <Sparkles className="h-5 w-5 drop-shadow-xs" />
                </div>
                <div>
                  <h3 className="font-bold text-sm flex items-center gap-1.5 text-white">
                    Trợ Lý AI Minh Khoa
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  </h3>
                  <p className="text-xs text-slate-300">Tư vấn tìm xe & thủ tục 24/7</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-slate-300 hover:text-white hover:bg-white/10 rounded-full h-8 w-8"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start items-start"}`}
                >
                  {msg.sender === "ai" && (
                    <div className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                      msg.sender === "user"
                        ? "bg-emerald-600 text-white rounded-br-none"
                        : "bg-white text-slate-800 border border-slate-100 rounded-bl-none"
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>

                    {/* Recommended Vehicle Mini Cards */}
                    {msg.vehicles && msg.vehicles.length > 0 && (
                      <div className="mt-3 space-y-2 border-t pt-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Xe gợi ý phù hợp:
                        </p>
                        <div className="space-y-2">
                          {msg.vehicles.map((v) => (
                            <div
                              key={v.id}
                              className="bg-slate-50 hover:bg-emerald-50/60 transition-colors border rounded-xl p-2 flex items-center gap-3"
                            >
                              <img
                                src={v.image || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=300&q=80"}
                                alt={v.name}
                                className="w-16 h-12 rounded-lg object-cover shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-xs text-slate-900 truncate">{v.name}</h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[11px] bg-slate-200/80 px-1.5 py-0.5 rounded text-slate-700">
                                    {v.seatCount} chỗ
                                  </span>
                                  <span className="text-xs font-bold text-emerald-600">
                                    {formatPrice(v.basePrice)}/ngày
                                  </span>
                                </div>
                              </div>
                              <Link
                                href={`/vehicles/${v.id}`}
                                onClick={() => setIsOpen(false)}
                                className="shrink-0 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm"
                              >
                                Đặt
                                <ChevronRight className="h-3 w-3" />
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>

                  {/* Quick Suggestion Chips */}
                  {msg.quickSuggestions && msg.sender === "ai" && (
                    <div className="flex flex-wrap gap-1.5 mt-2 max-w-[95%]">
                      {msg.quickSuggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(suggestion.replace(/^[^\w\s]+/, '').trim())}
                          className="text-xs bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 rounded-full px-3 py-1 transition-all shadow-xs"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center">
                    <Bot className="h-4 w-4 text-emerald-600 animate-spin" />
                  </div>
                  <span className="animate-pulse">AI đang tìm xe tốt nhất cho bạn...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Hotline Bar */}
            <div className="bg-slate-100 px-4 py-2 flex items-center justify-between text-xs text-slate-600 border-t">
              <span>Cần hỗ trợ gấp?</span>
              <a
                href="tel:0859354724"
                className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <Phone className="h-3 w-3" /> 0859 354 724
              </a>
            </div>

            {/* Input Footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-white border-t flex items-center gap-2"
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Nhập yêu cầu (ví dụ: cần xe 7 chỗ giá rẻ)..."
                className="text-sm h-10 rounded-xl focus-visible:ring-emerald-500"
                disabled={loading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!inputValue.trim() || loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 w-10 shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
