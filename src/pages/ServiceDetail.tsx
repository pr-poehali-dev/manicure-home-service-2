import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";
import Navbar from "@/components/Navbar";

interface Slot {
  id: number;
  slot_date: string;
  slot_time: string;
  is_booked: boolean;
}

interface RelatedService {
  id: number;
  name: string;
  price: number;
  photos: string;
}

interface ServiceData {
  id: number;
  name: string;
  price: number;
  description: string;
  photos: string;
  category_name?: string;
  slots: Slot[];
  related: RelatedService[];
}

function parsePhotos(photos: string): string[] {
  try {
    const parsed = JSON.parse(photos);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [service, setService] = useState<ServiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainPhoto, setMainPhoto] = useState(0);
  const [isFav, setIsFav] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [bookName, setBookName] = useState("");
  const [bookPhone, setBookPhone] = useState("");
  const [bookEmail, setBookEmail] = useState("");
  const [bookAge, setBookAge] = useState("");
  const [bookComment, setBookComment] = useState("");
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.getService(Number(id))
      .then((data) => setService(data.service))
      .catch(() => {
        toast({ variant: "destructive", title: "Услуга не найдена" });
        navigate("/prices");
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;
    api.getFavorites()
      .then((data) => {
        const ids = (data.favorites || []).map((f: { service_id: number }) => f.service_id);
        setIsFav(ids.includes(Number(id)));
      })
      .catch(() => {});
  }, [user, id]);

  useEffect(() => {
    if (user) {
      setBookName(user.name || "");
      setBookEmail(user.email || "");
      setBookPhone(user.phone || "");
    }
  }, [user]);

  const handleToggleFavorite = async () => {
    if (!user || !service) return;
    try {
      const data = await api.toggleFavorite(service.id);
      setIsFav(data.favorited);
    } catch {
      /* silent */
    }
  };

  const handleOpenBooking = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setDialogOpen(true);
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !service) return;
    setBooking(true);
    try {
      await api.createBooking({
        service_id: service.id,
        slot_id: selectedSlot,
        name: bookName,
        phone: bookPhone,
        email: bookEmail,
        age: bookAge,
        comment: bookComment,
      });
      toast({ title: "Бронирование создано!" });
      setDialogOpen(false);
      setSelectedSlot(null);
      setBookComment("");
      const updated = await api.getService(service.id);
      setService(updated.service);
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Ошибка бронирования",
        description: err instanceof Error ? err.message : "Попробуйте позже",
      });
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Icon name="Loader2" size={32} className="text-[#d4a843] animate-spin" />
        </div>
      </div>
    );
  }

  if (!service) return null;

  const photos = parsePhotos(service.photos);
  const availableSlots = (service.slots || []).filter((s) => !s.is_booked);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-32 animate-fade-in">
        <Link
          to="/prices"
          className="inline-flex items-center gap-1.5 font-body text-xs uppercase tracking-wider text-white/30 hover:text-white/60 transition-colors duration-300 mb-8"
        >
          <Icon name="ArrowLeft" size={14} />
          Назад к услугам
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <div className="relative aspect-[4/3] bg-white/[0.03] rounded-2xl overflow-hidden border border-white/[0.06] mb-3">
              {photos.length > 0 ? (
                <img
                  src={photos[mainPhoto]}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icon name="Image" size={48} className="text-white/10" />
                </div>
              )}
            </div>
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {photos.map((photo, i) => (
                  <button
                    key={i}
                    onClick={() => setMainPhoto(i)}
                    className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      mainPhoto === i
                        ? "border-[#d4a843] opacity-100"
                        : "border-transparent opacity-50 hover:opacity-80"
                    }`}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            {service.category_name && (
              <span className="font-body text-[10px] uppercase tracking-wider text-[#8cc63f]/70 mb-3 block">
                {service.category_name}
              </span>
            )}
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-white mb-4 leading-tight">
              {service.name}
            </h1>
            <p className="font-display text-4xl font-semibold text-[#d4a843] mb-6">
              {service.price} ₽
            </p>
            {service.description && (
              <p className="font-body text-sm text-white/40 leading-relaxed mb-8">
                {service.description}
              </p>
            )}

            <div className="flex items-center gap-3 mb-10">
              <Button
                onClick={handleOpenBooking}
                disabled={availableSlots.length === 0}
                className="font-body text-sm uppercase tracking-wider bg-gradient-to-r from-[#d4a843] to-[#b8912e] text-black font-semibold hover:from-[#e0b84d] hover:to-[#d4a843] transition-all duration-300 shadow-lg shadow-[#d4a843]/10 h-12 px-8 rounded-xl"
              >
                Забронировать
              </Button>
              {user && (
                <button
                  onClick={handleToggleFavorite}
                  className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center hover:border-[#d4a843]/20 transition-all duration-300"
                >
                  <Icon
                    name="Heart"
                    size={20}
                    className={isFav ? "text-[#d4a843] fill-[#d4a843]" : "text-white/30"}
                  />
                </button>
              )}
            </div>

            {service.slots && service.slots.length > 0 && (
              <div>
                <h3 className="font-display text-lg font-semibold text-white mb-4">
                  Доступные окошки
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[240px] overflow-y-auto pr-1">
                  {service.slots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`font-body text-xs text-center py-2.5 px-3 rounded-xl border transition-all duration-300 ${
                        slot.is_booked
                          ? "bg-white/[0.01] border-white/[0.04] text-white/15 line-through cursor-not-allowed"
                          : "bg-white/[0.03] border-white/[0.08] text-white/60 hover:border-[#d4a843]/20 hover:text-white/80"
                      }`}
                    >
                      <span className="block font-medium">{slot.slot_date}</span>
                      <span className="text-[10px] text-white/30">{slot.slot_time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {service.related && service.related.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display text-2xl font-semibold text-white mb-8">
              Вам также может <span className="text-[#d4a843]">понравиться</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {service.related.map((rel) => {
                const relPhotos = parsePhotos(rel.photos);
                const relCover = relPhotos[0] || null;
                return (
                  <Link
                    key={rel.id}
                    to={`/service/${rel.id}`}
                    className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl overflow-hidden hover:border-[#d4a843]/15 transition-all duration-500 group"
                  >
                    <div className="aspect-[4/3] bg-white/[0.02] overflow-hidden">
                      {relCover ? (
                        <img
                          src={relCover}
                          alt={rel.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon name="Image" size={32} className="text-white/10" />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-lg font-semibold text-white mb-1">
                        {rel.name}
                      </h3>
                      <span className="font-display text-xl font-semibold text-[#d4a843]">
                        {rel.price} ₽
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#0d0d0d] border-white/[0.08] sm:rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-white">
              Забронировать
            </DialogTitle>
            <DialogDescription className="font-body text-sm text-white/40">
              {service.name} - {service.price} ₽
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBook} className="space-y-4 mt-2">
            <div>
              <label className="font-body text-xs uppercase tracking-wider text-white/40 mb-1.5 block">
                Окошко
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSelectedSlot(slot.id)}
                    className={`font-body text-xs text-center py-2 px-2 rounded-lg border transition-all duration-300 ${
                      selectedSlot === slot.id
                        ? "bg-[#d4a843]/10 border-[#d4a843]/30 text-[#d4a843]"
                        : "bg-white/[0.03] border-white/[0.08] text-white/50 hover:border-white/[0.15]"
                    }`}
                  >
                    {slot.slot_date} {slot.slot_time}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-body text-xs uppercase tracking-wider text-white/40 mb-1.5 block">
                Имя
              </label>
              <Input
                value={bookName}
                onChange={(e) => setBookName(e.target.value)}
                required
                className="bg-white/[0.03] border-white/[0.08] text-white focus-visible:ring-[#d4a843]/50"
              />
            </div>

            <div>
              <label className="font-body text-xs uppercase tracking-wider text-white/40 mb-1.5 block">
                Телефон
              </label>
              <Input
                type="tel"
                placeholder="+7 (999) 123-45-67"
                value={bookPhone}
                onChange={(e) => setBookPhone(e.target.value)}
                required
                className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus-visible:ring-[#d4a843]/50"
              />
            </div>

            <div>
              <label className="font-body text-xs uppercase tracking-wider text-white/40 mb-1.5 block">
                Email
              </label>
              <Input
                type="email"
                value={bookEmail}
                onChange={(e) => setBookEmail(e.target.value)}
                required
                className="bg-white/[0.03] border-white/[0.08] text-white focus-visible:ring-[#d4a843]/50"
              />
            </div>

            <div>
              <label className="font-body text-xs uppercase tracking-wider text-white/40 mb-1.5 block">
                Возраст
              </label>
              <Input
                type="number"
                min="14"
                max="99"
                value={bookAge}
                onChange={(e) => setBookAge(e.target.value)}
                className="bg-white/[0.03] border-white/[0.08] text-white focus-visible:ring-[#d4a843]/50"
              />
            </div>

            <div>
              <label className="font-body text-xs uppercase tracking-wider text-white/40 mb-1.5 block">
                Комментарий
              </label>
              <Textarea
                placeholder="Пожелания к записи..."
                value={bookComment}
                onChange={(e) => setBookComment(e.target.value)}
                className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus-visible:ring-[#d4a843]/50 min-h-[60px]"
              />
            </div>

            <Button
              type="submit"
              disabled={!selectedSlot || booking}
              className="w-full font-body text-sm uppercase tracking-wider bg-gradient-to-r from-[#d4a843] to-[#b8912e] text-black font-semibold hover:from-[#e0b84d] hover:to-[#d4a843] transition-all duration-300 h-11 rounded-xl disabled:opacity-40"
            >
              {booking ? (
                <Icon name="Loader2" size={16} className="animate-spin" />
              ) : (
                "Забронировать"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ServiceDetail;
