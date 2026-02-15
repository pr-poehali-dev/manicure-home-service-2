import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
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
  photos: string;
  category_id: number;
  category_name?: string;
}

const sortOptions = [
  { key: "new", label: "Новые" },
  { key: "popular", label: "Популярные" },
  { key: "cheap", label: "Дешёвые" },
  { key: "expensive", label: "Дорогие" },
];

function parsePhotos(photos: string): string[] {
  try {
    const parsed = JSON.parse(photos);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function Prices() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [activeSort, setActiveSort] = useState("new");
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    api.getCategories()
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      api.getFavorites()
        .then((data) => {
          const ids = (data.favorites || []).map((f: { service_id: number }) => f.service_id);
          setFavoriteIds(new Set(ids));
        })
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = { sort: activeSort };
    if (activeCategory) params.category_id = String(activeCategory);
    api.getServices(params)
      .then((data) => setServices(data.services || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeCategory, activeSort]);

  const handleToggleFavorite = async (serviceId: number) => {
    if (!user) return;
    try {
      const data = await api.toggleFavorite(serviceId);
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (data.favorited) {
          next.add(serviceId);
        } else {
          next.delete(serviceId);
        }
        return next;
      });
    } catch {
      /* silent */
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-32 animate-fade-in">
        <div className="text-center mb-12">
          <span className="font-body text-xs uppercase tracking-[0.3em] text-[#d4a843]/60 mb-4 block">
            Каталог
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold text-white">
            Услуги и <span className="text-[#d4a843]">цены</span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button
            onClick={() => setActiveCategory(null)}
            className={`font-body text-xs uppercase tracking-wider px-4 py-2 rounded-full border transition-all duration-300 ${
              activeCategory === null
                ? "bg-[#d4a843]/10 border-[#d4a843]/30 text-[#d4a843]"
                : "bg-white/[0.02] border-white/[0.06] text-white/40 hover:text-white/60 hover:border-white/[0.12]"
            }`}
          >
            Все услуги
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`font-body text-xs uppercase tracking-wider px-4 py-2 rounded-full border transition-all duration-300 ${
                activeCategory === cat.id
                  ? "bg-[#d4a843]/10 border-[#d4a843]/30 text-[#d4a843]"
                  : "bg-white/[0.02] border-white/[0.06] text-white/40 hover:text-white/60 hover:border-white/[0.12]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-10">
          {sortOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setActiveSort(opt.key)}
              className={`font-body text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all duration-300 ${
                activeSort === opt.key
                  ? "bg-[#8cc63f]/10 border-[#8cc63f]/30 text-[#8cc63f]"
                  : "bg-white/[0.02] border-white/[0.06] text-white/30 hover:text-white/50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Icon name="Loader2" size={32} className="text-[#d4a843] animate-spin" />
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-16 text-center">
            <Icon name="Package" size={40} className="text-white/10 mx-auto mb-4" />
            <p className="font-body text-sm text-white/30">Услуги не найдены</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const photos = parsePhotos(service.photos);
              const cover = photos[0] || null;
              const isFav = favoriteIds.has(service.id);

              return (
                <div
                  key={service.id}
                  className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl overflow-hidden hover:border-[#d4a843]/15 transition-all duration-500 group"
                >
                  <div className="relative aspect-[4/3] bg-white/[0.02] overflow-hidden">
                    {cover ? (
                      <img
                        src={cover}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon name="Image" size={40} className="text-white/10" />
                      </div>
                    )}
                    {user && (
                      <button
                        onClick={() => handleToggleFavorite(service.id)}
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-black/70"
                      >
                        <Icon
                          name="Heart"
                          size={16}
                          className={isFav ? "text-[#d4a843] fill-[#d4a843]" : "text-white/50"}
                        />
                      </button>
                    )}
                  </div>

                  <div className="p-6">
                    {service.category_name && (
                      <span className="font-body text-[10px] uppercase tracking-wider text-[#8cc63f]/70 mb-2 block">
                        {service.category_name}
                      </span>
                    )}
                    <h3 className="font-display text-xl font-semibold text-white mb-3 leading-tight">
                      {service.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="font-display text-2xl font-semibold text-[#d4a843]">
                        {service.price} ₽
                      </span>
                      <Button asChild variant="ghost" className="font-body text-xs uppercase tracking-wider text-white/50 hover:text-[#d4a843] hover:bg-[#d4a843]/5 px-4">
                        <Link to={`/service/${service.id}`}>
                          Подробнее
                        </Link>
                      </Button>
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

export default Prices;
