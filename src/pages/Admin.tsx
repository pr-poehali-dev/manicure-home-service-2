import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";
import Navbar from "@/components/Navbar";

interface Category {
  id: number;
  name: string;
}

interface Service {
  id: number;
  name: string;
  price: number;
  category_name?: string;
  is_popular?: boolean;
  photos: string;
}

interface Promotion {
  id: number;
  title: string;
  description: string;
  cover_url?: string;
  end_date: string;
}

interface Booking {
  id: number;
  service_name: string;
  slot_date: string;
  slot_time: string;
  name: string;
  phone: string;
  email: string;
  age?: string;
  comment?: string;
  status: string;
}

interface ChatPreview {
  user_id: number;
  name: string;
  email: string;
  last_message: string;
  unread: number;
  created_at: string;
}

interface ChatMessage {
  id: number;
  user_id: number;
  sender_role: string;
  message: string;
  created_at: string;
}

function ServicesTab() {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [sName, setSName] = useState("");
  const [sDesc, setSDesc] = useState("");
  const [sPrice, setSPrice] = useState("");
  const [sCatId, setSCatId] = useState("");
  const [sPhotos, setSPhotos] = useState("");
  const [sPopular, setSPopular] = useState(false);
  const [slots, setSlots] = useState([
    { date: "", time: "" },
    { date: "", time: "" },
    { date: "", time: "" },
    { date: "", time: "" },
  ]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sData, cData] = await Promise.all([api.getServices(), api.getCategories()]);
      setServices(sData.services || []);
      setCategories(cData.categories || []);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateSlot = (idx: number, field: "date" | "time", val: string) => {
    setSlots((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: val } : s)));
  };

  const resetForm = () => {
    setSName("");
    setSDesc("");
    setSPrice("");
    setSCatId("");
    setSPhotos("");
    setSPopular(false);
    setSlots([
      { date: "", time: "" },
      { date: "", time: "" },
      { date: "", time: "" },
      { date: "", time: "" },
    ]);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const photos = sPhotos
        .split(",")
        .map((u) => u.trim())
        .filter(Boolean);
      const validSlots = slots
        .filter((s) => s.date && s.time)
        .map((s) => ({ date: s.date, time: s.time }));
      await api.addService({
        name: sName,
        description: sDesc,
        price: Number(sPrice),
        category_id: Number(sCatId),
        photos,
        is_popular: sPopular,
        slots: validSlots,
      });
      toast({ title: "Услуга добавлена" });
      resetForm();
      setDialogOpen(false);
      fetchData();
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: err instanceof Error ? err.message : "Не удалось добавить",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteService(id);
      toast({ title: "Услуга удалена" });
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: err instanceof Error ? err.message : "Не удалось удалить",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold text-white">Услуги</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="font-body text-xs uppercase tracking-wider bg-gradient-to-r from-[#d4a843] to-[#b8912e] text-black font-semibold hover:from-[#e0b84d] hover:to-[#d4a843] h-9 px-5 rounded-xl">
              <Icon name="Plus" size={14} className="mr-1.5" />
              Добавить
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0d0d0d] border-white/[0.08] sm:rounded-2xl max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-xl text-white">
                Новая услуга
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 mt-2">
              <div>
                <label className="font-body text-xs uppercase tracking-wider text-white/40 mb-1.5 block">Название</label>
                <Input value={sName} onChange={(e) => setSName(e.target.value)} required className="bg-white/[0.03] border-white/[0.08] text-white focus-visible:ring-[#d4a843]/50" />
              </div>
              <div>
                <label className="font-body text-xs uppercase tracking-wider text-white/40 mb-1.5 block">Описание</label>
                <Textarea value={sDesc} onChange={(e) => setSDesc(e.target.value)} className="bg-white/[0.03] border-white/[0.08] text-white focus-visible:ring-[#d4a843]/50 min-h-[60px]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-xs uppercase tracking-wider text-white/40 mb-1.5 block">Цена (₽)</label>
                  <Input type="number" min="0" value={sPrice} onChange={(e) => setSPrice(e.target.value)} required className="bg-white/[0.03] border-white/[0.08] text-white focus-visible:ring-[#d4a843]/50" />
                </div>
                <div>
                  <label className="font-body text-xs uppercase tracking-wider text-white/40 mb-1.5 block">Категория</label>
                  <select
                    value={sCatId}
                    onChange={(e) => setSCatId(e.target.value)}
                    required
                    className="w-full h-10 rounded-md border border-white/[0.08] bg-white/[0.03] px-3 text-sm text-white font-body focus:outline-none focus:ring-2 focus:ring-[#d4a843]/50"
                  >
                    <option value="" className="bg-[#0d0d0d]">Выберите</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#0d0d0d]">{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="font-body text-xs uppercase tracking-wider text-white/40 mb-1.5 block">Фото (URL через запятую)</label>
                <Input value={sPhotos} onChange={(e) => setSPhotos(e.target.value)} placeholder="https://..., https://..." className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus-visible:ring-[#d4a843]/50" />
              </div>
              <div className="flex items-center justify-between py-1">
                <label className="font-body text-xs uppercase tracking-wider text-white/40">Популярная</label>
                <Switch checked={sPopular} onCheckedChange={setSPopular} />
              </div>
              <div>
                <label className="font-body text-xs uppercase tracking-wider text-white/40 mb-2 block">Слоты (до 4)</label>
                <div className="space-y-2">
                  {slots.map((slot, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-2">
                      <Input type="date" value={slot.date} onChange={(e) => updateSlot(idx, "date", e.target.value)} className="bg-white/[0.03] border-white/[0.08] text-white focus-visible:ring-[#d4a843]/50 text-xs" />
                      <Input type="time" value={slot.time} onChange={(e) => updateSlot(idx, "time", e.target.value)} className="bg-white/[0.03] border-white/[0.08] text-white focus-visible:ring-[#d4a843]/50 text-xs" />
                    </div>
                  ))}
                </div>
              </div>
              <Button type="submit" disabled={submitting} className="w-full font-body text-sm uppercase tracking-wider bg-gradient-to-r from-[#d4a843] to-[#b8912e] text-black font-semibold hover:from-[#e0b84d] hover:to-[#d4a843] h-11 rounded-xl">
                {submitting ? <Icon name="Loader2" size={16} className="animate-spin" /> : "Создать услугу"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Icon name="Loader2" size={24} className="text-[#d4a843] animate-spin" />
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-12 text-center">
          <Icon name="Package" size={32} className="text-white/10 mx-auto mb-3" />
          <p className="font-body text-sm text-white/30">Услуг пока нет</p>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((s) => (
            <div key={s.id} className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-xl p-5 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display text-lg font-semibold text-white truncate">{s.name}</h3>
                  {s.is_popular && (
                    <span className="shrink-0 font-body text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#8cc63f]/10 text-[#8cc63f]">Popular</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-body text-sm text-[#d4a843] font-semibold">{s.price} ₽</span>
                  {s.category_name && <span className="font-body text-xs text-white/30">{s.category_name}</span>}
                </div>
              </div>
              <button onClick={() => handleDelete(s.id)} className="shrink-0 w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors duration-300">
                <Icon name="Trash2" size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CategoriesTab() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchCats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getCategories();
      setCategories(data.categories || []);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCats();
  }, [fetchCats]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      await api.addCategory(newName.trim());
      toast({ title: "Категория добавлена" });
      setNewName("");
      fetchCats();
    } catch (err: unknown) {
      toast({ variant: "destructive", title: "Ошибка", description: err instanceof Error ? err.message : "Не удалось добавить" });
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (name === "Все товары") {
      toast({ variant: "destructive", title: "Нельзя удалить категорию по умолчанию" });
      return;
    }
    try {
      await api.deleteCategory(id);
      toast({ title: "Категория удалена" });
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err: unknown) {
      toast({ variant: "destructive", title: "Ошибка", description: err instanceof Error ? err.message : "Не удалось удалить" });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-semibold text-white">Категории</h2>

      <form onSubmit={handleAdd} className="flex items-center gap-3">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Название категории"
          className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus-visible:ring-[#d4a843]/50 max-w-xs"
        />
        <Button type="submit" disabled={adding} className="font-body text-xs uppercase tracking-wider bg-gradient-to-r from-[#d4a843] to-[#b8912e] text-black font-semibold hover:from-[#e0b84d] hover:to-[#d4a843] h-10 px-5 rounded-xl">
          {adding ? <Icon name="Loader2" size={14} className="animate-spin" /> : "Добавить"}
        </Button>
      </form>

      {loading ? (
        <div className="flex justify-center py-12">
          <Icon name="Loader2" size={24} className="text-[#d4a843] animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-12 text-center">
          <Icon name="FolderOpen" size={32} className="text-white/10 mx-auto mb-3" />
          <p className="font-body text-sm text-white/30">Категорий нет</p>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((c) => (
            <div key={c.id} className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-xl p-4 flex items-center justify-between">
              <span className="font-body text-sm text-white">{c.name}</span>
              <button
                onClick={() => handleDelete(c.id, c.name)}
                disabled={c.name === "Все товары"}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                  c.name === "Все товары"
                    ? "bg-white/[0.02] text-white/10 cursor-not-allowed"
                    : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                }`}
              >
                <Icon name="Trash2" size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PromotionsTab() {
  const { toast } = useToast();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [pTitle, setPTitle] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pCover, setPCover] = useState("");
  const [pEnd, setPEnd] = useState("");

  const fetchPromos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getPromotions();
      setPromotions(data.promotions || []);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.addPromotion({
        title: pTitle,
        description: pDesc,
        cover_url: pCover,
        end_date: pEnd,
      });
      toast({ title: "Акция добавлена" });
      setPTitle("");
      setPDesc("");
      setPCover("");
      setPEnd("");
      setDialogOpen(false);
      fetchPromos();
    } catch (err: unknown) {
      toast({ variant: "destructive", title: "Ошибка", description: err instanceof Error ? err.message : "Не удалось добавить" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deletePromotion(id);
      toast({ title: "Акция удалена" });
      setPromotions((prev) => prev.filter((p) => p.id !== id));
    } catch (err: unknown) {
      toast({ variant: "destructive", title: "Ошибка", description: err instanceof Error ? err.message : "Не удалось удалить" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold text-white">Акции</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="font-body text-xs uppercase tracking-wider bg-gradient-to-r from-[#d4a843] to-[#b8912e] text-black font-semibold hover:from-[#e0b84d] hover:to-[#d4a843] h-9 px-5 rounded-xl">
              <Icon name="Plus" size={14} className="mr-1.5" />
              Добавить
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0d0d0d] border-white/[0.08] sm:rounded-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-xl text-white">Новая акция</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 mt-2">
              <div>
                <label className="font-body text-xs uppercase tracking-wider text-white/40 mb-1.5 block">Название</label>
                <Input value={pTitle} onChange={(e) => setPTitle(e.target.value)} required className="bg-white/[0.03] border-white/[0.08] text-white focus-visible:ring-[#d4a843]/50" />
              </div>
              <div>
                <label className="font-body text-xs uppercase tracking-wider text-white/40 mb-1.5 block">Описание</label>
                <Textarea value={pDesc} onChange={(e) => setPDesc(e.target.value)} className="bg-white/[0.03] border-white/[0.08] text-white focus-visible:ring-[#d4a843]/50 min-h-[60px]" />
              </div>
              <div>
                <label className="font-body text-xs uppercase tracking-wider text-white/40 mb-1.5 block">Обложка (URL)</label>
                <Input value={pCover} onChange={(e) => setPCover(e.target.value)} placeholder="https://..." className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus-visible:ring-[#d4a843]/50" />
              </div>
              <div>
                <label className="font-body text-xs uppercase tracking-wider text-white/40 mb-1.5 block">Дата окончания</label>
                <Input type="date" value={pEnd} onChange={(e) => setPEnd(e.target.value)} required className="bg-white/[0.03] border-white/[0.08] text-white focus-visible:ring-[#d4a843]/50" />
              </div>
              <Button type="submit" disabled={submitting} className="w-full font-body text-sm uppercase tracking-wider bg-gradient-to-r from-[#d4a843] to-[#b8912e] text-black font-semibold hover:from-[#e0b84d] hover:to-[#d4a843] h-11 rounded-xl">
                {submitting ? <Icon name="Loader2" size={16} className="animate-spin" /> : "Создать акцию"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Icon name="Loader2" size={24} className="text-[#d4a843] animate-spin" />
        </div>
      ) : promotions.length === 0 ? (
        <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-12 text-center">
          <Icon name="Sparkles" size={32} className="text-white/10 mx-auto mb-3" />
          <p className="font-body text-sm text-white/30">Акций нет</p>
        </div>
      ) : (
        <div className="space-y-3">
          {promotions.map((p) => (
            <div key={p.id} className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-xl p-5 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-lg font-semibold text-white truncate">{p.title}</h3>
                <p className="font-body text-xs text-white/30 truncate">{p.description}</p>
                <span className="font-body text-[10px] text-[#d4a843]/60 mt-1 block">
                  до {new Date(p.end_date).toLocaleDateString("ru-RU")}
                </span>
              </div>
              <button onClick={() => handleDelete(p.id)} className="shrink-0 w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors duration-300">
                <Icon name="Trash2" size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BookingsTab() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getBookings()
      .then((data) => setBookings(data.bookings || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusLabel = (status: string) => {
    if (status === "confirmed") return { text: "Подтв.", cls: "bg-[#8cc63f]/10 text-[#8cc63f]" };
    if (status === "cancelled") return { text: "Отмена", cls: "bg-red-500/10 text-red-400" };
    return { text: "Ожидание", cls: "bg-[#d4a843]/10 text-[#d4a843]" };
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-semibold text-white">Бронирования</h2>

      {loading ? (
        <div className="flex justify-center py-12">
          <Icon name="Loader2" size={24} className="text-[#d4a843] animate-spin" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-12 text-center">
          <Icon name="Calendar" size={32} className="text-white/10 mx-auto mb-3" />
          <p className="font-body text-sm text-white/30">Бронирований нет</p>
        </div>
      ) : (
        <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#d4a843]/10">
                  <th className="font-body text-[10px] uppercase tracking-wider text-[#d4a843]/60 px-5 py-3">Услуга</th>
                  <th className="font-body text-[10px] uppercase tracking-wider text-[#d4a843]/60 px-5 py-3">Дата/Время</th>
                  <th className="font-body text-[10px] uppercase tracking-wider text-[#d4a843]/60 px-5 py-3">Клиент</th>
                  <th className="font-body text-[10px] uppercase tracking-wider text-[#d4a843]/60 px-5 py-3">Контакты</th>
                  <th className="font-body text-[10px] uppercase tracking-wider text-[#d4a843]/60 px-5 py-3">Возраст</th>
                  <th className="font-body text-[10px] uppercase tracking-wider text-[#d4a843]/60 px-5 py-3">Комментарий</th>
                  <th className="font-body text-[10px] uppercase tracking-wider text-[#d4a843]/60 px-5 py-3">Статус</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const st = statusLabel(b.status);
                  return (
                    <tr key={b.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="font-body text-sm text-white px-5 py-3.5">{b.service_name}</td>
                      <td className="font-body text-xs text-white/50 px-5 py-3.5 whitespace-nowrap">{b.slot_date} {b.slot_time}</td>
                      <td className="font-body text-sm text-white px-5 py-3.5">{b.name}</td>
                      <td className="px-5 py-3.5">
                        <div className="font-body text-xs text-white/50">{b.phone}</div>
                        <div className="font-body text-xs text-white/30">{b.email}</div>
                      </td>
                      <td className="font-body text-xs text-white/40 px-5 py-3.5">{b.age || "—"}</td>
                      <td className="font-body text-xs text-white/40 px-5 py-3.5 max-w-[200px] truncate">{b.comment || "—"}</td>
                      <td className="px-5 py-3.5">
                        <span className={`font-body text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full ${st.cls}`}>{st.text}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ChatsTab() {
  const { toast } = useToast();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeUserId, setActiveUserId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    api.getChats()
      .then((data) => setChats(data.chats || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fetchMessages = useCallback(async (userId: number) => {
    try {
      const data = await api.getChatMessages(userId);
      setMessages(data.messages || []);
    } catch {
      /* silent */
    }
  }, []);

  const openChat = (userId: number) => {
    setActiveUserId(userId);
    setMessages([]);
    setMsgLoading(true);
    fetchMessages(userId).finally(() => setMsgLoading(false));

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => fetchMessages(userId), 5000);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeUserId || sending) return;
    setSending(true);
    try {
      await api.sendMessage({ message: input.trim(), user_id: activeUserId });
      setInput("");
      await fetchMessages(activeUserId);
    } catch (err: unknown) {
      toast({ variant: "destructive", title: "Ошибка", description: err instanceof Error ? err.message : "Не отправлено" });
    } finally {
      setSending(false);
    }
  };

  const backToList = () => {
    setActiveUserId(null);
    setMessages([]);
    if (intervalRef.current) clearInterval(intervalRef.current);
    api.getChats()
      .then((data) => setChats(data.chats || []))
      .catch(() => {});
  };

  const activeChat = chats.find((c) => c.user_id === activeUserId);

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-semibold text-white">Чат поддержки</h2>

      {loading ? (
        <div className="flex justify-center py-12">
          <Icon name="Loader2" size={24} className="text-[#d4a843] animate-spin" />
        </div>
      ) : activeUserId === null ? (
        chats.length === 0 ? (
          <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-12 text-center">
            <Icon name="MessageCircle" size={32} className="text-white/10 mx-auto mb-3" />
            <p className="font-body text-sm text-white/30">Нет активных чатов</p>
          </div>
        ) : (
          <div className="space-y-2">
            {chats.map((chat) => (
              <button
                key={chat.user_id}
                onClick={() => openChat(chat.user_id)}
                className="w-full bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-xl p-4 flex items-center gap-4 hover:border-[#d4a843]/15 transition-all duration-300 text-left"
              >
                <div className="w-10 h-10 rounded-full bg-[#d4a843]/10 flex items-center justify-center shrink-0">
                  <Icon name="User" size={18} className="text-[#d4a843]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-body text-sm text-white font-medium truncate">{chat.name}</span>
                    <span className="font-body text-[10px] text-white/20">{chat.email}</span>
                  </div>
                  <p className="font-body text-xs text-white/30 truncate">{chat.last_message}</p>
                </div>
                {chat.unread > 0 && (
                  <span className="shrink-0 w-5 h-5 rounded-full bg-[#8cc63f] flex items-center justify-center font-body text-[10px] text-black font-bold">
                    {chat.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        )
      ) : (
        <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl flex flex-col overflow-hidden min-h-[400px] max-h-[60vh]">
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.06]">
            <button onClick={backToList} className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors">
              <Icon name="ArrowLeft" size={16} />
            </button>
            <div className="min-w-0 flex-1">
              <span className="font-body text-sm text-white font-medium">{activeChat?.name || "Пользователь"}</span>
              <span className="font-body text-[10px] text-white/30 ml-2">{activeChat?.email}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {msgLoading ? (
              <div className="flex justify-center py-8">
                <Icon name="Loader2" size={20} className="text-[#d4a843] animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="font-body text-xs text-white/20">Нет сообщений</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isAdmin = msg.sender_role === "admin";
                return (
                  <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      isAdmin
                        ? "bg-[#d4a843]/10 border border-[#d4a843]/15 text-white"
                        : "bg-[#8cc63f]/10 border border-[#8cc63f]/15 text-white"
                    }`}>
                      <p className="font-body text-sm leading-relaxed">{msg.message}</p>
                      <p className={`font-body text-[10px] mt-1 ${isAdmin ? "text-[#d4a843]/40 text-right" : "text-[#8cc63f]/40"}`}>
                        {new Date(msg.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
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
                placeholder="Ответить..."
                className="flex-1 font-body text-sm bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#d4a843]/50 transition-all"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#d4a843] to-[#b8912e] flex items-center justify-center text-black hover:from-[#e0b84d] hover:to-[#d4a843] transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {sending ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Send" size={14} />}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Admin() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      navigate("/");
    }
  }, [authLoading, user, navigate]);

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

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-32 animate-fade-in">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-11 h-11 rounded-xl bg-[#d4a843]/10 flex items-center justify-center">
            <Icon name="Shield" size={22} className="text-[#d4a843]" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-white">
              Админ-панель
            </h1>
            <p className="font-body text-xs text-white/30">maninov management</p>
          </div>
        </div>

        <Tabs defaultValue="services" className="w-full">
          <TabsList className="w-full bg-white/[0.03] border border-white/[0.06] mb-8 flex-wrap h-auto gap-0">
            <TabsTrigger value="services" className="flex-1 font-body text-[10px] sm:text-xs uppercase tracking-wider py-2.5 data-[state=active]:bg-[#d4a843]/10 data-[state=active]:text-[#d4a843]">
              Услуги
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex-1 font-body text-[10px] sm:text-xs uppercase tracking-wider py-2.5 data-[state=active]:bg-[#d4a843]/10 data-[state=active]:text-[#d4a843]">
              Категории
            </TabsTrigger>
            <TabsTrigger value="promotions" className="flex-1 font-body text-[10px] sm:text-xs uppercase tracking-wider py-2.5 data-[state=active]:bg-[#d4a843]/10 data-[state=active]:text-[#d4a843]">
              Акции
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex-1 font-body text-[10px] sm:text-xs uppercase tracking-wider py-2.5 data-[state=active]:bg-[#d4a843]/10 data-[state=active]:text-[#d4a843]">
              Брони
            </TabsTrigger>
            <TabsTrigger value="chats" className="flex-1 font-body text-[10px] sm:text-xs uppercase tracking-wider py-2.5 data-[state=active]:bg-[#d4a843]/10 data-[state=active]:text-[#d4a843]">
              Чат
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services"><ServicesTab /></TabsContent>
          <TabsContent value="categories"><CategoriesTab /></TabsContent>
          <TabsContent value="promotions"><PromotionsTab /></TabsContent>
          <TabsContent value="bookings"><BookingsTab /></TabsContent>
          <TabsContent value="chats"><ChatsTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default Admin;
