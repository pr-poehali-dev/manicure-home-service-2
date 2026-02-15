import Navbar from "@/components/Navbar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "Мне не понравилась, что делать?",
    answer:
      "Обсудим это с тобой спокойно если что то не понравилось! Говори сразу мне!",
  },
  {
    question: "За сколько ты делаешь работу?",
    answer: "Обычно 30 минут, но может час.",
  },
  {
    question:
      "Я забронировала, а подъезд этаж и квартиру не знаю. Что делать?",
    answer:
      "Не переживай и напиши в поддержку! Так и должно быть.",
  },
];

function FAQ() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-32 animate-fade-in">
        <div className="text-center mb-16">
          <span className="font-body text-xs uppercase tracking-[0.3em] text-[#d4a843]/60 mb-4 block">
            Вопросы
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold text-white">
            Частые <span className="text-[#d4a843]">вопросы</span>
          </h1>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 sm:p-8">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-white/[0.06]"
              >
                <AccordionTrigger className="font-body text-sm sm:text-base text-white/80 hover:text-[#d4a843] hover:no-underline py-5 text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="font-body text-sm text-white/40 leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}

export default FAQ;
