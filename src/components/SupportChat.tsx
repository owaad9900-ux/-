import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, User, HeadsetIcon, ShieldAlert } from "lucide-react";
import { SupportMessage } from "../types";

export default function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<SupportMessage[]>([
    {
      id: "msg_init",
      sender: "support",
      text: "أهلاً بك في الدعم الفني المباشر لمنصة زفافي! كيف يمكننا مساعدتك اليوم في تجهيز دعوتك الرقمية الفاخرة؟ 😊",
      timestamp: new Date().toTimeString().substring(0, 5)
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: SupportMessage = {
      id: "msg_" + Math.random().toString(36).substring(2, 9),
      sender: "user",
      text: inputText,
      timestamp: new Date().toTimeString().substring(0, 5)
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentQuery = inputText;
    setInputText("");
    setIsTyping(true);

    // Simulate direct support responder
    setTimeout(() => {
      let replyText = "شكرًا لتواصلك معنا! سنقوم بمراجعة استفسارك والرد عليك في أقرب وقت. فريق دعم زفافي دائمًا في خدمتك.";

      const queryLower = currentQuery.toLowerCase();
      if (queryLower.includes("موسيقى") || queryLower.includes("أغنية") || queryLower.includes("صوت") || queryLower.includes("صوتية")) {
        replyText = "نعم بكل تأكيد! يمكنك إضافة مقاطع صوتية مخصصة أو رفع ملفات الموسيقى الخاصة بك عبر وضع الرابط الخاص بها في حقل 'رابط الموسيقى المخصصة' أسفل القالب مباشرة.";
      } else if (queryLower.includes("سعر") || queryLower.includes("باقة") || queryLower.includes("اشتراك") || queryLower.includes("مجاني") || queryLower.includes("دفع")) {
        replyText = "نوفر باقة مجانية لتجربة قوالبنا الأساسية مع حد أقصى 20 ضيفًا، وباقات بريميوم مدفوعة تبدأ من 15$ توفر ميزات غير محدودة، ومولد الذكاء الاصطناعي الذكي، وتصدير التقارير وجدولة رسائل تذكير واتساب الآلية.";
      } else if (queryLower.includes("تعديل") || queryLower.includes("تغيير") || queryLower.includes("اسم") || queryLower.includes("تاريخ") || queryLower.includes("يوم")) {
        replyText = "بالتأكيد، يمكنك تعديل كافة البيانات الشخصية والأسماء وتفاصيل الحفل في أي وقت تريد من لوحة التحكم، وستتحدث الدعوة تلقائياً لدى جميع ضيوفك فور الحفظ.";
      } else if (queryLower.includes("واتساب") || queryLower.includes("مشاركة") || queryLower.includes("ارسال") || queryLower.includes("رابط")) {
        replyText = "بمجرد حفظ دعوتك، ستحصل على رابط فريد خاص بك. يمكنك مشاركته بنقرة واحدة مباشرة عبر واتساب أو شبكات التواصل. كما تتيح لك لوحة التحكم جدولة تذكيرات تلقائية للضيوف ترسل تلقائياً بموعد الحفل.";
      } else if (queryLower.includes("خريطة") || queryLower.includes("موقع") || queryLower.includes("خرائط") || queryLower.includes("قاعة")) {
        replyText = "نعم، تدعم منصتنا تحديد موقع حفلكم بدقة عبر خرائط جوجل، حيث يظهر للضيوف زر تكتيكي لفتح خرائط جوجل مباشرة في هواتفهم للوصول السهل والسريع لقاعة الحفل.";
      } else if (queryLower.includes("ذكاء") || queryLower.includes("اصطناعي") || queryLower.includes("توليد") || queryLower.includes("ai")) {
        replyText = "ميزة توليد الدعوات بالذكاء الاصطناعي هي من أقوى ميزاتنا! تتيح لك كتابة الأسماء واختيار النمط، وسيتكفل مولدنا الذكي بصياغة أبهى العبارات الشعرية واقتراح لوحة ألوان دافئة وفخمة تلقائياً.";
      }

      const supportMsg: SupportMessage = {
        id: "msg_" + Math.random().toString(36).substring(2, 9),
        sender: "support",
        text: replyText,
        timestamp: new Date().toTimeString().substring(0, 5)
      };

      setMessages((prev) => [...prev, supportMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans">
      
      {/* Floating Messenger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="p-4 bg-amber-500 text-white rounded-full shadow-2xl hover:bg-amber-600 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer border border-white/20"
          id="live-chat-toggle"
        >
          <span className="text-xs font-bold hidden sm:inline-block pl-1">الدعم المباشر</span>
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-80 sm:w-96 overflow-hidden flex flex-col h-[450px] transition-all text-right">
          
          {/* Header */}
          <div className="bg-gradient-to-l from-amber-500 to-amber-600 p-4 text-white flex justify-between items-center">
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white hover:bg-white/15 p-1 rounded-lg transition-all"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2">
              <div>
                <h4 className="text-sm font-bold">دعم زفافي الفني المباشر</h4>
                <p className="text-[10px] text-amber-100 flex items-center gap-1 justify-end">
                  <span>نشط الآن للرد على استفساراتكم</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                </p>
              </div>
              <div className="p-2 bg-white/10 rounded-full text-white">
                <HeadsetIcon className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50/50 space-y-3">
            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div key={msg.id} className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                  
                  {/* Avatar */}
                  <div className={`p-1.5 rounded-full text-xs shrink-0 ${isUser ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-800"}`}>
                    {isUser ? <User className="h-3 w-3" /> : <HeadsetIcon className="h-3 w-3" />}
                  </div>

                  {/* Message content */}
                  <div className="max-w-[75%]">
                    <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      isUser 
                        ? "bg-amber-500 text-white rounded-tr-none" 
                        : "bg-white border border-gray-100 text-gray-800 rounded-tl-none"
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-gray-400 mt-1 block px-1">{msg.timestamp}</span>
                  </div>

                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-full bg-gray-100 text-gray-800">
                  <HeadsetIcon className="h-3 w-3" />
                </div>
                <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none text-xs text-gray-500 flex items-center gap-1">
                  <span>جاري كتابة الرد</span>
                  <span className="flex gap-0.5">
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 bg-white flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="اكتب رسالتك أو استفسارك هنا..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 text-right bg-white"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              <Send className="h-4 w-4 transform rotate-180" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
