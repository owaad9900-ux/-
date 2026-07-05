import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Wand2, 
  Settings, 
  Layout, 
  Users, 
  CreditCard, 
  Heart, 
  Baby, 
  MapPin, 
  Music, 
  Eye, 
  Video, 
  Check, 
  DollarSign,
  Smartphone,
  BookOpen,
  Info,
  MessageCircle,
  Lock
} from "lucide-react";
import { 
  doc, 
  setDoc, 
  onSnapshot, 
  collection, 
  addDoc, 
  deleteDoc, 
  getDocs,
  updateDoc
} from "firebase/firestore";

import { db } from "./lib/firebase";
import { Invitation, RSVP, Reminder, SubscriptionPlan } from "./types";
import { DEFAULT_TEMPLATES, SUBSCRIPTION_PLANS } from "./data/templates";
import { motion, AnimatePresence } from "motion/react";

// Import modular sub-components
import InvitationCard from "./components/InvitationCard";
import AIGenerator from "./components/AIGenerator";
import Dashboard from "./components/Dashboard";
import PaymentModal from "./components/PaymentModal";
import SupportChat from "./components/SupportChat";

export default function App() {
  const [activeTab, setActiveTab] = useState<"ai" | "templates" | "customize" | "dashboard" | "pricing">("templates");
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);

  // Templates Gallery Filter States
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateCategory, setTemplateCategory] = useState("all");
  const [templateAnimation, setTemplateAnimation] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const templatesPerPage = 12;

  // Reset pagination on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [templateSearch, templateCategory, templateAnimation]);

  const filteredTemplates = DEFAULT_TEMPLATES.filter(tpl => {
    // 1. Category filter
    if (templateCategory !== "all" && tpl.type !== templateCategory) return false;
    // 2. Animation filter
    if (templateAnimation !== "all" && tpl.animationType !== templateAnimation) return false;
    // 3. Search text
    if (templateSearch.trim()) {
      const q = templateSearch.toLowerCase();
      const matchTitle = tpl.title.toLowerCase().includes(q);
      const matchNames = tpl.names.toLowerCase().includes(q);
      const matchLocation = tpl.locationName.toLowerCase().includes(q);
      const matchStyle = tpl.style.toLowerCase().includes(q);
      if (!matchTitle && !matchNames && !matchLocation && !matchStyle) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredTemplates.length / templatesPerPage);
  const paginatedTemplates = filteredTemplates.slice(
    (currentPage - 1) * templatesPerPage,
    currentPage * templatesPerPage
  );
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [viewsCount, setViewsCount] = useState(138);
  const [currentPlanId, setCurrentPlanId] = useState("free");

  // User session state
  const [user, setUser] = useState<{ email: string; name: string; planId: string; activatedCode?: string | null; inviteId: string } | null>(() => {
    const saved = localStorage.getItem("user_session");
    return saved ? JSON.parse(saved) : null;
  });

  // Auth modal and activation state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Activation Code input state
  const [activationCodeInput, setActivationCodeInput] = useState("");
  const [activationError, setActivationError] = useState<string | null>(null);
  const [activationSuccess, setActivationSuccess] = useState<string | null>(null);
  const [activationLoading, setActivationLoading] = useState(false);

  // Support chat state
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  // Loading and Notification States
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<SubscriptionPlan | null>(null);

  // Invitation ID depends on user session for custom separate accounts
  const invitationId = user ? user.inviteId : "user_invitation_2026";

  // Check if user is logged in AND has an active premium activation code
  const isPremiumUser = user !== null && currentPlanId !== "free";

  // Sync user's real-time active plan status from database
  useEffect(() => {
    if (!user) {
      setCurrentPlanId("free");
      return;
    }

    const userDocRef = doc(db, "users", user.email);
    const unsubscribeUser = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setCurrentPlanId(data.planId || "free");
        setUser(prev => {
          if (!prev) return null;
          const updated = {
            ...prev,
            planId: data.planId || "free",
            activatedCode: data.activatedCode || null
          };
          localStorage.setItem("user_session", JSON.stringify(updated));
          return updated;
        });
      }
    }, (err) => {
      console.error("Error listening to user doc:", err);
    });

    return () => {
      unsubscribeUser();
    };
  }, [user?.email]);

  // Load invitation and sync RSVPs in real-time from Firestore database
  useEffect(() => {
    const inviteDocRef = doc(db, "invitations", invitationId);

    // 1. Listen for invitation updates
    const unsubscribeInvite = onSnapshot(inviteDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as Invitation;
        setInvitation(data);
        if (data.viewsCount !== undefined) {
          setViewsCount(data.viewsCount);
        }
      } else {
        // Initialize with default Royal Wedding template if not present
        const defaultTemplate = {
          ...DEFAULT_TEMPLATES[0],
          id: invitationId,
          createdAt: new Date().toISOString(),
          viewsCount: 138,
          ownerEmail: user ? user.email : "guest"
        } as Invitation;

        setDoc(inviteDocRef, defaultTemplate)
          .then(() => setInvitation(defaultTemplate))
          .catch(err => console.error("Error setting default invite:", err));
      }
    });

    // 2. Listen for RSVPs collection updates in real-time
    const rsvpColRef = collection(db, "invitations", invitationId, "rsvps");
    const unsubscribeRsvps = onSnapshot(rsvpColRef, (snapshot) => {
      const rsvpData: RSVP[] = [];
      snapshot.forEach((doc) => {
        rsvpData.push({ id: doc.id, ...doc.data() } as RSVP);
      });
      
      if (rsvpData.length === 0) {
        // Seed default RSVPs to make the dashboard look beautiful out-of-the-box
        const defaultRsvps: RSVP[] = [
          {
            id: "seed_1",
            guestName: "د. خالد الحربي وعائلته",
            phone: "+966504123456",
            guestCount: 4,
            status: "confirmed",
            notes: "ألف مبروك للعروسين ونتمنى لكم حياة مليئة بالسعادة والبركة!",
            submittedAt: "2026-07-04 10:15"
          },
          {
            id: "seed_2",
            guestName: "أ. منيرة السعيد",
            phone: "+966555987654",
            guestCount: 2,
            status: "confirmed",
            notes: "بإذن الله نكون أول الحاضرين لمشاركتكم هذه المناسبة الجميلة.",
            submittedAt: "2026-07-04 11:32"
          },
          {
            id: "seed_3",
            guestName: "م. فيصل اليوسف",
            phone: "+966533112233",
            guestCount: 1,
            status: "declined",
            notes: "أعتذر بشدة لتواجدي خارج البلاد في هذا التاريخ الموقر. مبارك لكم.",
            submittedAt: "2026-07-04 12:05"
          }
        ];
        
        // Batch seed them
        defaultRsvps.forEach(rsvp => {
          setDoc(doc(db, "invitations", invitationId, "rsvps", rsvp.id), rsvp);
        });
        setRsvps(defaultRsvps);
      } else {
        setRsvps(rsvpData.sort((a,b) => b.submittedAt.localeCompare(a.submittedAt)));
      }
    });

    // 3. Listen for scheduled reminders collection
    const reminderColRef = collection(db, "invitations", invitationId, "reminders");
    const unsubscribeReminders = onSnapshot(reminderColRef, (snapshot) => {
      const remData: Reminder[] = [];
      snapshot.forEach((doc) => {
        remData.push({ id: doc.id, ...doc.data() } as Reminder);
      });
      setReminders(remData);
    });

    return () => {
      unsubscribeInvite();
      unsubscribeRsvps();
      unsubscribeReminders();
    };
  }, [invitationId]);


  // Update invitation data in Firestore
  const updateInvitationField = (fields: Partial<Invitation>) => {
    if (!invitation) return;
    if (!isPremiumUser) {
      setSaveStatus("⚠️ يرجى تسجيل الدخول وتفعيل كود الاشتراك لتعديل وحفظ القالب");
      setTimeout(() => setSaveStatus(null), 4000);
      return;
    }
    const updated = { ...invitation, ...fields };
    setInvitation(updated);

    const docRef = doc(db, "invitations", invitationId);
    updateDoc(docRef, fields)
      .then(() => {
        setSaveStatus("تم حفظ التعديلات تلقائياً في قاعدة البيانات");
        setTimeout(() => setSaveStatus(null), 3000);
      })
      .catch(err => {
        console.error("Error updating field:", err);
      });
  };

  // Apply pre-configured template layout to user's invitation
  const handleApplyTemplate = (template: Omit<Invitation, "id" | "createdAt">) => {
    if (!invitation) return;
    if (!isPremiumUser) {
      setSaveStatus("⚠️ يرجى تسجيل الدخول وتفعيل كود الاشتراك لتطبيق التصميم");
      setTimeout(() => setSaveStatus(null), 4000);
      return;
    }
    const updated: Invitation = {
      ...invitation,
      ...template,
      id: invitationId,
    };
    setInvitation(updated);

    const docRef = doc(db, "invitations", invitationId);
    setDoc(docRef, updated)
      .then(() => {
        setSaveStatus("تم تطبيق تصميم القالب وبدء تشغيل شاشة العرض 🎉");
        setTimeout(() => setSaveStatus(null), 3000);
      })
      .catch(err => {
        console.error("Error applying template:", err);
      });
  };

  // Add guest RSVP from local client or Guest Dashboard
  const handleAddRsvp = async (newRsvp: RSVP) => {
    try {
      const docRef = doc(db, "invitations", invitationId, "rsvps", newRsvp.id);
      await setDoc(docRef, newRsvp);
    } catch (err) {
      console.error("Error adding RSVP:", err);
    }
  };

  // Delete guest RSVP
  const handleDeleteRsvp = async (id: string) => {
    try {
      const docRef = doc(db, "invitations", invitationId, "rsvps", id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error("Error deleting RSVP:", err);
    }
  };

  // Handle RSVP Submission inside the interactive simulated card preview
  const handleRsvpSubmitFromCard = async (submittedRsvp: Omit<RSVP, "id" | "submittedAt">) => {
    const newId = "rsvp_" + Math.random().toString(36).substring(2, 9);
    const rsvpWithId: RSVP = {
      ...submittedRsvp,
      id: newId,
      submittedAt: new Date().toISOString().replace("T", " ").substring(0, 16)
    };
    
    // Dynamically increment views or simulate notification
    await handleAddRsvp(rsvpWithId);
  };

  // Handle scheduled reminder simulation
  const handleSendReminder = async (newRem: Omit<Reminder, "id" | "status">) => {
    try {
      const remId = "rem_" + Math.random().toString(36).substring(2, 9);
      const reminderWithId: Reminder = {
        ...newRem,
        id: remId,
        status: "pending"
      };

      const docRef = doc(db, "invitations", invitationId, "reminders", remId);
      await setDoc(docRef, reminderWithId);

      // Call Express server-side simulation API to log/simulate the message dispatch
      const response = await fetch("/api/send-reminder-simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteId: invitationId,
          guestName: newRem.guestName,
          guestPhone: newRem.guestPhone,
          time: newRem.scheduledTime,
          message: "تذكير بموعد الحفل السعيد"
        })
      });

      const serverData = await response.json();
      if (serverData.success) {
        // Mark as sent in 2.5 seconds to simulate a background service workers
        setTimeout(async () => {
          await updateDoc(docRef, { status: "sent" });
        }, 3000);
      }
    } catch (err) {
      console.error("Error scheduling reminder:", err);
    }
  };

  // AI Generation Completion Handler
  const handleAiGenerationComplete = (generatedInvite: Omit<Invitation, "id" | "createdAt" | "rsvpList">) => {
    if (!isPremiumUser) {
      setSaveStatus("⚠️ يرجى تسجيل الدخول وتفعيل كود الاشتراك لتوليد القوالب بالذكاء الاصطناعي");
      setTimeout(() => setSaveStatus(null), 4000);
      return;
    }
    const fullInvite: Invitation = {
      ...generatedInvite,
      id: invitationId,
      createdAt: new Date().toISOString(),
      viewsCount: viewsCount
    };

    setInvitation(fullInvite);
    const docRef = doc(db, "invitations", invitationId);
    setDoc(docRef, fullInvite)
      .then(() => {
        setSaveStatus("تم توليد وتأمين دعوتك الذكية بنجاح! 🎉");
        setActiveTab("customize");
        setTimeout(() => setSaveStatus(null), 4000);
      })
      .catch(err => console.error("Error setting AI invite:", err));
  };

  const handlePaymentSuccess = (planId: string) => {
    setCurrentPlanId(planId);
  };

  // Custom Authentication and Plan Activation handlers
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      const endpoint = authMode === "login" ? "/api/login" : "/api/register";
      const body = authMode === "login" 
        ? { email: authEmail, password: authPassword }
        : { email: authEmail, password: authPassword, name: authName };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        setAuthError(data.error || "حدث خطأ غير متوقع");
      } else {
        localStorage.setItem("user_session", JSON.stringify(data.user));
        setUser(data.user);
        setShowAuthModal(false);
        setAuthEmail("");
        setAuthPassword("");
        setAuthName("");
        setSaveStatus(`مرحباً بك يا ${data.user.name}! 👋`);
        setTimeout(() => setSaveStatus(null), 4500);
      }
    } catch (err) {
      console.error("Auth error:", err);
      setAuthError("عذراً، فشل الاتصال بالخادم الرئيسي");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user_session");
    setUser(null);
    setCurrentPlanId("free");
    setSaveStatus("تم تسجيل الخروج بنجاح");
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const RenderLockedOverlay = ({ title, description }: { title: string; description: string }) => {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl border border-dashed border-[#e6b0aa]/60 p-8 text-center flex flex-col items-center justify-center space-y-6 min-h-[350px] shadow-sm font-serif"
      >
        <div className="w-16 h-16 bg-[#faf3f0] border border-[#e6b0aa]/40 rounded-full flex items-center justify-center text-[#c88b8b] shadow-inner">
          <Lock className="h-7 w-7" />
        </div>
        <div className="max-w-md space-y-2">
          <h3 className="text-lg font-bold text-[#4a3e3d]">{title}</h3>
          <p className="text-xs text-[#3a2a29]/70 leading-relaxed">{description}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
          <button
            type="button"
            onClick={() => {
              setAuthMode("register");
              setShowAuthModal(true);
            }}
            className="flex-1 py-2.5 px-4 bg-[#4a3e3d] hover:bg-[#c88b8b] text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer"
          >
            إنشاء حساب / تسجيل دخول
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("pricing")}
            className="flex-1 py-2.5 px-4 bg-[#faf3f0] border border-[#e6b0aa]/50 hover:bg-[#f5eae6] text-[#4a3e3d] text-xs font-bold rounded-xl transition shadow-sm cursor-pointer"
          >
            أدخل كود التفعيل 🔑
          </button>
        </div>
      </motion.div>
    );
  };

  const handleActivateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setActivationError("يرجى تسجيل الدخول أو إنشاء حساب أولاً لتفعيل باقتك");
      return;
    }
    if (!activationCodeInput.trim()) {
      setActivationError("يرجى إدخال كود التفعيل");
      return;
    }

    setActivationError(null);
    setActivationSuccess(null);
    setActivationLoading(true);

    try {
      const response = await fetch("/api/activate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          code: activationCodeInput.trim()
        })
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        setActivationError(data.error || "كود التفعيل غير صالح");
      } else {
        setActivationSuccess(`تم تفعيل الباقة ${data.planId === "royal" ? "الملكية الفاخرة 👑" : "الاحترافية برو ✨"} بنجاح!`);
        setActivationCodeInput("");
        const updatedUser = { ...user, planId: data.planId, activatedCode: data.code };
        localStorage.setItem("user_session", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (err) {
      console.error("Activation code error:", err);
      setActivationError("فشل الاتصال بالخادم لتفعيل الكود");
    } finally {
      setActivationLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf3f0] font-sans text-[#3a2a29] pb-24">
      
      {/* Top Premium Navbar with Artistic Flair design */}
      <header className="h-20 border-b border-[#e6b0aa]/30 px-4 sm:px-12 flex flex-row-reverse items-center justify-between bg-[#faf3f0] sticky top-0 z-30 shadow-sm">
        
        {/* Brand Logo Group */}
        <div className="flex flex-row-reverse items-center gap-3">
          <div className="w-10 h-10 bg-[#c88b8b] rounded-full flex items-center justify-center text-white text-xl font-serif italic shadow-[0_4px_10px_rgba(200,139,139,0.25)]">
            Z
          </div>
          <div className="text-right">
            <span className="text-2xl font-serif tracking-tighter font-bold text-[#4a3e3d]">زفافي <span className="text-[#c88b8b]">AI</span></span>
            <p className="text-[10px] text-[#3a2a29]/60 font-serif italic -mt-1">تحفة فنية رقمية لمناسبتك</p>
          </div>
        </div>

        {/* Current Premium Badge Status - Redesigned elegantly */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <button 
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-red-200 text-red-600 bg-red-50/50 hover:bg-red-50 transition cursor-pointer"
              >
                تسجيل الخروج
              </button>
              <div className="text-right hidden sm:block">
                <span className="text-xs font-bold text-[#4a3e3d] block">{user.name}</span>
                <span className="text-[9px] text-[#3a2a29]/60 block">{user.email}</span>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => { setAuthMode("login"); setShowAuthModal(true); }}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#4a3e3d] text-white hover:bg-[#c88b8b] hover:shadow-md transition cursor-pointer"
            >
              تسجيل دخول / إنشاء حساب
            </button>
          )}

          <div className="h-6 w-px bg-[#e6b0aa]/30"></div>

          {currentPlanId === "royal" ? (
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold font-serif border border-[#c88b8b] bg-[#f5eae6] text-[#c88b8b] shadow-sm tracking-wide">
              الملكية الفاخرة 👑
            </span>
          ) : currentPlanId === "pro" ? (
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold font-serif border border-[#4a3e3d] bg-[#f5eae6] text-[#4a3e3d] shadow-sm tracking-wide">
              الاحترافية برو ✨
            </span>
          ) : (
            <span className="px-3.5 py-1.5 rounded-full text-xs font-medium font-serif border border-[#e6b0aa]/40 bg-[#f5eae6] text-[#3a2a29]/80 shadow-sm">
              الباقة المجانية
            </span>
          )}
        </div>

      </header>

      {/* Main Workspace Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Real-time sync status banner with warm gold/beige outline */}
        {saveStatus && (
          <div className="mb-6 p-4 rounded-xl bg-[#f5eae6] border border-[#c88b8b]/30 text-[#c88b8b] text-xs font-bold text-right flex items-center justify-end gap-2 shadow-sm">
            <span>{saveStatus}</span>
            <Check className="h-4 w-4 text-[#c88b8b] animate-pulse" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* RIGHT SIDE: Controls & Dashboard (7 columns) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Elegant Header for Currently Active Workspace Panel */}
            <div className="bg-[#f5eae6] px-6 py-4 rounded-xl border border-[#e6b0aa]/30 shadow-sm flex flex-row-reverse justify-between items-center">
              <div className="text-right">
                <h2 className="text-lg font-serif font-black text-[#4a3e3d]">
                  {activeTab === "ai" && "مصمم الدعوات بالذكاء الاصطناعي ✨"}
                  {activeTab === "templates" && "معرض القوالب الجاهزة الفاخرة 🌸"}
                  {activeTab === "customize" && "لوحة التخصيص والتعديل اليدوي ⚙️"}
                  {activeTab === "dashboard" && "نظام إدارة الحضور والـ RSVP 👥"}
                  {activeTab === "pricing" && "تفعيل كود الاشتراك المميز 💳"}
                </h2>
                <p className="text-[10px] text-[#3a2a29]/70 font-serif italic mt-0.5">
                  {activeTab === "ai" && "قم بصياغة نصوص وتصاميم دعوات متكاملة بلمسة ذكية واحدة"}
                  {activeTab === "templates" && "تصفح واختر من بين أكثر من 100 قالب مصمم بدقة فائقة"}
                  {activeTab === "customize" && "تحكم بكافة التفاصيل من ألوان وخطوط وموسيقى وتأثيرات البوابة يدوياً"}
                  {activeTab === "dashboard" && "تابع قائمة المدعوين، والذين أكدوا الحضور، وأرسل تذكيرات مخصصة"}
                  {activeTab === "pricing" && "أدخل كود التفعيل لفتح الصلاحيات الملكية والميزات غير المحدودة"}
                </p>
              </div>
              <div className="w-10 h-10 bg-white rounded-xl border border-[#e6b0aa]/40 flex items-center justify-center text-[#c88b8b] shadow-sm shrink-0">
                {activeTab === "ai" && <Sparkles className="h-5 w-5" />}
                {activeTab === "templates" && <Layout className="h-5 w-5" />}
                {activeTab === "customize" && <Settings className="h-5 w-5" />}
                {activeTab === "dashboard" && <Users className="h-5 w-5" />}
                {activeTab === "pricing" && <CreditCard className="h-5 w-5" />}
              </div>
            </div>

            {/* TAB PANELS CONTAINER */}
            <div className="overflow-hidden">
              <AnimatePresence mode="wait">
                
                {/* 1. AI Designer Tab */}
                {activeTab === "ai" && (
                  <motion.div
                    key="ai"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {!isPremiumUser ? (
                      <RenderLockedOverlay 
                        title="المساعد الذكي (AI) مغلق 🔒"
                        description="لتوليد وتصميم كروت الدعوة الفاخرة ونصوصها الشعرية الفريدة باستخدام الذكاء الاصطناعي، يرجى تسجيل الدخول وتفعيل كود الاشتراك المميز الخاص بك."
                      />
                    ) : (
                      <AIGenerator 
                        onGenerationComplete={handleAiGenerationComplete}
                        isLoading={isAiLoading}
                        setIsLoading={setIsAiLoading}
                      />
                    )}
                  </motion.div>
                )}

                {/* 1.5. Premium Templates Gallery Tab */}
                {activeTab === "templates" && (
                  <motion.div
                    key="templates"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-white rounded-2xl border border-[#e6b0aa]/40 p-6 shadow-sm text-right space-y-6"
                  >
                    {!isPremiumUser ? (
                      <RenderLockedOverlay 
                        title="معرض القوالب الجاهزة مغلق 🔒"
                        description="لتصفح وتطبيق أكثر من 100 قالب جاهز وتأمين دعوتك الذكية، يرجى تسجيل الدخول وتفعيل كود الاشتراك المميز الخاص بك."
                      />
                    ) : (
                      <>
                        <div className="border-b border-[#F0EBE3] pb-4 flex flex-col md:flex-row-reverse justify-between items-start md:items-center gap-4">
                    <div>
                      <h2 className="text-xl font-serif font-bold text-[#4a3e3d]">معرض القوالب الجاهزة الفاخرة</h2>
                      <p className="text-xs text-[#888] font-serif italic">تصفح وجرب أكثر من 100 قالب مصمم باحترافية مع تأثيرات حركية مختلفة وشاشات بداية فريدة</p>
                    </div>
                    
                    <span className="bg-[#f5eae6] text-[#c88b8b] border border-[#c88b8b]/30 text-xs font-bold px-3 py-1 rounded-full shrink-0">
                      إجمالي {DEFAULT_TEMPLATES.length} قالب جاهز ✨
                    </span>
                  </div>

                  {/* Search and Filters Layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    {/* Search Field */}
                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-bold text-[#3a2a29]/80 mb-1">ابحث عن قالب</label>
                      <input
                        type="text"
                        placeholder="مثال: ذهبي، زمردي، ياسمين، فهد..."
                        value={templateSearch}
                        onChange={(e) => setTemplateSearch(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-[#e6b0aa]/40 bg-[#f5eae6] rounded-lg text-right focus:outline-none focus:ring-1 focus:ring-[#c88b8b]"
                      />
                    </div>

                    {/* Category Filter */}
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-bold text-[#3a2a29]/80 mb-1">نوع المناسبة</label>
                      <select
                        value={templateCategory}
                        onChange={(e) => setTemplateCategory(e.target.value)}
                        className="w-full px-2 py-2 text-xs border border-[#e6b0aa]/40 bg-[#f5eae6] rounded-lg text-right focus:outline-none focus:ring-1 focus:ring-[#c88b8b]"
                      >
                        <option value="all">كل المناسبات ({DEFAULT_TEMPLATES.length})</option>
                        <option value="wedding">حفلات زفاف ({DEFAULT_TEMPLATES.filter(t => t.type === "wedding").length})</option>
                        <option value="baby">استقبال مواليد ({DEFAULT_TEMPLATES.filter(t => t.type === "baby").length})</option>
                      </select>
                    </div>

                    {/* Animation Filter */}
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-bold text-[#3a2a29]/80 mb-1">الحركة والأنيميشن</label>
                      <select
                        value={templateAnimation}
                        onChange={(e) => setTemplateAnimation(e.target.value)}
                        className="w-full px-2 py-2 text-xs border border-[#e6b0aa]/40 bg-[#f5eae6] rounded-lg text-right focus:outline-none focus:ring-1 focus:ring-[#c88b8b]"
                      >
                        <option value="all">كل الحركات</option>
                        <option value="zoom-in">تكبير ناعم (zoom-in)</option>
                        <option value="slide-up">صعود لأعلى (slide-up)</option>
                        <option value="fade-in">ظهور تدريجي (fade-in)</option>
                        <option value="rotate-fade">دوران مع ظهور (rotate-fade)</option>
                        <option value="bounce">ارتداد مرن (bounce)</option>
                        <option value="elastic-pop">انبثاق نابض (elastic-pop)</option>
                        <option value="flip-x">انقلاب ثلاثي الأبعاد (flip-x)</option>
                        <option value="slide-left">دخول من اليمين (slide-left)</option>
                        <option value="slide-right">دخول من اليسار (slide-right)</option>
                        <option value="glow-grow">توهج وتمدد (glow-grow)</option>
                      </select>
                    </div>

                    {/* Clear Button */}
                    <div className="sm:col-span-2 flex items-end">
                      <button
                        onClick={() => {
                          setTemplateSearch("");
                          setTemplateCategory("all");
                          setTemplateAnimation("all");
                        }}
                        className="w-full py-2 text-xs font-bold border border-[#e6b0aa]/40 bg-white text-[#3a2a29]/80 rounded-lg hover:bg-[#f5eae6] cursor-pointer"
                      >
                        إعادة تعيين
                      </button>
                    </div>
                  </div>

                  {/* List of Templates Grid (With Pagination) */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {paginatedTemplates.map((tpl) => {
                        const globalIndex = DEFAULT_TEMPLATES.indexOf(tpl);
                        const isCurrent = invitation?.style === tpl.style;
                        const indexOnPage = paginatedTemplates.indexOf(tpl);

                        return (
                          <motion.div
                            key={tpl.style}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: indexOnPage * 0.05, ease: "easeOut" }}
                            className={`border rounded-xl p-4 text-right flex flex-col justify-between transition-all relative overflow-hidden group hover:shadow-md ${
                              isCurrent 
                                ? "border-[#c88b8b] bg-[#faf3f0] shadow-sm ring-1 ring-[#c88b8b]" 
                                : "border-[#e6b0aa]/40 bg-white hover:border-[#4a3e3d]"
                            }`}
                          >
                            {/* Color chips preview */}
                            <div className="flex gap-1 mb-2.5 justify-start">
                              <span className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: tpl.colors.background }} title="الخلفية" />
                              <span className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: tpl.colors.primary }} title="الأساسي" />
                              <span className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: tpl.colors.secondary }} title="الفرعي" />
                              <span className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: tpl.colors.text }} title="النصوص" />
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center justify-between flex-row-reverse mb-1">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                  tpl.type === "wedding" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                                }`}>
                                  {tpl.type === "wedding" ? "زفاف" : "مولود"}
                                </span>
                                <span className="text-[10px] text-gray-400 font-mono">#{globalIndex + 1}</span>
                              </div>

                              <h3 className="font-bold text-xs text-[#4a3e3d] line-clamp-1">{tpl.title}</h3>
                              <p className="text-[10px] text-[#3a2a29]/80 font-serif line-clamp-1">{tpl.names}</p>
                              
                              <div className="pt-2 flex flex-col gap-0.5 text-[9px] text-[#888] font-serif border-t border-[#F0EBE3] mt-2">
                                <div className="flex justify-between flex-row-reverse">
                                  <span>الحركة:</span>
                                  <span className="font-bold text-[#4a3e3d]">{tpl.animationType}</span>
                                </div>
                                <div className="flex justify-between flex-row-reverse">
                                  <span>البداية:</span>
                                  <span className="font-bold text-[#4a3e3d] line-clamp-1">{tpl.splashStyle}</span>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => handleApplyTemplate(tpl)}
                              className={`w-full mt-3 py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                                isCurrent
                                  ? "bg-[#c88b8b] text-white"
                                  : "bg-[#4a3e3d] text-white hover:bg-[#c88b8b]"
                              }`}
                            >
                              {isCurrent ? "القالب مفعل حالياً" : "تطبيق هذا التصميم"}
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>

                    {filteredTemplates.length === 0 && (
                      <div className="text-center py-12 bg-[#F9F7F5] rounded-xl border border-dashed border-[#EAE2D5]">
                        <p className="text-sm text-gray-500 font-serif">لم يتم العثور على قوالب تطابق خيارات البحث الحالية.</p>
                      </div>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex justify-between items-center flex-row-reverse pt-4 border-t border-[#F0EBE3]">
                        <button
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold border border-[#EAE2D5] bg-white text-[#666] disabled:opacity-40 cursor-pointer"
                        >
                          الصفحة السابقة
                        </button>

                        <span className="text-xs font-bold font-serif text-[#666]">
                          صفحة {currentPage} من {totalPages}
                        </span>

                        <button
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold border border-[#EAE2D5] bg-white text-[#666] disabled:opacity-40 cursor-pointer"
                        >
                          الصفحة التالية
                        </button>
                      </div>
                    )}
                  </div>
                </>
                )}
              </motion.div>
            )}

              {/* 2. Manual Customizer Tab */}
              {activeTab === "customize" && invitation && (
                <motion.div
                  key="customize"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white rounded-2xl border border-[#e6b0aa]/40 p-6 shadow-sm text-right space-y-6"
                >
                  {!isPremiumUser ? (
                    <RenderLockedOverlay 
                      title="لوحة التعديل اليدوي مغلقة 🔒"
                      description="لتعديل وتخصيص كافة تفاصيل بطاقتك وتفعيل الميزات الفاخرة، يرجى تسجيل الدخول وتفعيل كود الاشتراك المميز."
                    />
                  ) : (
                    <>
                      <div className="border-b border-[#F0EBE3] pb-4 mb-4">
                        <h2 className="text-lg font-serif font-bold text-[#4a3e3d]">تخصيص تفاصيل البطاقة</h2>
                        <p className="text-xs text-[#888] font-serif italic">قم بتعديل النصوص والخطوط والموسيقى وإحداثيات الموقع مباشرة</p>
                      </div>

                  {/* Section: Type of celebration */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-serif font-bold text-[#3a2a29]/80 mb-1.5 uppercase tracking-wide">نوع المناسبة</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateInvitationField({ type: "wedding" })}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                            invitation.type === "wedding" ? "bg-[#f5eae6] border-[#c88b8b] text-[#c88b8b]" : "bg-white border-[#e6b0aa]/40 text-[#3a2a29]/70"
                          }`}
                        >
                          <span>زفاف</span>
                          <Heart className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => updateInvitationField({ type: "baby" })}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                            invitation.type === "baby" ? "bg-[#f5eae6] border-[#c88b8b] text-[#c88b8b]" : "bg-white border-[#e6b0aa]/40 text-[#3a2a29]/70"
                          }`}
                        >
                          <span>مولود جديد</span>
                          <Baby className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-serif font-bold text-[#3a2a29]/80 mb-1.5 uppercase tracking-wide">تأثيرات جسيمات الخلفية</label>
                      <select
                        value={invitation.particlesEffect}
                        onChange={(e) => updateInvitationField({ particlesEffect: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-lg text-xs border border-[#e6b0aa]/40 bg-[#f5eae6] text-[#3a2a29] focus:outline-none focus:ring-1 focus:ring-[#c88b8b] focus:border-[#c88b8b]"
                      >
                        <option value="none">بدون تأثيرات</option>
                        <option value="gold-dust">غبار ذهبي ملكي ✨</option>
                        <option value="rose-petals">بتلات ورد حمراء ناعمة 🌸</option>
                        <option value="baby-stars">نجوم صغيرة لامعة ⭐</option>
                      </select>
                    </div>
                  </div>

                  {/* Title & Host Names */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-serif font-bold text-[#3a2a29]/80 mb-1.5 uppercase tracking-wide">عنوان بطاقة الدعوة</label>
                      <input
                        type="text"
                        value={invitation.title}
                        onChange={(e) => updateInvitationField({ title: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg text-xs border border-[#e6b0aa]/40 bg-[#f5eae6] text-[#3a2a29] focus:outline-none focus:ring-1 focus:ring-[#c88b8b] focus:border-[#c88b8b]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-serif font-bold text-[#3a2a29]/80 mb-1.5 uppercase tracking-wide">أسماء أصحاب الحفل</label>
                      <input
                        type="text"
                        value={invitation.names}
                        onChange={(e) => updateInvitationField({ names: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg text-xs border border-[#e6b0aa]/40 bg-[#f5eae6] text-[#3a2a29] focus:outline-none focus:ring-1 focus:ring-[#c88b8b] focus:border-[#c88b8b]"
                      />
                    </div>
                  </div>

                  {/* Opening Quote */}
                  <div>
                    <label className="block text-xs font-serif font-bold text-[#3a2a29]/80 mb-1.5 uppercase tracking-wide">الافتتاحية والأبيات الشعرية</label>
                    <textarea
                      rows={2}
                      value={invitation.openingQuote}
                      onChange={(e) => updateInvitationField({ openingQuote: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg text-xs border border-[#e6b0aa]/40 bg-[#f5eae6] text-[#3a2a29] leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#c88b8b] focus:border-[#c88b8b]"
                    />
                  </div>

                  {/* Body text content */}
                  <div>
                    <label className="block text-xs font-serif font-bold text-[#3a2a29]/80 mb-1.5 uppercase tracking-wide">النص الرئيسي للدعوة</label>
                    <textarea
                      rows={4}
                      value={invitation.bodyText}
                      onChange={(e) => updateInvitationField({ bodyText: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg text-xs border border-[#e6b0aa]/40 bg-[#f5eae6] text-[#3a2a29] leading-relaxed text-right focus:outline-none focus:ring-1 focus:ring-[#c88b8b] focus:border-[#c88b8b]"
                    />
                  </div>

                  {/* Date, Time & Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-serif font-bold text-[#3a2a29]/80 mb-1.5 uppercase tracking-wide">تاريخ المناسبة</label>
                      <input
                        type="date"
                        value={invitation.date}
                        onChange={(e) => updateInvitationField({ date: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg text-xs border border-[#e6b0aa]/40 bg-[#f5eae6] text-[#3a2a29] focus:outline-none focus:ring-1 focus:ring-[#c88b8b] focus:border-[#c88b8b]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-serif font-bold text-[#3a2a29]/80 mb-1.5 uppercase tracking-wide">التوقيت والميعاد</label>
                      <input
                        type="time"
                        value={invitation.time}
                        onChange={(e) => updateInvitationField({ time: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg text-xs border border-[#e6b0aa]/40 bg-[#f5eae6] text-[#3a2a29] focus:outline-none focus:ring-1 focus:ring-[#c88b8b] focus:border-[#c88b8b]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-serif font-bold text-[#3a2a29]/80 mb-1.5 uppercase tracking-wide">اسم القاعة أو الفندق</label>
                      <input
                        type="text"
                        value={invitation.locationName}
                        onChange={(e) => updateInvitationField({ locationName: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg text-xs border border-[#e6b0aa]/40 bg-[#f5eae6] text-[#3a2a29] focus:outline-none focus:ring-1 focus:ring-[#c88b8b] focus:border-[#c88b8b]"
                      />
                    </div>
                  </div>

                  {/* Font Style & Music Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-serif font-bold text-[#3a2a29]/80 mb-1.5 uppercase tracking-wide">نمط ونوع خط الكتابة</label>
                      <select
                        value={invitation.fontStyle}
                        onChange={(e) => updateInvitationField({ fontStyle: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-lg text-xs border border-[#e6b0aa]/40 bg-[#f5eae6] text-[#3a2a29] focus:outline-none focus:ring-1 focus:ring-[#c88b8b] focus:border-[#c88b8b]"
                      >
                        <option value="serif">نسخ / تقليدي فخم (Serif)</option>
                        <option value="sans-serif">رقعة / عصري مريح (Sans)</option>
                        <option value="cursive">فني / ديواني أنيق (Cursive)</option>
                        <option value="mono">رقمي مبسط (Mono)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-serif font-bold text-[#3a2a29]/80 mb-1.5 uppercase tracking-wide">لحن الصوت التلقائي (الآلة)</label>
                      <select
                        value={invitation.musicTheme}
                        onChange={(e) => updateInvitationField({ musicTheme: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg text-xs border border-[#e6b0aa]/40 bg-[#f5eae6] text-[#3a2a29] focus:outline-none focus:ring-1 focus:ring-[#c88b8b] focus:border-[#c88b8b]"
                      >
                        <option value="royal-instrumental">عزف ملكي فاخر (Fanfare)</option>
                        <option value="soft-piano">بيانو رقيق (Soft Piano)</option>
                        <option value="sweet-lullaby">تهويدة مولود دافئة (Lullaby)</option>
                        <option value="ambient-nature">أجواء طبيعية هادئة (Ambient)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-serif font-bold text-[#3a2a29]/80 mb-1.5 uppercase tracking-wide">موسيقى مخصصة (رابط)</label>
                      <input
                        type="text"
                        placeholder="رابط ملف mp3 مخصص"
                        value={invitation.musicUrl || ""}
                        onChange={(e) => updateInvitationField({ musicUrl: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg text-xs border border-[#e6b0aa]/40 bg-[#f5eae6] text-[#3a2a29] focus:outline-none focus:ring-1 focus:ring-[#c88b8b] focus:border-[#c88b8b]"
                      />
                    </div>
                  </div>

                  {/* YouTube Video URL */}
                  <div>
                    <label className="block text-xs font-serif font-bold text-[#3a2a29]/80 mb-1.5 flex items-center justify-end gap-1 uppercase tracking-wide">
                      <span>إضافة رابط فيديو ترحيبي خاص (من يوتيوب)</span>
                      <Video className="h-4 w-4 text-[#c88b8b]" />
                    </label>
                    <input
                      type="text"
                      placeholder="https://www.youtube.com/watch?v=xxxxxx"
                      value={invitation.videoUrl || ""}
                      onChange={(e) => updateInvitationField({ videoUrl: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg text-xs border border-[#e6b0aa]/40 bg-[#f5eae6] text-[#3a2a29] text-left font-mono focus:outline-none focus:ring-1 focus:ring-[#c88b8b] focus:border-[#c88b8b]"
                    />
                  </div>

                  {/* Palette customization */}
                  <div>
                    <label className="block text-xs font-serif font-bold text-[#666] mb-2 uppercase tracking-wide">تخصيص لوحة الألوان اليدوي</label>
                    <div className="grid grid-cols-5 gap-3">
                      <div>
                        <span className="text-[10px] block text-center text-[#888] mb-1 font-serif">الخلفية</span>
                        <input
                          type="color"
                          value={invitation.colors.background}
                          onChange={(e) => updateInvitationField({ colors: { ...invitation.colors, background: e.target.value } })}
                          className="w-full h-10 rounded-lg cursor-pointer border border-[#EAE2D5] bg-white p-0.5"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] block text-center text-[#888] mb-1 font-serif">الأساسي</span>
                        <input
                          type="color"
                          value={invitation.colors.primary}
                          onChange={(e) => updateInvitationField({ colors: { ...invitation.colors, primary: e.target.value } })}
                          className="w-full h-10 rounded-lg cursor-pointer border border-[#EAE2D5] bg-white p-0.5"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] block text-center text-[#888] mb-1 font-serif">الفرعي</span>
                        <input
                          type="color"
                          value={invitation.colors.secondary}
                          onChange={(e) => updateInvitationField({ colors: { ...invitation.colors, secondary: e.target.value } })}
                          className="w-full h-10 rounded-lg cursor-pointer border border-[#EAE2D5] bg-white p-0.5"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] block text-center text-[#888] mb-1 font-serif">النصوص</span>
                        <input
                          type="color"
                          value={invitation.colors.text}
                          onChange={(e) => updateInvitationField({ colors: { ...invitation.colors, text: e.target.value } })}
                          className="w-full h-10 rounded-lg cursor-pointer border border-[#EAE2D5] bg-white p-0.5"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] block text-center text-[#888] mb-1 font-serif">التألق</span>
                        <input
                          type="color"
                          value={invitation.colors.accent}
                          onChange={(e) => updateInvitationField({ colors: { ...invitation.colors, accent: e.target.value } })}
                          className="w-full h-10 rounded-lg cursor-pointer border border-[#EAE2D5] bg-white p-0.5"
                        />
                      </div>
                    </div>
                  </div>
                </>
                )}
              </motion.div>
            )}

              {/* 3. Guest Dashboard Tab */}
              {activeTab === "dashboard" && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Dashboard 
                    rsvps={rsvps}
                    reminders={reminders}
                    onAddRsvp={handleAddRsvp}
                    onDeleteRsvp={handleDeleteRsvp}
                    onSendReminder={handleSendReminder}
                    viewsCount={viewsCount}
                  />
                </motion.div>
              )}

              {/* 4. Pricing / Activation Tab */}
              {activeTab === "pricing" && (
                <motion.div
                  key="pricing"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white rounded-2xl border border-[#e6b0aa]/30 p-8 shadow-sm text-right space-y-6 max-w-2xl mx-auto"
                >
                  <div className="text-center max-w-lg mx-auto space-y-2 border-b border-[#faf3f0] pb-6">
                    <div className="w-12 h-12 bg-[#f5eae6] rounded-full flex items-center justify-center text-[#c88b8b] mx-auto shadow-sm">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl font-serif font-black text-[#4a3e3d] mt-2">تنشيط وتفعيل مميزات بطاقتك</h2>
                    <p className="text-xs text-[#3a2a29]/70 leading-relaxed font-serif">
                      أدخل كود التفعيل المخصص لترقية حسابك فوراً إلى الباقات الفاخرة وفتح كافة المميزات الحصرية مثل الموسيقى المخصصة وتتبع الحضور اللانهائي.
                    </p>
                  </div>

                  {/* Activation Code Redeem Card */}
                  <div className="bg-[#faf3f0] border border-[#e6b0aa]/40 rounded-2xl p-6 space-y-4">
                    <div>
                      <h3 className="font-bold text-[#4a3e3d] text-sm mb-1.5 flex items-center justify-end gap-1.5 font-serif">
                        <span>تفعيل كود الاشتراك</span>
                        <Check className="h-4 w-4 text-[#c88b8b]" />
                      </h3>
                      <p className="text-[11px] text-[#3a2a29]/80 leading-relaxed">
                        أدخل كود تفعيل الباقة المكون من بادئة <span className="font-mono bg-[#f5eae6] px-1 py-0.5 rounded text-[#c88b8b] font-bold">TEID-OTHMAN-</span> متبوعة بـ 9 أرقام وحروف لتنشيط مميزات الباقة فوراً.
                      </p>
                    </div>
                    
                    <div>
                      <form onSubmit={handleActivateCode} className="flex gap-2">
                        <button
                          type="submit"
                          disabled={activationLoading}
                          className="px-4 py-2.5 rounded-xl bg-[#4a3e3d] text-white hover:bg-[#c88b8b] font-bold text-xs transition cursor-pointer shrink-0 disabled:opacity-50 shadow-sm"
                        >
                          {activationLoading ? "جاري التنشيط..." : "تفعيل الكود"}
                        </button>
                        <input
                          type="text"
                          placeholder="TEID-OTHMAN-XXXXXXXXX"
                          value={activationCodeInput}
                          onChange={(e) => setActivationCodeInput(e.target.value)}
                          className="flex-1 px-3 py-2.5 text-xs border border-[#e6b0aa]/40 bg-white rounded-xl font-mono text-left focus:outline-none focus:ring-1 focus:ring-[#c88b8b] shadow-inner"
                        />
                      </form>

                      {activationError && (
                        <p className="text-red-600 text-[10px] font-bold mt-2 text-right">⚠️ {activationError}</p>
                      )}
                      {activationSuccess && (
                        <p className="text-emerald-600 text-[10px] font-bold mt-2 text-right">🎉 {activationSuccess}</p>
                      )}
                      {!user && (
                        <p className="text-amber-600 text-[10px] mt-2 text-right">💡 يرجى تسجيل الدخول أو إنشاء حساب أولاً لحفظ تفعيل باقتك.</p>
                      )}
                    </div>

                    {/* Technical Support Chat Trigger inside the Card */}
                    <div className="border-t border-[#e6b0aa]/25 pt-4 flex flex-col sm:flex-row-reverse items-center justify-between gap-3 mt-2">
                      <div className="text-right">
                        <p className="text-xs font-bold text-[#4a3e3d] font-serif">هل تواجه مشكلة في تفعيل الكود؟</p>
                        <p className="text-[10px] text-[#3a2a29]/70 font-serif">فريق الدعم المباشر متواجد معك لحل المشاكل وتسهيل عملية الترقية.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsSupportOpen(true)}
                        className="px-4 py-2.5 bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <span>تواصل مع الدعم الفني</span>
                        <MessageCircle className="h-4 w-4" />
                      </button>
                    </div>

                  </div>

                  <div className="text-center pt-2">
                    <p className="text-[10px] text-[#3a2a29]/60 font-serif italic">
                      زفافي AI • جميع الحقوق محفوظة لتصميم رقمي ملكي فاخر
                    </p>
                  </div>
                </motion.div>
              )}

              </AnimatePresence>
            </div>

          </div>

          {/* LEFT SIDE: Interactive Smartphone Preview (5 columns) */}
          <div className="lg:col-span-5 sticky top-24">
            
            {/* Headline title */}
            <div className="mb-3 text-right">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-0.5">معاينة تفاعلية فورية</span>
              <h2 className="text-lg font-bold text-gray-800 flex items-center justify-end gap-1">
                <span>عرض على الهواتف الذكية</span>
                <Smartphone className="h-5 w-5 text-amber-500" />
              </h2>
            </div>

            {/* Simulated smartphone frame styling */}
            <div className="relative mx-auto max-w-[340px] border-[10px] border-slate-900 rounded-[40px] shadow-2xl overflow-hidden aspect-[9/18.5] bg-slate-950">
              
              {/* Smartphone top notch decoration */}
              <div className="absolute top-0 inset-x-0 h-5 bg-slate-900 z-30 flex items-center justify-center rounded-b-2xl">
                <div className="w-16 h-3 bg-black rounded-full" />
              </div>

              {/* Scrollable preview screen */}
              <div className="h-full overflow-y-auto pt-6 pb-4 scrollbar-thin scrollbar-thumb-gray-800">
                {invitation ? (
                  <InvitationCard 
                    invitation={invitation} 
                    onRsvpSubmit={handleRsvpSubmitFromCard}
                    previewMode={true}
                    rsvps={rsvps}
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                    <div className="w-12 h-12 rounded-full border-4 border-dashed border-gray-600 animate-spin mb-4" />
                    <p className="text-xs">جاري تحميل قالب الدعوة...</p>
                  </div>
                )}
              </div>

            </div>

            <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-950 text-xs text-right leading-relaxed flex items-start gap-2.5">
              <p className="flex-1">
                <strong>توجيه مهم:</strong> جميع التعديلات التي تجريها في اليمين تظهر فورًا في معاينة الهاتف الذكي على اليسار. يمكنك اختبار ملء نموذج تأكيد الحضور (RSVP) في الهاتف، وستراه ينعكس مباشرة في لوحة التحكم!
              </p>
              <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            </div>

          </div>

        </div>

      </main>

      {/* Floating Bottom Taskbar / Navigation Menu */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] sm:w-auto max-w-4xl bg-[#4a3e3d]/95 backdrop-blur-md rounded-2xl border border-[#e6b0aa]/30 shadow-[0_15px_35px_rgba(74,62,61,0.35)] px-4 py-2.5 flex flex-row-reverse justify-around sm:justify-center items-center gap-1 sm:gap-4 text-white">
        
        <button
          onClick={() => setActiveTab("ai")}
          className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === "ai"
              ? "bg-[#c88b8b] text-white shadow-md scale-105"
              : "text-[#faf3f0]/70 hover:text-white hover:bg-white/10"
          }`}
        >
          <Sparkles className="h-4 sm:h-5 w-4 sm:w-5" />
          <span className="text-[10px] sm:text-xs font-bold shrink-0 flex items-center gap-1">
            {!isPremiumUser && <Lock className="h-3 w-3 text-amber-400" />}
            الذكاء الاصطناعي
          </span>
        </button>

        <button
          onClick={() => setActiveTab("templates")}
          className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === "templates"
              ? "bg-[#c88b8b] text-white shadow-md scale-105"
              : "text-[#faf3f0]/70 hover:text-white hover:bg-white/10"
          }`}
        >
          <Layout className="h-4 sm:h-5 w-4 sm:w-5" />
          <span className="text-[10px] sm:text-xs font-bold shrink-0 flex items-center gap-1">
            {!isPremiumUser && <Lock className="h-3 w-3 text-amber-400" />}
            معرض القوالب
          </span>
        </button>

        <button
          onClick={() => setActiveTab("customize")}
          className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === "customize"
              ? "bg-[#c88b8b] text-white shadow-md scale-105"
              : "text-[#faf3f0]/70 hover:text-white hover:bg-white/10"
          }`}
        >
          <Settings className="h-4 sm:h-5 w-4 sm:w-5" />
          <span className="text-[10px] sm:text-xs font-bold shrink-0 flex items-center gap-1">
            {!isPremiumUser && <Lock className="h-3 w-3 text-amber-400" />}
            تعديل يدوي
          </span>
        </button>

        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === "dashboard"
              ? "bg-[#c88b8b] text-white shadow-md scale-105"
              : "text-[#faf3f0]/70 hover:text-white hover:bg-white/10"
          }`}
        >
          <Users className="h-4 sm:h-5 w-4 sm:w-5" />
          <span className="text-[10px] sm:text-xs font-bold shrink-0">إدارة الحضور</span>
        </button>

        <button
          onClick={() => setActiveTab("pricing")}
          className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === "pricing"
              ? "bg-[#c88b8b] text-white shadow-md scale-105"
              : "text-[#faf3f0]/70 hover:text-white hover:bg-white/10"
          }`}
        >
          <CreditCard className="h-4 sm:h-5 w-4 sm:w-5" />
          <span className="text-[10px] sm:text-xs font-bold shrink-0">تفعيل الكود</span>
        </button>

      </div>

      {/* Floating Support Chat Component */}
      <SupportChat isOpen={isSupportOpen} setIsOpen={setIsSupportOpen} />

      {/* Payment Checkout Modal dialog */}
      {selectedPlanForPayment && (
        <PaymentModal 
          plan={selectedPlanForPayment}
          onClose={() => setSelectedPlanForPayment(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Premium Authentication Modal (تسجيل دخول / إنشاء حساب) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border border-[#EAE2D5] shadow-2xl w-full max-w-md overflow-hidden text-right">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1A1A1A] to-[#2D2D2D] p-6 text-white relative">
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 left-4 text-white/70 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
              <h3 className="text-xl font-black font-serif">
                {authMode === "login" ? "تسجيل الدخول إلى حسابك" : "إنشاء حساب جديد"}
              </h3>
              <p className="text-xs text-gray-300 mt-1">
                {authMode === "login" ? "مرحباً بك مجدداً! قم بالولوج لتعديل بطاقاتك ومتابعة حضورك." : "قم بالتسجيل لامتلاك وإدارة بطاقات دعوة زفاف ومولودية فاخرة."}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="p-6 space-y-4">
              
              {authMode === "register" && (
                <div>
                  <label className="block text-xs font-serif font-bold text-gray-700 mb-1.5">الاسم الكامل</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: عثمان علي"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg text-xs border border-[#e6b0aa]/40 bg-[#faf3f0] focus:outline-none focus:ring-1 focus:ring-[#c88b8b]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-serif font-bold text-[#3a2a29] mb-1.5">البريد الإلكتروني</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-xs border border-[#e6b0aa]/40 bg-[#faf3f0] focus:outline-none focus:ring-1 focus:ring-[#c88b8b] text-left font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-serif font-bold text-[#3a2a29] mb-1.5">كلمة المرور</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-xs border border-[#e6b0aa]/40 bg-[#faf3f0] focus:outline-none focus:ring-1 focus:ring-[#c88b8b] text-left font-mono"
                />
              </div>

              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-bold text-red-600">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 rounded-xl bg-[#c88b8b] hover:bg-[#4a3e3d] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                {authLoading ? "جاري الاتصال بالفضاء..." : authMode === "login" ? "تسجيل دخول" : "إنشاء حساب"}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === "login" ? "register" : "login");
                    setAuthError(null);
                  }}
                  className="text-xs text-[#c88b8b] hover:underline font-bold"
                >
                  {authMode === "login" ? "ليس لديك حساب؟ سجل الآن" : "لديك حساب بالفعل؟ سجل دخولك"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
