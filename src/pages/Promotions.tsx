import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import Icon from "@/components/ui/icon";
import Navbar from "@/components/Navbar";

interface Promotion {
  id: number;
  title: string;
  description: string;
  cover?: string;
  end_date: string;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function daysLeft(dateStr: string): number {
  try {
    const end = new Date(dateStr);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  } catch {
    return 0;
  }
}

function pluralDays(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} день`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} дня`;
  return `${n} дней`;
}

function Promotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPromotions()
      .then((data) => setPromotions(data.promotions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-32 animate-fade-in">
        <div className="text-center mb-14">
          <span className="font-body text-xs uppercase tracking-[0.3em] text-[#d4a843]/60 mb-4 block">
            Специальные предложения
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold text-white">
            <span className="text-[#d4a843]">Акции</span>
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Icon name="Loader2" size={32} className="text-[#d4a843] animate-spin" />
          </div>
        ) : promotions.length === 0 ? (
          <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-16 text-center">
            <Icon name="Sparkles" size={40} className="text-white/10 mx-auto mb-4" />
            <h3 className="font-display text-xl text-white/30 mb-2">Пока нет акций</h3>
            <p className="font-body text-sm text-white/20">
              Следите за обновлениями, скоро здесь появятся выгодные предложения
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {promotions.map((promo) => {
              const remaining = daysLeft(promo.end_date);
              const expired = remaining === 0;

              return (
                <div
                  key={promo.id}
                  className={`bg-white/[0.03] backdrop-blur-sm border rounded-2xl overflow-hidden transition-all duration-500 ${
                    expired
                      ? "border-white/[0.04] opacity-60"
                      : "border-white/[0.06] hover:border-[#d4a843]/15"
                  }`}
                >
                  {promo.cover && (
                    <div className="aspect-[16/9] bg-white/[0.02] overflow-hidden">
                      <img
                        src={promo.cover}
                        alt={promo.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-7">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h3 className="font-display text-xl sm:text-2xl font-semibold text-white leading-tight">
                        {promo.title}
                      </h3>
                      {!expired ? (
                        <span className="shrink-0 font-body text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full bg-[#8cc63f]/10 border border-[#8cc63f]/20 text-[#8cc63f] whitespace-nowrap">
                          {pluralDays(remaining)}
                        </span>
                      ) : (
                        <span className="shrink-0 font-body text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-white/20 whitespace-nowrap">
                          Завершена
                        </span>
                      )}
                    </div>

                    <p className="font-body text-sm text-white/40 leading-relaxed mb-5">
                      {promo.description}
                    </p>

                    <div className="flex items-center gap-2 text-white/20 font-body text-xs">
                      <Icon name="CalendarClock" size={13} className="text-[#d4a843]/40" />
                      <span>до {formatDate(promo.end_date)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Promotions;
