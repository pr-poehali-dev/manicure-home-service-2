import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import Navbar from "@/components/Navbar";

interface Booking {
  id: number;
  service_name: string;
  date: string;
  time: string;
  status: string;
}

interface Favorite {
  id: number;
  service_id: number;
  service_name: string;
  price: number;
}

function Profile() {
  const { user, loading: authLoading, refresh } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [theme, setTheme] = useState("dark");
  const [lang, setLang] = useState("ru");
  const [saving, setSaving] = useState(false);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setTheme(user.theme || "dark");
      setLang(user.lang || "ru");
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    api.getBookings()
      .then((data) => setBookings(data.bookings || []))
      .catch(() => {})
      .finally(() => setLoadingBookings(false));

    api.getFavorites()
      .then((data) => setFavorites(data.favorites || []))
      .catch(() => {})
      .finally(() => setLoadingFavorites(false));
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateProfile({ name, phone, theme, lang });
      await refresh();
      toast({ title: "Профиль обновлён" });
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: err instanceof Error ? err.message : "Не удалось сохранить",
      });
    } finally {
      setSaving(false);
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
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-32 animate-fade-in">
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-[#d4a843]/10 flex items-center justify-center mx-auto mb-5">
            <Icon name="User" size={28} className="text-[#d4a843]" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-white mb-1">
            {user.name}
          </h1>
          <p className="font-body text-sm text-white/40">{user.email}</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full bg-white/[0.03] border border-white/[0.06] mb-8">
            <TabsTrigger
              value="profile"
              className="flex-1 font-body text-xs uppercase tracking-wider data-[state=active]:bg-[#d4a843]/10 data-[state=active]:text-[#d4a843]"
            >
              Профиль
            </TabsTrigger>
            <TabsTrigger
              value="bookings"
              className="flex-1 font-body text-xs uppercase tracking-wider data-[state=active]:bg-[#d4a843]/10 data-[state=active]:text-[#d4a843]"
            >
              Бронирования
            </TabsTrigger>
            <TabsTrigger
              value="favorites"
              className="flex-1 font-body text-xs uppercase tracking-wider data-[state=active]:bg-[#d4a843]/10 data-[state=active]:text-[#d4a843]"
            >
              Избранное
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-8">
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="font-body text-xs uppercase tracking-wider text-white/40 mb-2 block">
                      Имя
                    </label>
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-white/[0.03] border-white/[0.08] text-white focus-visible:ring-[#d4a843]/50"
                    />
                  </div>
                  <div>
                    <label className="font-body text-xs uppercase tracking-wider text-white/40 mb-2 block">
                      Телефон
                    </label>
                    <Input
                      type="tel"
                      placeholder="+7 (999) 123-45-67"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus-visible:ring-[#d4a843]/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="font-body text-xs uppercase tracking-wider text-white/40 mb-2 block">
                      Тема
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setTheme("dark")}
                        className={`flex-1 font-body text-xs uppercase tracking-wider py-2.5 rounded-xl border transition-all duration-300 ${
                          theme === "dark"
                            ? "bg-[#d4a843]/10 border-[#d4a843]/30 text-[#d4a843]"
                            : "bg-white/[0.02] border-white/[0.06] text-white/30 hover:text-white/50"
                        }`}
                      >
                        <Icon name="Moon" size={14} className="inline mr-1.5" />
                        Dark
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheme("light")}
                        className={`flex-1 font-body text-xs uppercase tracking-wider py-2.5 rounded-xl border transition-all duration-300 ${
                          theme === "light"
                            ? "bg-[#d4a843]/10 border-[#d4a843]/30 text-[#d4a843]"
                            : "bg-white/[0.02] border-white/[0.06] text-white/30 hover:text-white/50"
                        }`}
                      >
                        <Icon name="Sun" size={14} className="inline mr-1.5" />
                        Light
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="font-body text-xs uppercase tracking-wider text-white/40 mb-2 block">
                      Язык
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setLang("ru")}
                        className={`flex-1 font-body text-xs uppercase tracking-wider py-2.5 rounded-xl border transition-all duration-300 ${
                          lang === "ru"
                            ? "bg-[#8cc63f]/10 border-[#8cc63f]/30 text-[#8cc63f]"
                            : "bg-white/[0.02] border-white/[0.06] text-white/30 hover:text-white/50"
                        }`}
                      >
                        RU
                      </button>
                      <button
                        type="button"
                        onClick={() => setLang("en")}
                        className={`flex-1 font-body text-xs uppercase tracking-wider py-2.5 rounded-xl border transition-all duration-300 ${
                          lang === "en"
                            ? "bg-[#8cc63f]/10 border-[#8cc63f]/30 text-[#8cc63f]"
                            : "bg-white/[0.02] border-white/[0.06] text-white/30 hover:text-white/50"
                        }`}
                      >
                        EN
                      </button>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto font-body text-sm uppercase tracking-wider bg-gradient-to-r from-[#d4a843] to-[#b8912e] text-black font-semibold hover:from-[#e0b84d] hover:to-[#d4a843] transition-all duration-300 shadow-lg shadow-[#d4a843]/10 h-11 px-8 rounded-xl"
                >
                  {saving ? (
                    <Icon name="Loader2" size={16} className="animate-spin" />
                  ) : (
                    "Сохранить"
                  )}
                </Button>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="bookings">
            <div className="space-y-4">
              <h2 className="font-display text-2xl font-semibold text-white mb-4">
                Мои бронирования
              </h2>
              {loadingBookings ? (
                <div className="flex justify-center py-12">
                  <Icon name="Loader2" size={24} className="text-[#d4a843] animate-spin" />
                </div>
              ) : bookings.length === 0 ? (
                <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-12 text-center">
                  <Icon name="Calendar" size={32} className="text-white/10 mx-auto mb-4" />
                  <p className="font-body text-sm text-white/30">
                    У вас пока нет бронирований
                  </p>
                </div>
              ) : (
                bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-display text-lg font-semibold text-white">
                        {booking.service_name}
                      </h3>
                      <p className="font-body text-xs text-white/40 mt-1">
                        {booking.date} в {booking.time}
                      </p>
                    </div>
                    <span
                      className={`font-body text-xs uppercase tracking-wider px-3 py-1 rounded-full ${
                        booking.status === "confirmed"
                          ? "bg-[#8cc63f]/10 text-[#8cc63f]"
                          : booking.status === "cancelled"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-[#d4a843]/10 text-[#d4a843]"
                      }`}
                    >
                      {booking.status === "confirmed"
                        ? "Подтверждено"
                        : booking.status === "cancelled"
                        ? "Отменено"
                        : "Ожидание"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="favorites">
            <div className="space-y-4">
              <h2 className="font-display text-2xl font-semibold text-white mb-4">
                Избранное
              </h2>
              {loadingFavorites ? (
                <div className="flex justify-center py-12">
                  <Icon name="Loader2" size={24} className="text-[#d4a843] animate-spin" />
                </div>
              ) : favorites.length === 0 ? (
                <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-12 text-center">
                  <Icon name="Heart" size={32} className="text-white/10 mx-auto mb-4" />
                  <p className="font-body text-sm text-white/30">
                    Вы пока ничего не добавили в избранное
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {favorites.map((fav) => (
                    <div
                      key={fav.id}
                      className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 hover:border-[#d4a843]/15 transition-all duration-500"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-display text-lg font-semibold text-white">
                            {fav.service_name}
                          </h3>
                          <p className="font-body text-sm text-[#d4a843] mt-1">
                            {fav.price} ₽
                          </p>
                        </div>
                        <Icon name="Heart" size={18} className="text-[#d4a843] fill-[#d4a843]" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default Profile;
