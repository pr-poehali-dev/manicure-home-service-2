import Icon from "@/components/ui/icon";
import Navbar from "@/components/Navbar";

const reviews = [
  {
    name: "Анна К.",
    rating: 5,
    text: "Лучший маникюр, который мне делали! Даша невероятно аккуратная, покрытие держится три недели без единого скола. Очень уютная обстановка, рекомендую всем!",
    service: "Маникюр",
  },
  {
    name: "Мария С.",
    rating: 5,
    text: "Делала педикюр у Даши впервые и осталась в восторге. Всё чисто, стерильно, красиво. Ножки выглядят идеально, обязательно вернусь снова!",
    service: "Педикюр",
  },
  {
    name: "Елена В.",
    rating: 5,
    text: "Нарастила реснички и просто влюбилась в результат! Очень естественно и при этом выразительно. Даша подобрала идеальный изгиб и длину под мою форму глаз.",
    service: "Ресницы",
  },
  {
    name: "Ольга Т.",
    rating: 4,
    text: "Хожу к Даше на маникюр уже полгода. Всегда приятная атмосфера, вкусный чай и отличный результат. Дизайны делает любой сложности, фантазия у неё огромная!",
    service: "Маникюр",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon
          key={i}
          name="Star"
          size={14}
          className={i < count ? "text-[#d4a843] fill-[#d4a843]" : "text-white/10"}
        />
      ))}
    </div>
  );
}

function Reviews() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-32 animate-fade-in">
        <div className="text-center mb-16">
          <span className="font-body text-xs uppercase tracking-[0.3em] text-[#d4a843]/60 mb-4 block">
            Что говорят клиенты
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold text-white">
            <span className="text-[#d4a843]">Отзывы</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-8 hover:border-[#d4a843]/15 transition-all duration-500"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display text-lg font-semibold text-white">{review.name}</h3>
                  <span className="font-body text-xs uppercase tracking-wider text-[#8cc63f]/70">
                    {review.service}
                  </span>
                </div>
                <Stars count={review.rating} />
              </div>
              <p className="font-body text-sm text-white/40 leading-relaxed">{review.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Reviews;
