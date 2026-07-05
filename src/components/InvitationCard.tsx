import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MapPin, 
  Music, 
  Volume2, 
  VolumeX, 
  Calendar, 
  Clock, 
  Phone, 
  Users, 
  CheckCircle, 
  XCircle, 
  Share2, 
  Play, 
  Info,
  Youtube
} from "lucide-react";
import { Invitation, RSVP } from "../types";

interface InvitationCardProps {
  invitation: Invitation;
  onRsvpSubmit?: (rsvp: Omit<RSVP, "id" | "submittedAt">) => void;
  previewMode?: boolean;
}

export default function InvitationCard({ invitation, onRsvpSubmit, previewMode = false }: InvitationCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // RSVP Form State
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [rsvpStatus, setRsvpStatus] = useState<"confirmed" | "declined">("confirmed");
  const [guestNotes, setGuestNotes] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Web Audio Synthesizer reference for ambient beautiful sound
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Synthesize background melodies based on theme if no custom musicUrl is provided
  const startSynthesizer = () => {
    try {
      if (audioContextRef.current) {
        if (audioContextRef.current.state === "suspended") {
          audioContextRef.current.resume();
        }
        setIsPlaying(true);
        return;
      }

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      setIsPlaying(true);

      // Simple elegant melodies depending on musicTheme
      const playTone = (freq: number, startTime: number, duration: number, type: "sine" | "triangle" | "sawtooth" = "sine") => {
        if (!audioContextRef.current) return;
        const osc = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.12, startTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      let step = 0;
      let notes: number[] = [];

      if (invitation.musicTheme === "royal-instrumental") {
        // Royal fanfare & strings: pentatonic golden scale
        notes = [293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99]; // D4, E4, G4, A4, C5, D5, E5, G5
      } else if (invitation.musicTheme === "soft-piano") {
        // Heartfelt piano notes
        notes = [261.63, 329.63, 392.00, 493.88, 523.25, 659.25, 783.99, 987.77]; // C4, E4, G4, B4, C5, E5, G5, B5
      } else if (invitation.musicTheme === "sweet-lullaby") {
        // Childlike lullaby notes
        notes = [349.23, 392.00, 440.00, 493.88, 523.25, 587.33, 698.46, 783.99]; // F4, G4, A4, B4, C5, D5, F5, G5
      } else {
        // Ambient natural sound notes
        notes = [220.00, 277.18, 329.63, 440.00, 554.37, 659.25]; // A3, C#4, E4, A4, C#5, E5
      }

      const scheduleNextNotes = () => {
        if (!audioContextRef.current || audioContextRef.current.state === "suspended") return;
        const now = audioContextRef.current.currentTime;

        // Play dual harmonic soft tones
        const baseNoteIndex = (step * 3) % notes.length;
        const harmonyNoteIndex = (step * 2 + 1) % notes.length;

        playTone(notes[baseNoteIndex], now, 1.8, "triangle");
        if (step % 2 === 0) {
          playTone(notes[harmonyNoteIndex] * 0.5, now + 0.4, 1.2, "sine");
        }

        step++;
      };

      // Initial chord
      scheduleNextNotes();
      // Loop
      const interval = setInterval(scheduleNextNotes, 1600);
      intervalRef.current = interval;

    } catch (err: any) {
      console.error("Audio generation failed:", err);
      setAudioError("لم نتمكن من تشغيل الصوت التلقائي");
    }
  };

  const stopSynthesizer = () => {
    if (audioContextRef.current) {
      audioContextRef.current.suspend();
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopSynthesizer();
    } else {
      startSynthesizer();
    }
  };

  // Particle styling based on type
  const renderParticles = () => {
    if (invitation.particlesEffect === "none") return null;

    const particleCount = 28;
    const colors = 
      invitation.particlesEffect === "gold-dust" 
        ? ["#d4af37", "#f4d03f", "#fef9e7", "#e5c158"] 
        : invitation.particlesEffect === "rose-petals"
        ? ["#f5b7b1", "#ec7063", "#f9ebea", "#f1948a"]
        : ["#e8f8f5", "#aed6f1", "#f9ebff", "#fcf3cf"];

    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
        {Array.from({ length: particleCount }).map((_, i) => {
          const size = Math.random() * 8 + 4;
          const delay = Math.random() * 8;
          const duration = Math.random() * 12 + 10;
          const left = Math.random() * 100;
          const color = colors[i % colors.length];

          return (
            <motion.div
              key={i}
              className="absolute rounded-full opacity-60"
              style={{
                width: size,
                height: size,
                left: `${left}%`,
                bottom: "-20px",
                backgroundColor: color,
                boxShadow: invitation.particlesEffect === "gold-dust" ? "0 0 8px rgba(212, 175, 55, 0.4)" : "none",
              }}
              animate={{
                y: ["0px", "-900px"],
                x: ["0px", `${Math.random() * 60 - 30}px`, `0px`],
                rotate: [0, 360],
                opacity: [0, 0.8, 0.8, 0],
              }}
              transition={{
                duration: duration,
                repeat: Infinity,
                delay: delay,
                ease: "linear",
              }}
            />
          );
        })}
      </div>
    );
  };

  const handleRsvpSubmitInternal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    if (onRsvpSubmit) {
      onRsvpSubmit({
        guestName,
        phone: guestPhone,
        guestCount,
        status: rsvpStatus,
        notes: guestNotes,
      });
    }

    setFormSubmitted(true);
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Determine fonts based on selection
  const fontClass = 
    invitation.fontStyle === "serif" 
      ? "font-serif" 
      : invitation.fontStyle === "mono" 
      ? "font-mono" 
      : invitation.fontStyle === "cursive" 
      ? "font-cursive select-none"
      : "font-sans";

  return (
    <div 
      className="w-full max-w-lg mx-auto overflow-hidden rounded-3xl shadow-2xl relative border transition-all duration-500"
      style={{ 
        backgroundColor: invitation.colors.background,
        borderColor: `${invitation.colors.primary}33`,
        color: invitation.colors.text
      }}
    >
      {/* Dynamic Animated Particles Layer */}
      {renderParticles()}

      {/* Music and Utilities Floating Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
        <button
          onClick={handleTogglePlay}
          className="p-3 rounded-full backdrop-blur-md bg-black/25 text-white hover:bg-black/45 transition-all shadow-md flex items-center gap-2 text-xs"
          title="شغل الموسيقى الخلفية"
        >
          {isPlaying ? (
            <>
              <Volume2 className="h-4 w-4 animate-bounce text-amber-300" />
              <span className="hidden sm:inline">كتم الصوت</span>
            </>
          ) : (
            <>
              <VolumeX className="h-4 w-4 text-white/80" />
              <span className="hidden sm:inline">تشغيل الصوت</span>
            </>
          )}
        </button>

        <button
          onClick={handleCopyLink}
          className="p-3 rounded-full backdrop-blur-md bg-black/25 text-white hover:bg-black/45 transition-all shadow-md flex items-center gap-2 text-xs"
        >
          <Share2 className="h-4 w-4" />
          <span>{copied ? "تم النسخ!" : "مشاركة الرابط"}</span>
        </button>
      </div>

      {/* Main invitation body */}
      <div className="p-8 pt-20 flex flex-col items-center text-center relative z-10">
        
        {/* Motif Ornament Header */}
        <div className="mb-6 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
            className="w-16 h-16 rounded-full border-2 flex items-center justify-center mb-2"
            style={{ borderColor: invitation.colors.primary }}
          >
            <span className="text-xl font-bold" style={{ color: invitation.colors.primary }}>
              {invitation.type === "wedding" ? "♥" : "👶"}
            </span>
          </motion.div>
          <div className="h-0.5 w-24 my-2" style={{ backgroundColor: invitation.colors.primary }} />
        </div>

        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-4 ${fontClass}`}
          style={{ color: invitation.colors.primary }}
        >
          {invitation.title}
        </motion.h1>

        {/* Opening Quote */}
        {invitation.openingQuote && (
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="italic text-sm sm:text-base max-w-md opacity-90 leading-relaxed mb-8 px-4 py-3 rounded-xl border border-dashed text-center"
            style={{ 
              borderColor: `${invitation.colors.primary}55`,
              backgroundColor: `${invitation.colors.primary}11`
            }}
          >
            {invitation.openingQuote}
          </motion.p>
        )}

        {/* Celebrated Names */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="my-6 py-4 px-6 rounded-2xl w-full"
          style={{ backgroundColor: `${invitation.colors.primary}18` }}
        >
          <p className="text-xs uppercase tracking-widest opacity-70 mb-1">صاحب (أصحاب) الحفل</p>
          <h2 className="text-3xl font-bold tracking-wide" style={{ color: invitation.colors.accent || invitation.colors.primary }}>
            {invitation.names}
          </h2>
        </motion.div>

        {/* Main invitation body Text */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-base leading-loose text-justify px-2 mb-8"
          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.1)" }}
        >
          {invitation.bodyText}
        </motion.p>

        {/* Event Details Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-full grid grid-cols-2 gap-4 mb-8 text-right text-sm"
        >
          <div 
            className="p-4 rounded-xl border flex flex-col justify-between"
            style={{ 
              borderColor: `${invitation.colors.primary}33`,
              backgroundColor: `${invitation.colors.primary}0a`
            }}
          >
            <div className="flex items-center gap-2 mb-2 justify-end">
              <span className="font-semibold">التاريخ واليوم</span>
              <Calendar className="h-4 w-4" style={{ color: invitation.colors.primary }} />
            </div>
            <p className="font-medium text-base">{invitation.date}</p>
          </div>

          <div 
            className="p-4 rounded-xl border flex flex-col justify-between"
            style={{ 
              borderColor: `${invitation.colors.primary}33`,
              backgroundColor: `${invitation.colors.primary}0a`
            }}
          >
            <div className="flex items-center gap-2 mb-2 justify-end">
              <span className="font-semibold">توقيت الحفل</span>
              <Clock className="h-4 w-4" style={{ color: invitation.colors.primary }} />
            </div>
            <p className="font-medium text-base">{invitation.time}</p>
          </div>
        </motion.div>

        {/* Optional Custom Video Player Embed */}
        {invitation.videoUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="w-full mb-8 overflow-hidden rounded-2xl border"
            style={{ borderColor: `${invitation.colors.primary}44` }}
          >
            <div className="bg-black/10 py-2 px-4 flex items-center justify-between text-xs border-b" style={{ borderColor: `${invitation.colors.primary}22` }}>
              <span className="flex items-center gap-1.5 font-semibold">
                <Youtube className="h-4 w-4 text-red-500" />
                فيديو ترحيبي خاص
              </span>
            </div>
            <div className="relative pt-[56.25%] bg-black">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={invitation.videoUrl.includes("youtube.com") || invitation.videoUrl.includes("youtu.be") 
                  ? invitation.videoUrl.replace("watch?v=", "embed/").split("&")[0]
                  : invitation.videoUrl
                }
                title="ترحيب من العائلة"
                allowFullScreen
              />
            </div>
          </motion.div>
        )}

        {/* Google Maps Location Info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="w-full p-5 rounded-2xl border mb-8 text-right"
          style={{ 
            borderColor: `${invitation.colors.primary}33`,
            backgroundColor: `${invitation.colors.primary}08`
          }}
        >
          <div className="flex items-center gap-2 justify-end mb-3">
            <h3 className="font-bold text-base" style={{ color: invitation.colors.primary }}>موقع المناسبة</h3>
            <MapPin className="h-5 w-5" style={{ color: invitation.colors.primary }} />
          </div>
          <p className="text-sm mb-4 opacity-90">{invitation.locationName}</p>
          
          <a
            href={invitation.locationUrl || `https://maps.google.com/?q=${invitation.locationCoordinates.lat},${invitation.locationCoordinates.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs transition-transform hover:scale-105"
            style={{ 
              backgroundColor: invitation.colors.primary,
              color: invitation.colors.background === "#ffffff" ? "#ffffff" : invitation.colors.background
            }}
          >
            فتح الموقع عبر خرائط جوجل
            <MapPin className="h-4 w-4" />
          </a>
        </motion.div>

        {/* Closing Quote */}
        {invitation.closingQuote && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className={`text-base font-semibold leading-relaxed mb-8 text-center italic opacity-90 ${fontClass}`}
            style={{ color: invitation.colors.accent || invitation.colors.primary }}
          >
            {invitation.closingQuote}
          </motion.p>
        )}

        {/* RSVP FORM */}
        <div className="h-0.5 w-full my-6 opacity-20" style={{ backgroundColor: invitation.colors.primary }} />

        <motion.div
          id="rsvp-section"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="w-full p-6 rounded-2xl border text-right shadow-sm"
          style={{ 
            borderColor: `${invitation.colors.primary}33`,
            backgroundColor: `${invitation.colors.primary}05`
          }}
        >
          <h3 className="text-lg font-bold mb-2 flex items-center justify-end gap-2" style={{ color: invitation.colors.primary }}>
            تأكيد حضور الحفل (RSVP)
            <Users className="h-5 w-5" />
          </h3>
          <p className="text-xs opacity-75 mb-4">يسعدنا تلبية دعوتنا، يرجى ملء النموذج أدناه لتأكيد حضوركم.</p>

          {previewMode ? (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-600 rounded-xl p-3 text-xs flex items-center gap-2 justify-end">
              <span>هذا عرض تجريبي لقالب الدعوة. يمكنك اختبار النموذج.</span>
              <Info className="h-4 w-4" />
            </div>
          ) : null}

          {formSubmitted ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-6"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-emerald-600 text-base mb-1">تم إرسال تأكيد الحضور بنجاح</h4>
              <p className="text-xs opacity-80">شكراً لمشاركتنا فرحتنا ونتطلع لرؤيتكم قريباً!</p>
              <button
                onClick={() => setFormSubmitted(false)}
                className="mt-4 text-xs underline"
                style={{ color: invitation.colors.primary }}
              >
                تعديل الاستجابة
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleRsvpSubmitInternal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 opacity-80">الاسم الكامل للضيف</label>
                <input
                  type="text"
                  required
                  placeholder="أدخل اسمك الكريم"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm text-black border focus:ring-1 focus:outline-none focus:ring-amber-500 text-right bg-white"
                  style={{ borderColor: `${invitation.colors.primary}55` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 opacity-80">عدد المرافقين (معك)</label>
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-sm text-black border focus:ring-1 focus:outline-none focus:ring-amber-500 text-right bg-white"
                    style={{ borderColor: `${invitation.colors.primary}55` }}
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? "فرد" : num === 2 ? "فردين" : "أفراد"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 opacity-80">رقم الهاتف للاتصال</label>
                  <input
                    type="tel"
                    required
                    placeholder="9665xxxxxxxx"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm text-black border focus:ring-1 focus:outline-none focus:ring-amber-500 text-right bg-white"
                    style={{ borderColor: `${invitation.colors.primary}55` }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 opacity-80">حالة حضور الحفل</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRsvpStatus("confirmed")}
                    className={`py-2 px-4 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                      rsvpStatus === "confirmed"
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>سأحضر بكل سرور</span>
                    <CheckCircle className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setRsvpStatus("declined")}
                    className={`py-2 px-4 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                      rsvpStatus === "declined"
                        ? "bg-rose-600 border-rose-600 text-white"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>أعتذر عن الحضور</span>
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 opacity-80">تهنئة أو ملاحظة خاصة (اختياري)</label>
                <textarea
                  placeholder="أضف تهنئتك الجميلة هنا لأصحاب الفرح..."
                  rows={2}
                  value={guestNotes}
                  onChange={(e) => setGuestNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm text-black border focus:ring-1 focus:outline-none focus:ring-amber-500 text-right bg-white"
                  style={{ borderColor: `${invitation.colors.primary}55` }}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-sm shadow-md transition-all duration-300 hover:opacity-95 transform active:scale-95"
                style={{ 
                  backgroundColor: invitation.colors.primary,
                  color: invitation.colors.background === "#ffffff" ? "#ffffff" : invitation.colors.background
                }}
              >
                تأكيد وإرسال الاستجابة
              </button>
            </form>
          )}
        </motion.div>

        {/* Footer Credit */}
        <div className="mt-12 text-xs opacity-60 flex flex-col items-center gap-1">
          <p>منصة زفافي لبطاقات الدعوة الرقمية الفاخرة © 2026</p>
          <p className="text-[10px]">مصممة بأناقة وبأحدث تقنيات الذكاء الاصطناعي</p>
        </div>

      </div>
    </div>
  );
}
