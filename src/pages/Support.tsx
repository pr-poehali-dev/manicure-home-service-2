import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import Icon from "@/components/ui/icon";
import Navbar from "@/components/Navbar";

interface Message {
  id: number;
  message: string;
  sender: string;
  created_at: string;
}

function Support() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  const fetchMessages = async () => {
    try {
      const data = await api.getChats();
      setMessages(data.messages || []);
    } catch {
      /* silent */
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchMessages();
    intervalRef.current = setInterval(fetchMessages, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      await api.sendMessage({ message: input.trim() });
      setInput("");
      await fetchMessages();
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: err instanceof Error ? err.message : "Не удалось отправить",
      });
    } finally {
      setSending(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Icon name="Loader2" size={32} className="text-[#d4a843] animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 pb-4 flex flex-col animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-white mb-2">
            Поддержка
          </h1>
          <p className="font-body text-sm text-white/40">
            Напишите и мы ответим как можно скорее
          </p>
        </div>

        <div className="flex-1 bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl flex flex-col overflow-hidden min-h-[400px] max-h-[60vh]">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <Icon name="MessageCircle" size={40} className="text-white/10 mb-4" />
                <p className="font-body text-sm text-white/20">
                  Начните диалог с поддержкой
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isUser = msg.sender === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-5 py-3 ${
                        isUser
                          ? "bg-[#8cc63f]/15 border border-[#8cc63f]/20 text-white"
                          : "bg-[#d4a843]/10 border border-[#d4a843]/15 text-white"
                      }`}
                    >
                      <p className="font-body text-sm leading-relaxed">{msg.message}</p>
                      <p
                        className={`font-body text-[10px] mt-1.5 ${
                          isUser ? "text-[#8cc63f]/40 text-right" : "text-[#d4a843]/40"
                        }`}
                      >
                        {new Date(msg.created_at).toLocaleTimeString("ru-RU", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-white/[0.06] p-4">
            <form onSubmit={handleSend} className="flex items-center gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Напишите сообщение..."
                className="flex-1 font-body text-sm bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#d4a843]/50 transition-all duration-300"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="w-11 h-11 rounded-xl bg-gradient-to-r from-[#d4a843] to-[#b8912e] flex items-center justify-center text-black hover:from-[#e0b84d] hover:to-[#d4a843] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {sending ? (
                  <Icon name="Loader2" size={16} className="animate-spin" />
                ) : (
                  <Icon name="Send" size={16} />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Support;
