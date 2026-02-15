import Icon from "@/components/ui/icon";
import Navbar from "@/components/Navbar";

function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-32 animate-fade-in">
        <div className="text-center mb-16">
          <span className="font-body text-xs uppercase tracking-[0.3em] text-[#d4a843]/60 mb-4 block">
            О мастере
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold text-white">
            Обо <span className="text-[#d4a843]">мне</span>
          </h1>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-8 sm:p-12 mb-12">
          <p className="font-body text-base sm:text-lg text-white/60 leading-relaxed">
            Привет! Я Даша, а это мой онлайн сайт, здесь ты можешь записаться на мой маникюр,
            реснички, или Педикюр! Достаточно просто забронировать окошко, но! Если ты что то не
            понимаешь, я на связи и проконсултирую по любому вопросу!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-8">
            <div className="w-10 h-10 rounded-xl bg-[#d4a843]/10 flex items-center justify-center mb-5">
              <Icon name="MapPin" size={20} className="text-[#d4a843]" />
            </div>
            <h3 className="font-display text-xl font-semibold text-white mb-2">Адрес</h3>
            <p className="font-body text-sm text-white/40 leading-relaxed">
              Москва, ул. Салтыковская, д. 15
            </p>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-8">
            <div className="w-10 h-10 rounded-xl bg-[#8cc63f]/10 flex items-center justify-center mb-5">
              <Icon name="TrainFront" size={20} className="text-[#8cc63f]" />
            </div>
            <h3 className="font-display text-xl font-semibold text-white mb-2">Метро</h3>
            <p className="font-body text-sm text-white/40 leading-relaxed">
              м. Новокосино
            </p>
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-8 text-center">
          <h3 className="font-display text-2xl font-semibold text-white mb-4">Связаться со мной</h3>
          <p className="font-body text-sm text-white/40 mb-6">
            Напиши мне в Telegram и я отвечу на все вопросы
          </p>
          <a
            href="https://telegram.me/maninovru"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-body text-sm uppercase tracking-wider px-8 py-3.5 rounded-full bg-gradient-to-r from-[#d4a843] to-[#b8912e] text-black font-semibold hover:from-[#e0b84d] hover:to-[#d4a843] transition-all duration-300 shadow-lg shadow-[#d4a843]/20"
          >
            <Icon name="Send" size={16} />
            Telegram
          </a>
        </div>
      </div>
    </div>
  );
}

export default About;
