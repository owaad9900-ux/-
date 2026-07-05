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
  Youtube,
  Heart,
  Baby,
  Mail,
  Sparkles,
  BookOpen,
  Compass,
  Award,
  MessageSquare,
  Gift,
  Palette,
  Timer
} from "lucide-react";
import { Invitation, RSVP } from "../types";

interface InvitationCardProps {
  invitation: Invitation;
  onRsvpSubmit?: (rsvp: Omit<RSVP, "id" | "submittedAt">) => void;
  previewMode?: boolean;
  rsvps?: RSVP[];
}

export default function InvitationCard({ invitation, onRsvpSubmit, previewMode = false, rsvps = [] }: InvitationCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCardTab, setActiveCardTab] = useState<"card" | "details" | "rsvp" | "wishes">("card");
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

  // Countdown Timer State
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  // Local wishes to simulate instantly adding congratulations notes
  const [localWishes, setLocalWishes] = useState<any[]>([]);

  // Parse any date format safely with defaults
  const parseInvitationDate = (dateStr: string): Date => {
    if (!dateStr) return new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
    const parsed = Date.parse(dateStr);
    if (!isNaN(parsed)) {
      return new Date(parsed);
    }
    const isoRegex = /(\d{4})[-/](\d{1,2})[-/](\d{1,2})/;
    const matchIso = dateStr.match(isoRegex);
    if (matchIso) {
      return new Date(parseInt(matchIso[1]), parseInt(matchIso[2]) - 1, parseInt(matchIso[3]));
    }
    const ddmmyyyyRegex = /(\d{1,2})[-/](\d{1,2})[-/](\d{4})/;
    const matchDdmmyyyy = dateStr.match(ddmmyyyyRegex);
    if (matchDdmmyyyy) {
      return new Date(parseInt(matchDdmmyyyy[3]), parseInt(matchDdmmyyyy[2]) - 1, parseInt(matchDdmmyyyy[1]));
    }
    return new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
  };

  useEffect(() => {
    const eventDate = parseInvitationDate(invitation.date);
    const updateCountdown = () => {
      const difference = eventDate.getTime() - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [invitation.date]);

  // Web Audio Synthesizer reference for ambient beautiful sound
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Reset open state when template changes so the user can see splash & animations!
  useEffect(() => {
    setIsOpen(false);
    setActiveCardTab("card");
    setLocalWishes([]);
    if (isPlaying) {
      stopSynthesizer();
    }
  }, [invitation.style, invitation.id]);

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
        notes = [293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99]; // D4, E4, G4, A4, C5, D5, E5, G5
      } else if (invitation.musicTheme === "soft-piano") {
        notes = [261.63, 329.63, 392.00, 493.88, 523.25, 659.25, 783.99, 987.77]; // C4, E4, G4, B4, C5, E5, G5, B5
      } else if (invitation.musicTheme === "sweet-lullaby") {
        notes = [349.23, 392.00, 440.00, 493.88, 523.25, 587.33, 698.46, 783.99]; // F4, G4, A4, B4, C5, D5, F5, G5
      } else {
        notes = [220.00, 277.18, 329.63, 440.00, 554.37, 659.25]; // A3, C#4, E4, A4, C#5, E5
      }

      const scheduleNextNotes = () => {
        if (!audioContextRef.current || audioContextRef.current.state === "suspended") return;
        const now = audioContextRef.current.currentTime;

        const baseNoteIndex = (step * 3) % notes.length;
        const harmonyNoteIndex = (step * 2 + 1) % notes.length;

        playTone(notes[baseNoteIndex], now, 1.8, "triangle");
        if (step % 2 === 0) {
          playTone(notes[harmonyNoteIndex] * 0.5, now + 0.4, 1.2, "sine");
        }

        step++;
      };

      scheduleNextNotes();
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
        : invitation.particlesEffect === "stitch-bubbles"
        ? ["#38bdf8", "#0ea5e9", "#f472b6", "#e0f2fe", "#ffffff"]
        : invitation.particlesEffect === "tropical-leaves"
        ? ["#10b981", "#34d399", "#fb7185", "#ec4899", "#fcd34d"]
        : ["#e8f8f5", "#aed6f1", "#f9ebff", "#fcf3cf"];

    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
        {Array.from({ length: particleCount }).map((_, i) => {
          const size = Math.random() * 8 + 4;
          const delay = Math.random() * 8;
          const duration = Math.random() * 12 + 10;
          const left = Math.random() * 100;
          const color = colors[i % colors.length];

          const isStitchBubbles = invitation.particlesEffect === "stitch-bubbles";
          const isTropicalLeaves = invitation.particlesEffect === "tropical-leaves";

          // Emojis for tropical leaves or custom style for bubbles
          const emojis = ["🌺", "🍃", "🌴", "🌸", "🥥", "🏵️"];
          const emoji = isTropicalLeaves ? emojis[i % emojis.length] : null;

          return (
            <motion.div
              key={i}
              className={`absolute ${emoji ? "text-lg opacity-80" : "rounded-full opacity-60"}`}
              style={{
                width: emoji ? "auto" : size,
                height: emoji ? "auto" : size,
                left: `${left}%`,
                bottom: "-30px",
                backgroundColor: emoji ? "transparent" : color,
                border: isStitchBubbles ? "1px solid rgba(255, 255, 255, 0.4)" : "none",
                boxShadow: invitation.particlesEffect === "gold-dust" 
                  ? "0 0 8px rgba(212, 175, 55, 0.4)" 
                  : isStitchBubbles
                  ? "0 0 10px rgba(56, 189, 248, 0.3)"
                  : "none",
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
            >
              {emoji}
              {isStitchBubbles && i % 4 === 0 && <span className="absolute -inset-0.5 rounded-full border border-pink-300/30" />}
            </motion.div>
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

    if (guestNotes.trim()) {
      setLocalWishes(prev => [
        {
          id: "local_wish_" + Math.random().toString(36).substring(2, 9),
          guestName,
          phone: guestPhone,
          guestCount,
          status: rsvpStatus,
          notes: guestNotes,
          submittedAt: "الآن ✨"
        },
        ...prev
      ]);
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

  // Dynamic Entrance Animation config based on template
  const getAnimationVariants = () => {
    const type = invitation.animationType || "zoom-in";
    switch (type) {
      case "slide-up":
        return {
          hidden: { y: 200, opacity: 0, scale: 0.95 },
          visible: { y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 60, damping: 15 } }
        };
      case "fade-in":
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 1.2, ease: "easeOut" } }
        };
      case "rotate-fade":
        return {
          hidden: { rotate: -8, opacity: 0, scale: 0.9 },
          visible: { rotate: 0, opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeOut" } }
        };
      case "bounce":
        return {
          hidden: { y: -250, opacity: 0 },
          visible: { y: 0, opacity: 1, transition: { type: "spring", bounce: 0.45, duration: 1.1 } }
        };
      case "elastic-pop":
        return {
          hidden: { scale: 0.3, opacity: 0 },
          visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 120, damping: 11 } }
        };
      case "flip-x":
        return {
          hidden: { rotateX: 90, opacity: 0 },
          visible: { rotateX: 0, opacity: 1, transition: { duration: 0.9, ease: "easeOut" } }
        };
      case "slide-left":
        return {
          hidden: { x: 200, opacity: 0 },
          visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 70, damping: 15 } }
        };
      case "slide-right":
        return {
          hidden: { x: -200, opacity: 0 },
          visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 70, damping: 15 } }
        };
      case "glow-grow":
        return {
          hidden: { scale: 0.95, filter: "brightness(2) blur(8px)", opacity: 0 },
          visible: { scale: 1, filter: "brightness(1) blur(0px)", opacity: 1, transition: { duration: 1.2, ease: "easeInOut" } }
        };
      case "zoom-in":
      default:
        return {
          hidden: { scale: 0.85, opacity: 0 },
          visible: { scale: 1, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }
        };
    }
  };

  const handleOpenInvitation = () => {
    setIsOpen(true);
    startSynthesizer();
  };

  // Helper to get matching theme background style for splash screens
  const getSplashBackground = () => {
    const style = invitation.splashStyle || "envelope";
    switch (style) {
      case "royal-curtain":
        return {
          background: `radial-gradient(circle, ${invitation.colors.secondary}ee 20%, ${invitation.colors.background}ff 100%)`,
          border: `6px double ${invitation.colors.primary}`
        };
      case "floral-vignette":
        return {
          background: `linear-gradient(135deg, ${invitation.colors.background} 30%, ${invitation.colors.secondary}44 100%)`,
          border: `2px solid ${invitation.colors.primary}66`
        };
      case "wax-seal":
        return {
          background: `${invitation.colors.background}`,
          backgroundImage: `radial-gradient(ellipse at center, ${invitation.colors.secondary}77 0%, ${invitation.colors.background} 80%)`,
          border: `1px solid ${invitation.colors.primary}33`
        };
      case "glowing-star":
      case "starry-night":
        return {
          background: "#050b14",
          border: "3px solid #cb997e55"
        };
      case "matte-glass":
        return {
          background: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(20px)",
          border: `1px solid rgba(255, 255, 255, 0.1)`
        };
      case "bohemian-arch":
        return {
          background: `${invitation.colors.background}`,
          border: `3px solid ${invitation.colors.primary}aa`,
          borderRadius: "120px 120px 24px 24px"
        };
      case "classical-gate":
        return {
          background: `${invitation.colors.background}`,
          border: `4px double ${invitation.colors.primary}`,
          outline: `2px solid ${invitation.colors.secondary}55`,
          outlineOffset: "-12px"
        };
      case "vintage-lace":
        return {
          background: `${invitation.colors.background}`,
          border: `1px dashed ${invitation.colors.primary}`,
          boxShadow: `inset 0 0 40px ${invitation.colors.primary}15`
        };
      case "envelope":
      default:
        return {
          background: `linear-gradient(to bottom, ${invitation.colors.background}dd, ${invitation.colors.background})`,
          border: `4px solid ${invitation.colors.primary}33`
        };
    }
  };

  return (
    <div 
      className="w-full max-w-lg mx-auto overflow-hidden rounded-3xl shadow-2xl relative border transition-all duration-500"
      style={{ 
        backgroundColor: invitation.colors.background,
        borderColor: `${invitation.colors.primary}33`,
        color: invitation.colors.text
      }}
    >
      <AnimatePresence mode="wait">
        {!isOpen ? (
          /* SPLASH SCREEN (شاشة البداية) WITH STUNNING DIVERSE DESIGNS */
          <motion.div
            key="splash-screen"
            initial={{ opacity: 1 }}
            exit={{ 
              opacity: 0, 
              scale: 1.05, 
              filter: "blur(10px)",
              transition: { duration: 0.6, ease: "easeInOut" } 
            }}
            className="p-8 min-h-[500px] flex flex-col justify-between items-center text-center relative z-30"
            style={getSplashBackground()}
          >
            {/* Background elements unique to splash screen style */}
            {invitation.splashStyle === "starry-night" && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute w-2 h-2 bg-yellow-100 rounded-full top-10 left-10 animate-ping opacity-70" />
                <div className="absolute w-1 h-1 bg-white rounded-full top-40 right-16 animate-pulse" />
                <div className="absolute w-1.5 h-1.5 bg-yellow-200 rounded-full bottom-20 left-1/4 animate-pulse delay-700" />
                <div className="absolute w-12 h-12 rounded-full border border-yellow-200/20 top-8 right-8 flex items-center justify-center">
                  <span className="text-yellow-100 text-xs">🌙</span>
                </div>
              </div>
            )}

            {invitation.splashStyle === "glowing-star" && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-radial-gradient from-yellow-500/10 to-transparent opacity-50" />
                <div className="absolute w-40 h-40 rounded-full blur-3xl top-1/3 left-1/4" style={{ backgroundColor: `${invitation.colors.primary}22` }} />
              </div>
            )}

            {/* Top Emblem / Welcome Text */}
            <div className="w-full mt-6 space-y-4">
              <motion.p 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 0.9 }}
                transition={{ duration: 0.5 }}
                className="text-xs uppercase tracking-widest font-semibold font-mono"
                style={{ color: invitation.colors.primary }}
              >
                {invitation.splashWelcomeText || "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"}
              </motion.p>
              
              <div className="h-0.5 w-16 mx-auto" style={{ backgroundColor: invitation.colors.primary }} />
            </div>

            {/* Central Graphic Widget depending on theme style */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="my-auto py-8 flex flex-col items-center"
            >
              {invitation.splashStyle === "wax-seal" ? (
                <div className="relative mb-4">
                  <div className="absolute inset-0 rounded-full blur-md bg-red-600/20 animate-pulse" />
                  <div className="w-20 h-20 rounded-full bg-red-700 border-4 border-red-800 flex items-center justify-center text-amber-100 text-3xl font-serif shadow-lg transform hover:scale-105 transition-transform cursor-pointer">
                    {invitation.type === "wedding" ? "囍" : "♥"}
                  </div>
                </div>
              ) : invitation.splashStyle === "stitch-ears" ? (
                <div className="relative mb-4 flex items-center justify-center w-24 h-24">
                  {/* Left Ear */}
                  <motion.div 
                    animate={{ rotate: [-5, 5, -5] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="absolute right-14 w-12 h-6 rounded-l-full bg-[#00a2ff] border-t-4 border-l-4 border-pink-400"
                    style={{ transformOrigin: "right center" }}
                  />
                  {/* Right Ear */}
                  <motion.div 
                    animate={{ rotate: [5, -5, 5] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="absolute left-14 w-12 h-6 rounded-r-full bg-[#00a2ff] border-t-4 border-r-4 border-pink-400"
                    style={{ transformOrigin: "left center" }}
                  />
                  {/* Head */}
                  <div className="w-16 h-14 rounded-full bg-[#008DDA] flex flex-col items-center justify-center relative shadow-md">
                    {/* Eyes */}
                    <div className="flex gap-4 justify-center absolute top-3">
                      <div className="w-4 h-5 rounded-full bg-[#11235A] rotate-6 flex items-center justify-center relative">
                        <div className="w-1.5 h-1.5 rounded-full bg-white absolute top-1 right-1" />
                      </div>
                      <div className="w-4 h-5 rounded-full bg-[#11235A] -rotate-6 flex items-center justify-center relative">
                        <div className="w-1.5 h-1.5 rounded-full bg-white absolute top-1 left-1" />
                      </div>
                    </div>
                    {/* Big Nose */}
                    <div className="w-5 h-3.5 rounded-full bg-[#0c2240] absolute bottom-3" />
                  </div>
                </div>
              ) : invitation.splashStyle === "stitch-cute" ? (
                <div className="relative mb-4 flex items-center justify-center w-24 h-24">
                  {/* Blue Stitch Head */}
                  <div className="w-14 h-12 rounded-full bg-[#00a2ff] flex items-center justify-center relative shadow-sm z-10">
                    <div className="absolute -left-6 w-8 h-4 bg-[#00a2ff] rounded-l-full rotate-12" />
                    <div className="absolute -right-6 w-8 h-4 bg-[#00a2ff] rounded-r-full -rotate-12" />
                    <div className="w-4 h-3.5 rounded-full bg-[#0c2240]" />
                  </div>
                  {/* Giant floating sparkling pink heart behind it */}
                  <motion.div 
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute text-5xl text-[#ff4b91] drop-shadow-md z-0"
                  >
                    ♥
                  </motion.div>
                </div>
              ) : invitation.splashStyle === "ohana-gate" ? (
                <div className="relative mb-4 w-28 h-24 border-2 border-dashed rounded-xl flex items-center justify-center" style={{ borderColor: invitation.colors.primary }}>
                  <div className="absolute -top-3 left-4 text-xl">🌺</div>
                  <div className="absolute -bottom-3 right-4 text-xl">🌴</div>
                  <div className="absolute -top-4 right-6 text-lg animate-bounce">✨</div>
                  <span className="text-3xl font-bold font-serif" style={{ color: invitation.colors.primary }}>OHANA</span>
                </div>
              ) : invitation.splashStyle === "classical-gate" ? (
                <div className="w-24 h-24 rounded-t-full border-2 border-dashed flex items-center justify-center mb-4" style={{ borderColor: invitation.colors.primary }}>
                  <BookOpen className="h-10 w-10 opacity-80" style={{ color: invitation.colors.primary }} />
                </div>
              ) : invitation.splashStyle === "matte-glass" ? (
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg mb-4">
                  <Sparkles className="h-10 w-10 text-amber-300 animate-spin" style={{ animationDuration: "12s" }} />
                </div>
              ) : invitation.splashStyle === "bohemian-arch" ? (
                <div className="w-20 h-28 rounded-t-full border-2 flex items-center justify-center mb-4" style={{ borderColor: invitation.colors.primary, backgroundColor: `${invitation.colors.primary}0a` }}>
                  <Compass className="h-8 w-8 opacity-70" style={{ color: invitation.colors.primary }} />
                </div>
              ) : invitation.splashStyle === "floral-vignette" ? (
                <div className="w-20 h-20 rounded-full border border-dashed flex items-center justify-center mb-4" style={{ borderColor: invitation.colors.primary }}>
                  <span className="text-2xl">🌸</span>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full border flex items-center justify-center mb-4" style={{ borderColor: invitation.colors.primary }}>
                  <Mail className="h-6 w-6 opacity-70 animate-bounce" style={{ color: invitation.colors.primary }} />
                </div>
              )}

              <h2 className="text-xl sm:text-2xl font-bold tracking-wide mt-2" style={{ color: invitation.colors.primary }}>
                {invitation.type === "wedding" ? "دعوة حضور حفل زفاف" : "دعوة استقبال المولود الجديد"}
              </h2>
              <p className="text-sm font-semibold mt-2 opacity-80" style={{ color: invitation.colors.accent }}>
                {invitation.names}
              </p>
            </motion.div>

            {/* Bottom Opening Call to Action */}
            <div className="w-full mb-6 space-y-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleOpenInvitation}
                className="px-8 py-3.5 rounded-full font-bold text-sm shadow-xl transition-all relative group overflow-hidden cursor-pointer"
                style={{ 
                  backgroundColor: invitation.colors.primary,
                  color: invitation.colors.background === "#ffffff" ? "#111111" : invitation.colors.background
                }}
              >
                {/* Glowing ring animation */}
                <span className="absolute inset-0 w-full h-full bg-white/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative flex items-center justify-center gap-2">
                  {invitation.splashButtonText || "افتح الدعوة ✉️"}
                </span>
              </motion.button>

              <p className="text-[10px] opacity-60">تنبيه: تحتوي البطاقة على مؤثرات موسيقية وبصرية تفاعلية</p>
            </div>
          </motion.div>
        ) : (
          /* DETAILED INVITATION CONTENT WITH MULTIPLE ADAPTIVE ENTRANCE ANIMATIONS */
          <motion.div
            key="invitation-body"
            variants={getAnimationVariants()}
            initial="hidden"
            animate="visible"
            className="relative"
          >
            {/* Dynamic Animated Particles Layer */}
            {renderParticles()}

            {/* Music and Utilities Floating Bar */}
            <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
              <button
                onClick={handleTogglePlay}
                className="p-3 rounded-full backdrop-blur-md bg-black/25 text-white hover:bg-black/45 transition-all shadow-md flex items-center gap-2 text-xs cursor-pointer"
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
                className="p-3 rounded-full backdrop-blur-md bg-black/25 text-white hover:bg-black/45 transition-all shadow-md flex items-center gap-2 text-xs cursor-pointer"
              >
                <Share2 className="h-4 w-4" />
                <span>{copied ? "تم النسخ!" : "مشاركة الرابط"}</span>
              </button>
            </div>

            {/* Main invitation body */}
            <div className="p-8 pt-20 flex flex-col items-center text-center relative z-10">
              
              {/* Interactive Tabs with sliding background highlight */}
              <div className="w-full bg-black/5 rounded-2xl p-1 mb-6 flex flex-row-reverse justify-between items-center relative z-20" style={{ backdropFilter: "blur(5px)" }}>
                {[
                  { id: "card", label: "الدعوة", icon: Mail },
                  { id: "details", label: "التفاصيل", icon: MapPin },
                  { id: "rsvp", label: "الحضور", icon: CheckCircle },
                  { id: "wishes", label: "التهاني", icon: MessageSquare }
                ].map((tab) => {
                  const isActive = activeCardTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveCardTab(tab.id as any)}
                      className="relative flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1 text-xs font-bold transition-all cursor-pointer"
                      style={{ 
                        color: isActive ? invitation.colors.primary : `${invitation.colors.text}aa`,
                      }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="active-card-tab-pill"
                          className="absolute inset-0 rounded-xl shadow-sm z-0"
                          style={{ 
                            backgroundColor: `${invitation.colors.primary}18`, 
                            border: `1px solid ${invitation.colors.primary}33` 
                          }}
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-1 shrink-0">
                        <Icon className="h-3.5 w-3.5" />
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Contents with Framer Motion slide-fade transitions */}
              <div className="w-full min-h-[350px] flex flex-col justify-start">
                <AnimatePresence mode="wait">
                  {activeCardTab === "card" && (
                    <motion.div
                      key="card-tab"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="flex flex-col items-center w-full"
                    >
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
                            {invitation.style.includes("stitch") ? "🌺" : invitation.type === "wedding" ? "♥" : "👶"}
                          </span>
                        </motion.div>
                        <div className="h-0.5 w-24 my-2" style={{ backgroundColor: invitation.colors.primary }} />
                      </div>

                      {/* Title */}
                      <h1
                        className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-4 ${fontClass}`}
                        style={{ color: invitation.colors.primary }}
                      >
                        {invitation.title}
                      </h1>

                      {/* Opening Quote */}
                      {invitation.openingQuote && (
                        <p
                          className="italic text-sm sm:text-base max-w-md opacity-90 leading-relaxed mb-8 px-4 py-3 rounded-xl border border-dashed text-center"
                          style={{ 
                            borderColor: `${invitation.colors.primary}55`,
                            backgroundColor: `${invitation.colors.primary}11`
                          }}
                        >
                          {invitation.openingQuote}
                        </p>
                      )}

                      {/* Celebrated Names */}
                      <div
                        className="my-6 py-4 px-6 rounded-2xl w-full"
                        style={{ backgroundColor: `${invitation.colors.primary}18` }}
                      >
                        <p className="text-xs uppercase tracking-widest opacity-70 mb-1">صاحب (أصحاب) الحفل</p>
                        <h2 className="text-3xl font-bold tracking-wide" style={{ color: invitation.colors.accent || invitation.colors.primary }}>
                          {invitation.names}
                        </h2>
                      </div>

                      {/* Main invitation body Text */}
                      <p
                        className="text-base leading-loose text-justify px-2 mb-8"
                        style={{ textShadow: "0 1px 2px rgba(0,0,0,0.1)" }}
                      >
                        {invitation.bodyText}
                      </p>

                      {/* Closing Quote */}
                      {invitation.closingQuote && (
                        <p
                          className={`text-base font-semibold leading-relaxed mb-8 text-center italic opacity-90 ${fontClass}`}
                          style={{ color: invitation.colors.accent || invitation.colors.primary }}
                        >
                          {invitation.closingQuote}
                        </p>
                      )}
                    </motion.div>
                  )}

                  {activeCardTab === "details" && (
                    <motion.div
                      key="details-tab"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="flex flex-col items-center w-full text-right"
                    >
                      {/* Countdown Timer Widget */}
                      <div className="w-full mb-6 p-5 rounded-2xl border text-center relative overflow-hidden"
                        style={{ 
                          borderColor: `${invitation.colors.primary}33`,
                          backgroundColor: `${invitation.colors.primary}05`
                        }}
                      >
                        <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-widest opacity-80 mb-3" style={{ color: invitation.colors.primary }}>
                          <Timer className="h-4 w-4 animate-pulse" />
                          <span>العد التنازلي للمناسبة</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-black">
                          {[
                            { label: "ثانية", value: timeLeft.seconds },
                            { label: "دقيقة", value: timeLeft.minutes },
                            { label: "ساعة", value: timeLeft.hours },
                            { label: "يوم", value: timeLeft.days }
                          ].map((unit, idx) => (
                            <div key={idx} className="flex flex-col items-center bg-black/5 rounded-xl py-2.5 border border-white/10">
                              <span className="text-lg sm:text-xl font-black font-mono tracking-wider" style={{ color: invitation.colors.primary }}>
                                {String(unit.value).padStart(2, '0')}
                              </span>
                              <span className="text-[9px] font-bold opacity-70 mt-0.5">{unit.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Event Details Card */}
                      <div className="w-full grid grid-cols-2 gap-4 mb-6 text-sm">
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
                      </div>

                      {/* Dress Code & Preferred Palette */}
                      <div className="w-full p-5 rounded-2xl border mb-6 text-right"
                        style={{ 
                          borderColor: `${invitation.colors.primary}33`,
                          backgroundColor: `${invitation.colors.primary}05`
                        }}
                      >
                        <div className="flex items-center gap-2 justify-end mb-3">
                          <h3 className="font-bold text-sm" style={{ color: invitation.colors.primary }}>رمز اللباس للحضور (Dress Code)</h3>
                          <Palette className="h-4 w-4" style={{ color: invitation.colors.primary }} />
                        </div>
                        
                        <div className="space-y-2.5 text-xs opacity-90 leading-relaxed mb-4">
                          <div className="flex flex-row-reverse items-start gap-1.5">
                            <span className="text-amber-500">👔</span>
                            <span><strong>للرجال:</strong> الثوب والغترة الرسمية / البشت الفاخر</span>
                          </div>
                          <div className="flex flex-row-reverse items-start gap-1.5">
                            <span className="text-pink-500">👗</span>
                            <span><strong>للنساء:</strong> فساتين سهرة أنيقة وراقية (يُفضّل تجنب ارتداء اللون الأبيض لتألق العروس)</span>
                          </div>
                        </div>

                        {/* Preferred color themes palette */}
                        <div className="border-t pt-3 mt-3 border-dashed" style={{ borderColor: `${invitation.colors.primary}22` }}>
                          <p className="text-[10px] font-bold opacity-75 mb-2.5">لوحة الألوان المفضلة والمقترحة للحضور 🎨</p>
                          <div className="flex gap-2.5 justify-end items-center">
                            {[
                              { bg: "#E5C158", name: "ذهبي مطفي" },
                              { bg: "#F5B7B1", name: "وردي ناعم" },
                              { bg: "#F9F7F5", name: "صدفي" },
                              { bg: "#3E4E50", name: "رمادي هادئ" },
                              { bg: "#0C2240", name: "كحلي كلاسيكي" }
                            ].map((color, idx) => (
                              <div key={idx} className="relative group flex flex-col items-center">
                                <div className="w-6 h-6 rounded-full border border-white shadow-sm hover:scale-110 transition-transform cursor-help" style={{ backgroundColor: color.bg }} title={color.name} />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Optional Custom Video Player Embed */}
                      {invitation.videoUrl && (
                        <div
                          className="w-full mb-6 overflow-hidden rounded-2xl border"
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
                        </div>
                      )}

                      {/* Google Maps Location Info */}
                      <div
                        className="w-full p-5 rounded-2xl border mb-6"
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
                      </div>
                    </motion.div>
                  )}

                  {activeCardTab === "rsvp" && (
                    <motion.div
                      key="rsvp-tab"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="flex flex-col items-center w-full text-right"
                    >
                      {/* RSVP FORM */}
                      <div
                        id="rsvp-section"
                        className="w-full p-6 rounded-2xl border shadow-sm"
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
                          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-600 rounded-xl p-3 text-xs flex items-center gap-2 justify-end mb-4 font-sans">
                            <span>هذا عرض تجريبي لقالب الدعوة. يمكنك اختبار النموذج.</span>
                            <Info className="h-4 w-4 shrink-0" />
                          </div>
                        ) : null}

                        {formSubmitted ? (
                          <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 15 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="text-center py-4 space-y-4 font-sans"
                          >
                            {/* VIP Ticket Frame */}
                            <div className="border-2 rounded-2xl p-5 relative overflow-hidden bg-white shadow-md"
                              style={{ borderColor: invitation.colors.primary }}
                            >
                              {/* Left & Right punch holes to look like a real ticket */}
                              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-r-2" style={{ borderColor: invitation.colors.primary, backgroundColor: invitation.colors.background }} />
                              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-l-2" style={{ borderColor: invitation.colors.primary, backgroundColor: invitation.colors.background }} />
                              
                              {/* Ticket Header */}
                              <div className="text-center pb-3 border-b border-dashed" style={{ borderColor: `${invitation.colors.primary}33` }}>
                                <span className="text-[9px] uppercase font-black tracking-widest bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full">
                                  بطاقة دخول ذكية ومؤمنة VIP
                                </span>
                                <h4 className="font-black text-sm mt-2" style={{ color: invitation.colors.primary }}>
                                  {invitation.type === "wedding" ? "حفل زفاف" : "استقبال مولود"}
                                </h4>
                                <p className="text-xs font-bold text-gray-800 mt-1">{invitation.names}</p>
                              </div>

                              {/* Ticket Details */}
                              <div className="py-4 space-y-2.5 text-right text-xs">
                                <div className="flex justify-between flex-row-reverse">
                                  <span className="opacity-65">الاسم الكريم للضيف:</span>
                                  <span className="font-bold text-gray-900">{guestName}</span>
                                </div>
                                <div className="flex justify-between flex-row-reverse">
                                  <span className="opacity-65">حالة حضور الحفل:</span>
                                  <span className={`font-bold px-2 py-0.5 rounded ${
                                    rsvpStatus === "confirmed" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                                  }`}>
                                    {rsvpStatus === "confirmed" ? "مؤكد حضورك بكل سرور" : "معتذر عن الحضور"}
                                  </span>
                                </div>
                                <div className="flex justify-between flex-row-reverse">
                                  <span className="opacity-65">عدد المرافقين معك:</span>
                                  <span className="font-bold text-gray-900">{guestCount} {guestCount === 1 ? "فرد" : guestCount === 2 ? "فردين" : "أعضاء"}</span>
                                </div>
                                <div className="flex justify-between flex-row-reverse">
                                  <span className="opacity-65">قاعة المناسبة:</span>
                                  <span className="font-bold text-gray-900 line-clamp-1">{invitation.locationName}</span>
                                </div>
                              </div>

                              {/* Simulated Interactive Scan QR Code */}
                              {rsvpStatus === "confirmed" && (
                                <div className="border-t border-dashed pt-4 flex flex-col items-center" style={{ borderColor: `${invitation.colors.primary}33` }}>
                                  <p className="text-[10px] opacity-75 font-semibold mb-3">امسح الباركود عند بوابة الدخول 🔑</p>
                                  
                                  {/* Dynamic QR Code container with moving laser scanning beam */}
                                  <div className="relative w-36 h-36 bg-white p-3 border rounded-xl flex items-center justify-center shadow-inner overflow-hidden">
                                    {/* Simulated moving scanner laser bar */}
                                    <motion.div 
                                      animate={{ top: ["0%", "100%", "0%"] }}
                                      transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                                      className="absolute left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] z-10"
                                    />
                                    
                                    {/* Premium Vector SVG QR Code representation */}
                                    <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                                      {/* QR Corners positioning squares */}
                                      <path d="M5,5 h25 v25 h-25 z M10,10 h15 v15 h-15 z" />
                                      <path d="M70,5 h25 v25 h-25 z M75,10 h15 v15 h-15 z" />
                                      <path d="M5,70 h25 v25 h-25 z M10,75 h15 v15 h-15 z" />
                                      
                                      {/* Dynamic simulated pixels */}
                                      <rect x="40" y="5" width="5" height="5" />
                                      <rect x="50" y="5" width="10" height="5" />
                                      <rect x="45" y="15" width="5" height="15" />
                                      <rect x="55" y="10" width="10" height="5" />
                                      <rect x="60" y="20" width="5" height="5" />
                                      <rect x="40" y="25" width="15" height="5" />
                                      
                                      <rect x="5" y="40" width="15" height="5" />
                                      <rect x="25" y="40" width="5" height="10" />
                                      <rect x="15" y="50" width="10" height="5" />
                                      <rect x="5" y="60" width="5" height="5" />
                                      <rect x="20" y="55" width="15" height="5" />
                                      
                                      <rect x="40" y="40" width="20" height="20" />
                                      <rect x="65" y="40" width="10" height="5" />
                                      <rect x="80" y="45" width="15" height="5" />
                                      <rect x="75" y="55" width="15" height="10" />
                                      <rect x="65" y="60" width="5" height="15" />
                                      
                                      <rect x="40" y="70" width="10" height="5" />
                                      <rect x="55" y="75" width="15" height="5" />
                                      <rect x="45" y="85" width="15" height="10" />
                                      <rect x="70" y="80" width="25" height="5" />
                                      <rect x="80" y="90" width="15" height="5" />
                                    </svg>
                                  </div>
                                  <p className="text-[9px] text-gray-400 mt-2">ID: SECURE-INV-{Math.abs(guestName.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0))}</p>
                                </div>
                              )}
                            </div>

                            <p className="text-[10px] opacity-75 font-serif">يرجى تصوير الشاشة (Screenshot) وحفظ بطاقة الدخول لإبرازها عند بوابة القاعة.</p>

                            <div className="flex gap-2 justify-center pt-2">
                              <button
                                type="button"
                                onClick={() => setFormSubmitted(false)}
                                className="px-4 py-2 border rounded-xl text-xs font-bold transition hover:bg-black/5 cursor-pointer"
                                style={{ borderColor: `${invitation.colors.primary}55`, color: invitation.colors.primary }}
                              >
                                تعديل الاستجابة
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => {
                                  alert("تم تحميل بطاقة الدخول بنجاح! يرجى إبرازها عند المدخل. شكراً لكم 🌹");
                                }}
                                className="px-5 py-2 rounded-xl text-xs font-bold text-white transition hover:opacity-95 shadow-md cursor-pointer"
                                style={{ backgroundColor: invitation.colors.primary }}
                              >
                                تحميل البطاقة 📥
                              </button>
                            </div>
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
                                      {num} {num === 1 ? "فرد" : num === 2 ? "فردين" : "أعضاء"}
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
                                  className={`py-2 px-4 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
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
                                  className={`py-2 px-4 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
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
                              className="w-full py-3 rounded-xl font-bold text-sm shadow-md transition-all duration-300 hover:opacity-95 transform active:scale-95 cursor-pointer"
                              style={{ 
                                backgroundColor: invitation.colors.primary,
                                color: invitation.colors.background === "#ffffff" ? "#111111" : invitation.colors.background
                              }}
                            >
                              تأكيد وإرسال الاستجابة
                            </button>
                          </form>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {activeCardTab === "wishes" && (
                    <motion.div
                      key="wishes-tab"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="flex flex-col items-center w-full text-right font-sans"
                    >
                      <div className="w-full p-5 rounded-2xl border mb-6"
                        style={{ 
                          borderColor: `${invitation.colors.primary}33`,
                          backgroundColor: `${invitation.colors.primary}05`
                        }}
                      >
                        <div className="flex items-center justify-between flex-row-reverse mb-4">
                          <div className="flex items-center gap-2 justify-end">
                            <h3 className="font-bold text-sm text-gray-900" style={{ color: invitation.colors.primary }}>حائط التهاني والتبريكات</h3>
                            <MessageSquare className="h-4 w-4 shrink-0" style={{ color: invitation.colors.primary }} />
                          </div>
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 shrink-0">
                            {[...localWishes, ...(rsvps || []).filter(r => r.notes && r.notes.trim() !== "")].length} تهنئة مستلمة ✨
                          </span>
                        </div>

                        <p className="text-xs opacity-85 leading-relaxed mb-6">يسعد أصحاب الحفل قراءة تباريككم وتهانيكم القلبية ومشاركتهم الفرحة الدائمة.</p>

                        {/* Wishes Masonry-style list */}
                        <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200">
                          {[
                            ...localWishes,
                            ...(rsvps || [])
                              .filter(r => r.notes && r.notes.trim() !== "")
                              .map(r => ({
                                id: r.id,
                                guestName: r.guestName,
                                notes: r.notes,
                                status: r.status,
                                submittedAt: r.submittedAt || "مسبقاً"
                              }))
                          ].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i).length === 0 ? (
                            <div className="text-center py-10 opacity-65 flex flex-col items-center justify-center">
                              <span className="text-4xl mb-2 animate-bounce">✍️</span>
                              <p className="text-xs font-serif italic text-gray-600">كن أول من يدون تهنئة رقيقة لأصحاب الحفل وينشر الفرحة في هذا الحائط!</p>
                              <button 
                                type="button"
                                onClick={() => setActiveCardTab("rsvp")}
                                className="mt-4 px-4 py-1.5 rounded-xl text-[10px] font-bold bg-amber-500 text-white cursor-pointer hover:bg-amber-600"
                              >
                                تأكيد الحضور وكتابة تهنئة الآن
                              </button>
                            </div>
                          ) : (
                            [
                              ...localWishes,
                              ...(rsvps || [])
                                .filter(r => r.notes && r.notes.trim() !== "")
                                .map(r => ({
                                  id: r.id,
                                  guestName: r.guestName,
                                  notes: r.notes,
                                  status: r.status,
                                  submittedAt: r.submittedAt || "مسبقاً"
                                }))
                            ].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i).map((wish, index) => (
                              <motion.div
                                key={wish.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="p-4 rounded-xl border relative shadow-sm text-right overflow-hidden bg-white text-black"
                                style={{ borderColor: `${invitation.colors.primary}22` }}
                              >
                                <div className="absolute top-0 right-0 h-1.5 w-12 rounded-bl-xl" style={{ backgroundColor: invitation.colors.primary }} />
                                
                                <div className="flex items-center justify-between flex-row-reverse mb-2">
                                  <div className="flex items-center gap-1.5 flex-row-reverse">
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0" 
                                      style={{ 
                                        backgroundColor: `${invitation.colors.primary}12`,
                                        color: invitation.colors.primary,
                                        border: `1px solid ${invitation.colors.primary}22`
                                      }}
                                    >
                                      {wish.guestName.substring(0, 1)}
                                    </div>
                                    <span className="font-extrabold text-xs text-gray-800">{wish.guestName}</span>
                                    {wish.status === "confirmed" ? (
                                      <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">حاضر</span>
                                    ) : (
                                      <span className="text-[9px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded shrink-0">معتذر</span>
                                    )}
                                  </div>
                                  <span className="text-[9px] text-gray-400 font-mono shrink-0">{wish.submittedAt}</span>
                                </div>

                                <p className="text-xs text-gray-700 leading-relaxed font-serif pl-2">
                                  {wish.notes}
                                </p>
                              </motion.div>
                            ))
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Re-open Splash Screen helper in preview mode */}
              {previewMode && (
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="mt-6 px-4 py-1.5 rounded-lg border text-[10px] uppercase font-bold flex items-center gap-1 transition-all hover:bg-black/5 cursor-pointer"
                  style={{ borderColor: `${invitation.colors.primary}44`, color: invitation.colors.primary }}
                >
                  <span>عرض شاشة البداية مجدداً</span>
                </button>
              )}

              {/* Footer Credit */}
              <div className="mt-12 text-xs opacity-60 flex flex-col items-center gap-1">
                <p>منصة زفافي لبطاقات الدعوة الرقمية الفاخرة © 2026</p>
                <p className="text-[10px]">مصممة بأناقة وبأحدث تقنيات الذكاء الاصطناعي</p>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
