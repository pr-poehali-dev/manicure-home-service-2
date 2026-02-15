import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Navbar from "@/components/Navbar";

const features = [
  {
    icon: "Gem",
    title: "Качество",
    description: "Только премиальные материалы и стерильные инструменты для безупречного результата",
  },
  {
    icon: "Home",
    title: "Уют",
    description: "Домашняя атмосфера, где можно расслабиться и насладиться процедурой",
  },
  {
    icon: "Award",
    title: "Опыт",
    description: "Профессиональный подход и внимание к каждой детали вашего образа",
  },
];

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#d4a843]/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#d4a843]/[0.03] rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 relative">
          <div className="flex flex-col items-center text-center animate-fade-in">
            <img
              src="https://cdn.poehali.dev/files/23115997-b321-4378-aa18-a759fa359f16.png"
              alt="maninov"
              className="w-24 h-24 object-contain mb-8 opacity-90"
            />

            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-semibold text-white leading-tight mb-6">
              Красота начинается
              <span className="block text-[#d4a843]">здесь</span>
            </h1>

            <p className="font-body text-lg sm:text-xl text-white/50 max-w-2xl mb-4 leading-relaxed">
              Маникюр, педикюр и наращивание ресниц в уютной домашней обстановке
            </p>

            <div className="flex items-center gap-2 text-white/30 font-body text-sm mb-10">
              <Icon name="MapPin" size={16} className="text-[#d4a843]/60" />
              <span>Москва, ул. Салтыковская, д. 15, м. Новокосино</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link
                to="/prices"
                className="font-body text-sm uppercase tracking-wider px-8 py-3.5 rounded-full bg-gradient-to-r from-[#d4a843] to-[#b8912e] text-black font-semibold hover:from-[#e0b84d] hover:to-[#d4a843] transition-all duration-300 shadow-lg shadow-[#d4a843]/20"
              >
                Записаться
              </Link>
              <a
                href="https://telegram.me/maninovru"
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-sm text-white/50 hover:text-[#8cc63f] transition-colors duration-300 flex items-center gap-2"
              >
                <Icon name="Send" size={16} />
                Telegram
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-8 hover:border-[#d4a843]/20 transition-all duration-500 group animate-fade-in"
            >
              <div className="w-12 h-12 rounded-xl bg-[#d4a843]/10 flex items-center justify-center mb-6 group-hover:bg-[#d4a843]/15 transition-colors duration-500">
                <Icon name={feature.icon} size={22} className="text-[#d4a843]" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="font-body text-sm text-white/40 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <img
                src="https://cdn.poehali.dev/files/23115997-b321-4378-aa18-a759fa359f16.png"
                alt="maninov"
                className="w-8 h-8 object-contain opacity-60"
              />
              <span className="font-display text-xl text-[#d4a843]/60">maninov</span>
            </div>

            <div className="flex items-center gap-6">
              <a
                href="https://telegram.me/maninovru"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-[#8cc63f] hover:border-[#8cc63f]/30 transition-all duration-300"
              >
                <Icon name="Send" size={18} />
              </a>
              <a
                href="https://telegram.me/maninovru"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-[#d4a843] hover:border-[#d4a843]/30 transition-all duration-300"
              >
                <Icon name="MessageCircle" size={18} />
              </a>
            </div>

            <p className="font-body text-xs text-white/20 tracking-wide">
              &copy; 2026 maninov. Все права защищены.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
