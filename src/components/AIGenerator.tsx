import React, { useState } from "react";
import { Sparkles, ArrowRight, Settings, FileText, Music, Check, Wand2 } from "lucide-react";
import { Invitation } from "../types";

interface AIGeneratorProps {
  onGenerationComplete: (invitation: Omit<Invitation, "id" | "createdAt" | "rsvpList">) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function AIGenerator({ onGenerationComplete, isLoading, setIsLoading }: AIGeneratorProps) {
  const [type, setType] = useState<"wedding" | "baby">("wedding");
  const [style, setStyle] = useState("royal");
  const [names, setNames] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [locationName, setLocationName] = useState("");
  const [tone, setTone] = useState("poetic");
  const [extraInfo, setExtraInfo] = useState("");
  const [generatedPreview, setGeneratedPreview] = useState<any | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!names) return;

    setIsLoading(true);
    setGeneratedPreview(null);

    try {
      const response = await fetch("/api/generate-invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          style,
          names,
          date,
          location: locationName,
          tone,
          extraInfo,
        }),
      });

      const data = await response.json();
      setGeneratedPreview(data);
    } catch (err) {
      console.error("AI Generation Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdoptDesign = () => {
    if (!generatedPreview) return;

    onGenerationComplete({
      type,
      style: style,
      title: generatedPreview.title || "دعوة مناسبة خاصة",
      names: names,
      date: date || "2026-10-01",
      time: time || "20:00",
      locationName: locationName || "القاعة الكبرى",
      locationCoordinates: { lat: 24.7136, lng: 46.6753 },
      locationUrl: `https://maps.google.com/?q=${locationName || "الرياض"}`,
      openingQuote: generatedPreview.openingQuote || "",
      bodyText: generatedPreview.bodyText || "",
      closingQuote: generatedPreview.closingQuote || "",
      colors: generatedPreview.colors || {
        background: "#ffffff",
        primary: "#d4af37",
        secondary: "#111111",
        text: "#000000",
        accent: "#d4af37",
      },
      fontStyle: generatedPreview.fontStyle || "serif",
      musicTheme: generatedPreview.musicTheme || "royal-instrumental",
      particlesEffect: generatedPreview.particlesEffect || "gold-dust",
      status: "active",
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-[#EAE2D5] p-6 md:p-8 shadow-sm text-right">
      <div className="flex items-center gap-3 justify-end mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-serif font-bold text-[#1A1A1A]">مصمم الدعوات الذكي (AI)</h2>
          <p className="text-xs text-[#888] font-serif italic">قم بإنشاء نصوص وتصاميم دعوات عصرية متكاملة بضغطة زر واحدة</p>
        </div>
        <div className="p-3 bg-[#F9F7F5] text-[#C5A059] border border-[#EAE2D5] rounded-xl shadow-sm">
          <Sparkles className="h-6 w-6" />
        </div>
      </div>

      {!generatedPreview ? (
        <form onSubmit={handleGenerate} className="space-y-6">
          {/* Step 1: Event Type */}
          <div>
            <label className="block text-xs font-serif font-bold text-[#666] mb-2 uppercase tracking-wide">نوع المناسبة السعيدة</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setType("wedding")}
                className={`py-4 rounded-lg border font-bold text-base transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                  type === "wedding"
                    ? "border-[#C5A059] bg-[#F9F7F5] text-[#C5A059]"
                    : "border-[#EAE2D5] hover:border-[#C5A059] text-[#666]"
                }`}
              >
                <span className="text-2xl">💍</span>
                <span className="text-sm">حفل زفاف خطوبة / قران</span>
              </button>

              <button
                type="button"
                onClick={() => setType("baby")}
                className={`py-4 rounded-lg border font-bold text-base transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                  type === "baby"
                    ? "border-[#C5A059] bg-[#F9F7F5] text-[#C5A059]"
                    : "border-[#EAE2D5] hover:border-[#C5A059] text-[#666]"
                }`}
              >
                <span className="text-2xl">👶</span>
                <span className="text-sm">استقبال مولود / عقيقة</span>
              </button>
            </div>
          </div>

          {/* Names Input */}
          <div>
            <label className="block text-xs font-serif font-bold text-[#666] mb-1.5 uppercase tracking-wide">
              {type === "wedding" ? "أسماء العرسان الكرام" : "اسم المولود السعيد (أو الكنية)"}
            </label>
            <input
              type="text"
              required
              value={names}
              onChange={(e) => setNames(e.target.value)}
              placeholder={type === "wedding" ? "مثال: عبد الرحمن ومريم" : "مثال: الأميرة تالا أو فهد"}
              className="w-full px-4 py-3 rounded-lg border border-[#EAE2D5] bg-[#F9F7F5] text-sm focus:outline-none focus:ring-1 focus:ring-[#C5A059] focus:border-[#C5A059] text-[#2D2D2D] text-right"
            />
          </div>

          {/* Styles Selection */}
          <div>
            <label className="block text-xs font-serif font-bold text-[#666] mb-2 uppercase tracking-wide">نمط التصميم المفضل</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: "royal", label: "ملكي فاخر", icon: "👑" },
                { id: "modern", label: "عصري حديث", icon: "✨" },
                { id: "floral", label: "زهور ناعمة", icon: "🌸" },
                { id: "minimalist", label: "بسيط مريح", icon: "🍃" },
                { id: "traditional", label: "أصيل تقليدي", icon: "🕌" },
              ].map((styleOpt) => (
                <button
                  key={styleOpt.id}
                  type="button"
                  onClick={() => setStyle(styleOpt.id)}
                  className={`py-2 px-1 rounded-lg border font-medium text-[11px] transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    style === styleOpt.id
                      ? "border-[#C5A059] bg-[#F9F7F5] text-[#C5A059] font-bold"
                      : "border-[#EAE2D5] hover:border-[#C5A059] text-[#666]"
                  }`}
                >
                  <span className="text-base">{styleOpt.icon}</span>
                  <span>{styleOpt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date, Time and Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-serif font-bold text-[#666] mb-1.5 uppercase tracking-wide">التاريخ</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[#EAE2D5] bg-[#F9F7F5] text-sm focus:outline-none focus:ring-1 focus:ring-[#C5A059] focus:border-[#C5A059] text-[#2D2D2D] text-right"
              />
            </div>

            <div>
              <label className="block text-xs font-serif font-bold text-[#666] mb-1.5 uppercase tracking-wide">التوقيت</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[#EAE2D5] bg-[#F9F7F5] text-sm focus:outline-none focus:ring-1 focus:ring-[#C5A059] focus:border-[#C5A059] text-[#2D2D2D] text-right"
              />
            </div>

            <div>
              <label className="block text-xs font-serif font-bold text-[#666] mb-1.5 uppercase tracking-wide">قاعة الاحتفال</label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="قاعة ليلتي أو فندق هيلتون"
                className="w-full px-4 py-3 rounded-lg border border-[#EAE2D5] bg-[#F9F7F5] text-sm focus:outline-none focus:ring-1 focus:ring-[#C5A059] focus:border-[#C5A059] text-[#2D2D2D] text-right"
              />
            </div>
          </div>

          {/* Tone & Additional info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-serif font-bold text-[#666] mb-2 uppercase tracking-wide">لهجة النص ونبرته</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[#EAE2D5] bg-[#F9F7F5] text-sm focus:outline-none focus:ring-1 focus:ring-[#C5A059] focus:border-[#C5A059] text-[#2D2D2D] text-right"
              >
                <option value="poetic">شعري وأدبي فاخر</option>
                <option value="formal">رسمي ووقور</option>
                <option value="simple">بسيط ومباشر</option>
                <option value="cheerful">مبهج ومليء بالحماس</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-serif font-bold text-[#666] mb-2 uppercase tracking-wide">ملاحظات إضافية</label>
              <input
                type="text"
                value={extraInfo}
                onChange={(e) => setExtraInfo(e.target.value)}
                placeholder="مثال: يرجى كتابة بيت شعر ترحيبي"
                className="w-full px-4 py-3 rounded-lg border border-[#EAE2D5] bg-[#F9F7F5] text-sm focus:outline-none focus:ring-1 focus:ring-[#C5A059] focus:border-[#C5A059] text-[#2D2D2D] text-right"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !names}
            className="w-full py-4 rounded-lg bg-[#1A1A1A] hover:bg-[#C5A059] text-white font-serif font-bold text-base shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>جاري صياغة الدعوة وتصميم الألوان...</span>
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5" />
                <span>توليد الدعوة والخطاب بالذكاء الاصطناعي ✨</span>
              </>
            )}
          </button>
        </form>
      ) : (
        /* Preview generated data options */
        <div className="space-y-6">
          {generatedPreview.isFallback ? (
            <div className="p-5 rounded-xl bg-[#FFF9EB] border border-[#FFE1A8] shadow-sm">
              <h3 className="font-serif font-bold text-[#B25E00] mb-2 flex items-center justify-end gap-1.5 text-base">
                <span>نمط تصميم ذكي متكامل (قالب مدمج)</span>
                <Sparkles className="h-5 w-5 text-[#B25E00]" />
              </h3>
              <p className="text-xs text-[#7F4E11] font-serif leading-relaxed">
                تم تجهيز هذه الصياغة الفاخرة والألوان بدقة فائقة باستخدام <strong>القالب المدمج المجهز مسبقاً</strong>، نظراً لأن مفتاح الذكاء الاصطناعي (Gemini API Key) الحالي يحتاج للتفعيل أو غير نشط في لوحة التحكم. يمكنك استعراض واعتماد هذا التصميم وتعديله يدوياً بكل سهولة!
              </p>
            </div>
          ) : (
            <div className="p-5 rounded-xl bg-[#F9F7F5] border border-[#EAE2D5] shadow-sm">
              <h3 className="font-serif font-bold text-[#C5A059] mb-2 flex items-center justify-end gap-1.5 text-base">
                <span>تم التوليد بالذكاء الاصطناعي بنجاح!</span>
                <Check className="h-5 w-5 text-[#C5A059]" />
              </h3>
              <p className="text-xs text-[#666] font-serif leading-relaxed">
                قام الذكاء الاصطناعي بصياغة بطاقة دعوة متكاملة وحصرية، واقترح لوحة ألوان تناسب النمط المختار. يمكنك الآن استعراضها واعتمادها مباشرة في القالب للتعديل اليدوي اللاحق.
              </p>
            </div>
          )}

          <div className="border border-[#EAE2D5] rounded-xl p-5 bg-[#F9F7F5] space-y-4">
            <div>
              <span className="text-[10px] font-serif font-bold text-[#888] block mb-1">العنوان المقترح</span>
              <p className="text-sm font-serif font-bold text-[#1A1A1A] bg-white border border-[#EAE2D5] p-3 rounded-lg">{generatedPreview.title}</p>
            </div>

            <div>
              <span className="text-[10px] font-serif font-bold text-[#888] block mb-1">الافتتاحية والأبيات الشعرية</span>
              <p className="text-xs font-serif italic text-[#2D2D2D] bg-white border border-[#EAE2D5] p-3 rounded-lg leading-relaxed">{generatedPreview.openingQuote}</p>
            </div>

            <div>
              <span className="text-[10px] font-serif font-bold text-[#888] block mb-1">محتوى الدعوة الرئيسي</span>
              <p className="text-xs text-[#2D2D2D] bg-white border border-[#EAE2D5] p-3 rounded-lg leading-relaxed whitespace-pre-wrap">{generatedPreview.bodyText}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
              <div>
                <span className="text-[10px] font-serif font-bold text-[#888] block text-center mb-1">الخلفية</span>
                <div className="h-8 rounded-lg border border-[#EAE2D5] text-center text-[10px] flex items-center justify-center font-mono bg-white text-[#2D2D2D]" style={{ backgroundColor: generatedPreview.colors.background, color: generatedPreview.colors.text }}>
                  {generatedPreview.colors.background}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-serif font-bold text-[#888] block text-center mb-1">الأساسي</span>
                <div className="h-8 rounded-lg border border-[#EAE2D5] text-center text-[10px] flex items-center justify-center font-mono text-white" style={{ backgroundColor: generatedPreview.colors.primary }}>
                  {generatedPreview.colors.primary}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-serif font-bold text-[#888] block text-center mb-1">الخط</span>
                <p className="text-[11px] bg-white border border-[#EAE2D5] p-2 rounded-lg text-center font-semibold text-[#1A1A1A] truncate">{generatedPreview.fontStyle}</p>
              </div>
              <div>
                <span className="text-[10px] font-serif font-bold text-[#888] block text-center mb-1">الموسيقى</span>
                <p className="text-[10px] bg-white border border-[#EAE2D5] p-2 rounded-lg text-center text-[#1A1A1A] truncate">{generatedPreview.musicTheme}</p>
              </div>
              <div>
                <span className="text-[10px] font-serif font-bold text-[#888] block text-center mb-1">التأثيرات</span>
                <p className="text-[10px] bg-white border border-[#EAE2D5] p-2 rounded-lg text-center text-[#1A1A1A] truncate">{generatedPreview.particlesEffect}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAdoptDesign}
              className="flex-1 py-3.5 rounded-lg bg-[#1A1A1A] hover:bg-[#C5A059] text-white font-serif font-bold text-sm shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>اعتماد التصميم وبدء النشر 🎨</span>
            </button>

            <button
              onClick={() => setGeneratedPreview(null)}
              className="px-5 py-3.5 rounded-lg border border-[#EAE2D5] hover:bg-[#F9F7F5] text-[#666] font-serif font-bold text-sm transition-all flex items-center gap-1 cursor-pointer"
            >
              <ArrowRight className="h-4 w-4" />
              <span>إعادة المحاولة</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
