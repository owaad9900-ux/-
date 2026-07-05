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
  Info
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

// Import modular sub-components
import InvitationCard from "./components/InvitationCard";
import AIGenerator from "./components/AIGenerator";
import Dashboard from "./components/Dashboard";
import PaymentModal from "./components/PaymentModal";
import SupportChat from "./components/SupportChat";

export default function App() {
  const [activeTab, setActiveTab] = useState<"ai" | "customize" | "dashboard" | "pricing">("ai");
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
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

  // Loading and Notification States
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<SubscriptionPlan | null>(null);

  // Invitation ID depends on user session for custom separate accounts
  const invitationId = user ? user.inviteId : "user_invitation_2026";

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
    <div className="min-h-screen bg-[#FDFCFB] font-sans text-[#2D2D2D] pb-16">
      
      {/* Top Premium Navbar with Artistic Flair design */}
      <header className="h-20 border-b border-[#EAE2D5] px-4 sm:px-12 flex flex-row-reverse items-center justify-between bg-[#FDFCFB] sticky top-0 z-30 shadow-sm">
        
        {/* Brand Logo Group */}
        <div className="flex flex-row-reverse items-center gap-3">
          <div className="w-10 h-10 bg-[#C5A059] rounded-full flex items-center justify-center text-white text-xl font-serif italic shadow-[0_4px_10px_rgba(197,160,89,0.25)]">
            Z
          </div>
          <div className="text-right">
            <span className="text-2xl font-serif tracking-tighter font-bold text-[#1A1A1A]">زفافي <span className="text-[#C5A059]">AI</span></span>
            <p className="text-[10px] text-[#888] font-serif italic -mt-1">تحفة فنية رقمية لمناسبتك</p>
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
                <span className="text-xs font-bold text-[#1A1A1A] block">{user.name}</span>
                <span className="text-[9px] text-[#888] block">{user.email}</span>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => { setAuthMode("login"); setShowAuthModal(true); }}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#1A1A1A] text-white hover:bg-[#C5A059] hover:shadow-md transition cursor-pointer"
            >
              تسجيل دخول / إنشاء حساب
            </button>
          )}

          <div className="h-6 w-px bg-[#EAE2D5]"></div>

          {currentPlanId === "royal" ? (
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold font-serif border border-[#C5A059] bg-[#F9F7F5] text-[#C5A059] shadow-sm tracking-wide">
              الملكية الفاخرة 👑
            </span>
          ) : currentPlanId === "pro" ? (
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold font-serif border border-[#1A1A1A] bg-[#F9F7F5] text-[#1A1A1A] shadow-sm tracking-wide">
              الاحترافية برو ✨
            </span>
          ) : (
            <span className="px-3.5 py-1.5 rounded-full text-xs font-medium font-serif border border-[#EAE2D5] bg-[#F9F7F5] text-[#666] shadow-sm">
              الباقة المجانية
            </span>
          )}
        </div>

      </header>

      {/* Main Workspace Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Real-time sync status banner with warm gold/beige outline */}
        {saveStatus && (
          <div className="mb-6 p-4 rounded-xl bg-[#F9F7F5] border border-[#C5A059]/30 text-[#C5A059] text-xs font-bold text-right flex items-center justify-end gap-2 shadow-sm">
            <span>{saveStatus}</span>
            <Check className="h-4 w-4 text-[#C5A059] animate-pulse" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* RIGHT SIDE: Controls & Dashboard (7 columns) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Action Navigation Tabs with Artistic beige frame & charcoal indicators */}
            <div className="bg-white p-1.5 rounded-xl border border-[#EAE2D5] shadow-sm flex flex-row-reverse justify-between gap-1 overflow-x-auto">
              
              <button
                onClick={() => setActiveTab("ai")}
                className={`flex-1 py-3 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "ai"
                    ? "bg-[#1A1A1A] text-white shadow-md"
                    : "text-[#666] hover:text-[#1A1A1A] hover:bg-[#F9F7F5]"
                }`}
              >
                <Sparkles className="h-4 w-4" />
                <span>مصمم الذكاء الاصطناعي</span>
              </button>

              <button
                onClick={() => setActiveTab("customize")}
                className={`flex-1 py-3 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "customize"
                    ? "bg-[#1A1A1A] text-white shadow-md"
                    : "text-[#666] hover:text-[#1A1A1A] hover:bg-[#F9F7F5]"
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>تعديل وتخصيص يدوي</span>
              </button>

              <button
                onClick={() => setActiveTab("dashboard")}
                className={`flex-1 py-3 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "dashboard"
                    ? "bg-[#1A1A1A] text-white shadow-md"
                    : "text-[#666] hover:text-[#1A1A1A] hover:bg-[#F9F7F5]"
                }`}
              >
                <Users className="h-4 w-4" />
                <span>إدارة الحضور والتذكير</span>
              </button>

              <button
                onClick={() => setActiveTab("pricing")}
                className={`flex-1 py-3 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "pricing"
                    ? "bg-[#1A1A1A] text-white shadow-md"
                    : "text-[#666] hover:text-[#1A1A1A] hover:bg-[#F9F7F5]"
                }`}
              >
                <CreditCard className="h-4 w-4" />
                <span>باقات الاشتراك</span>
              </button>

            </div>

            {/* TAB PANELS CONTAINER */}
            <div className="transition-all duration-300">
              
              {/* 1. AI Designer Tab */}
              {activeTab === "ai" && (
                <AIGenerator 
                  onGenerationComplete={handleAiGenerationComplete}
                  isLoading={isAiLoading}
                  setIsLoading={setIsAiLoading}
                />
              )}

              {/* 2. Manual Customizer Tab */}
              {activeTab === "customize" && invitation && (
                <div className="bg-white rounded-2xl border border-[#EAE2D5] p-6 shadow-sm text-right space-y-6">
                  
                  <div className="border-b border-[#F0EBE3] pb-4 mb-4">
                    <h2 className="text-lg font-serif font-bold text-[#1A1A1A]">تخصيص تفاصيل البطاقة</h2>
                    <p className="text-xs text-[#888] font-serif italic">قم بتعديل النصوص والخطوط والموسيقى وإحداثيات الموقع مباشرة</p>
                  </div>

                  {/* Section: Type of celebration */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-serif font-bold text-[#666] mb-1.5 uppercase tracking-wide">نوع المناسبة</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateInvitationField({ type: "wedding" })}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                            invitation.type === "wedding" ? "bg-[#F9F7F5] border-[#C5A059] text-[#C5A059]" : "bg-white border-[#EAE2D5] text-[#666]"
                          }`}
                        >
                          <span>زفاف</span>
                          <Heart className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => updateInvitationField({ type: "baby" })}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                            invitation.type === "baby" ? "bg-[#F9F7F5] border-[#C5A059] text-[#C5A059]" : "bg-white border-[#EAE2D5] text-[#666]"
                          }`}
                        >
                          <span>مولود جديد</span>
                          <Baby className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-serif font-bold text-[#666] mb-1.5 uppercase tracking-wide">تأثيرات جسيمات الخلفية</label>
                      <select
                        value={invitation.particlesEffect}
                        onChange={(e) => updateInvitationField({ particlesEffect: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-lg text-xs border border-[#EAE2D5] bg-[#F9F7F5] text-[#2D2D2D] focus:outline-none focus:ring-1 focus:ring-[#C5A059] focus:border-[#C5A059]"
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
                      <label className="block text-xs font-serif font-bold text-[#666] mb-1.5 uppercase tracking-wide">عنوان بطاقة الدعوة</label>
                      <input
                        type="text"
                        value={invitation.title}
                        onChange={(e) => updateInvitationField({ title: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg text-xs border border-[#EAE2D5] bg-[#F9F7F5] text-[#2D2D2D] focus:outline-none focus:ring-1 focus:ring-[#C5A059] focus:border-[#C5A059]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-serif font-bold text-[#666] mb-1.5 uppercase tracking-wide">أسماء أصحاب الحفل</label>
                      <input
                        type="text"
                        value={invitation.names}
                        onChange={(e) => updateInvitationField({ names: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg text-xs border border-[#EAE2D5] bg-[#F9F7F5] text-[#2D2D2D] focus:outline-none focus:ring-1 focus:ring-[#C5A059] focus:border-[#C5A059]"
                      />
                    </div>
                  </div>

                  {/* Opening Quote */}
                  <div>
                    <label className="block text-xs font-serif font-bold text-[#666] mb-1.5 uppercase tracking-wide">الافتتاحية والأبيات الشعرية</label>
                    <textarea
                      rows={2}
                      value={invitation.openingQuote}
                      onChange={(e) => updateInvitationField({ openingQuote: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg text-xs border border-[#EAE2D5] bg-[#F9F7F5] text-[#2D2D2D] leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#C5A059] focus:border-[#C5A059]"
                    />
                  </div>

                  {/* Body text content */}
                  <div>
                    <label className="block text-xs font-serif font-bold text-[#666] mb-1.5 uppercase tracking-wide">النص الرئيسي للدعوة</label>
                    <textarea
                      rows={4}
                      value={invitation.bodyText}
                      onChange={(e) => updateInvitationField({ bodyText: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg text-xs border border-[#EAE2D5] bg-[#F9F7F5] text-[#2D2D2D] leading-relaxed text-right focus:outline-none focus:ring-1 focus:ring-[#C5A059] focus:border-[#C5A059]"
                    />
                  </div>

                  {/* Date, Time & Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-serif font-bold text-[#666] mb-1.5 uppercase tracking-wide">تاريخ المناسبة</label>
                      <input
                        type="date"
                        value={invitation.date}
                        onChange={(e) => updateInvitationField({ date: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg text-xs border border-[#EAE2D5] bg-[#F9F7F5] text-[#2D2D2D] focus:outline-none focus:ring-1 focus:ring-[#C5A059] focus:border-[#C5A059]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-serif font-bold text-[#666] mb-1.5 uppercase tracking-wide">التوقيت والميعاد</label>
                      <input
                        type="time"
                        value={invitation.time}
                        onChange={(e) => updateInvitationField({ time: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg text-xs border border-[#EAE2D5] bg-[#F9F7F5] text-[#2D2D2D] focus:outline-none focus:ring-1 focus:ring-[#C5A059] focus:border-[#C5A059]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-serif font-bold text-[#666] mb-1.5 uppercase tracking-wide">اسم القاعة أو الفندق</label>
                      <input
                        type="text"
                        value={invitation.locationName}
                        onChange={(e) => updateInvitationField({ locationName: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg text-xs border border-[#EAE2D5] bg-[#F9F7F5] text-[#2D2D2D] focus:outline-none focus:ring-1 focus:ring-[#C5A059] focus:border-[#C5A059]"
                      />
                    </div>
                  </div>

                  {/* Font Style & Music Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-serif font-bold text-[#666] mb-1.5 uppercase tracking-wide">نمط ونوع خط الكتابة</label>
                      <select
                        value={invitation.fontStyle}
                        onChange={(e) => updateInvitationField({ fontStyle: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-lg text-xs border border-[#EAE2D5] bg-[#F9F7F5] text-[#2D2D2D] focus:outline-none focus:ring-1 focus:ring-[#C5A059] focus:border-[#C5A059]"
                      >
                        <option value="serif">نسخ / تقليدي فخم (Serif)</option>
                        <option value="sans-serif">رقعة / عصري مريح (Sans)</option>
                        <option value="cursive">فني / ديواني أنيق (Cursive)</option>
                        <option value="mono">رقمي مبسط (Mono)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-serif font-bold text-[#666] mb-1.5 uppercase tracking-wide">لحن الصوت التلقائي (الآلة)</label>
                      <select
                        value={invitation.musicTheme}
                        onChange={(e) => updateInvitationField({ musicTheme: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg text-xs border border-[#EAE2D5] bg-[#F9F7F5] text-[#2D2D2D] focus:outline-none focus:ring-1 focus:ring-[#C5A059] focus:border-[#C5A059]"
                      >
                        <option value="royal-instrumental">عزف ملكي فاخر (Fanfare)</option>
                        <option value="soft-piano">بيانو رقيق (Soft Piano)</option>
                        <option value="sweet-lullaby">تهويدة مولود دافئة (Lullaby)</option>
                        <option value="ambient-nature">أجواء طبيعية هادئة (Ambient)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-serif font-bold text-[#666] mb-1.5 uppercase tracking-wide">موسيقى مخصصة (رابط)</label>
                      <input
                        type="text"
                        placeholder="رابط ملف mp3 مخصص"
                        value={invitation.musicUrl || ""}
                        onChange={(e) => updateInvitationField({ musicUrl: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg text-xs border border-[#EAE2D5] bg-[#F9F7F5] text-[#2D2D2D] focus:outline-none focus:ring-1 focus:ring-[#C5A059] focus:border-[#C5A059]"
                      />
                    </div>
                  </div>

                  {/* YouTube Video URL */}
                  <div>
                    <label className="block text-xs font-serif font-bold text-[#666] mb-1.5 flex items-center justify-end gap-1 uppercase tracking-wide">
                      <span>إضافة رابط فيديو ترحيبي خاص (من يوتيوب)</span>
                      <Video className="h-4 w-4 text-[#C5A059]" />
                    </label>
                    <input
                      type="text"
                      placeholder="https://www.youtube.com/watch?v=xxxxxx"
                      value={invitation.videoUrl || ""}
                      onChange={(e) => updateInvitationField({ videoUrl: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg text-xs border border-[#EAE2D5] bg-[#F9F7F5] text-[#2D2D2D] text-left font-mono focus:outline-none focus:ring-1 focus:ring-[#C5A059] focus:border-[#C5A059]"
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

                </div>
              )}

              {/* 3. Guest Dashboard Tab */}
              {activeTab === "dashboard" && (
                <Dashboard 
                  rsvps={rsvps}
                  reminders={reminders}
                  onAddRsvp={handleAddRsvp}
                  onDeleteRsvp={handleDeleteRsvp}
                  onSendReminder={handleSendReminder}
                  viewsCount={viewsCount}
                />
              )}

              {/* 4. Pricing Subscriptions Tab */}
              {activeTab === "pricing" && (
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm text-right space-y-8">
                  
                  <div className="text-center max-w-xl mx-auto">
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-2 font-serif">باقات الاشتراك المرنة والذكية</h2>
                    <p className="text-xs sm:text-sm text-gray-500">
                      اختر الباقة المناسبة لحفلتك، واستمتع بتصميم حائز على أرقى الجوائز مع تتبع آلي ذكي للحاضرين.
                    </p>
                  </div>

                  {/* Activation Code Redemption Panel */}
                  <div className="max-w-xl mx-auto w-full">
                    {/* Activation Code Redeem Card */}
                    <div className="bg-[#FDFCFB] border border-[#EAE2D5] rounded-2xl p-6 text-right space-y-4">
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm mb-1.5 flex items-center justify-end gap-1.5">
                          <span>تفعيل كود الاشتراك</span>
                          <Check className="h-4 w-4 text-[#C5A059]" />
                        </h3>
                        <p className="text-[11px] text-[#666] leading-relaxed">
                          أدخل كود تفعيل الباقة المكون من بادئة <span className="font-mono bg-amber-50 px-1 py-0.5 rounded text-amber-700 font-bold">TEID-OTHMAN-</span> متبوعة بـ 9 أرقام وحروف لتنشيط مميزات الباقة فوراً.
                        </p>
                      </div>
                      
                      <div>
                        <form onSubmit={handleActivateCode} className="flex gap-2">
                          <button
                            type="submit"
                            disabled={activationLoading}
                            className="px-4 py-2 rounded-lg bg-[#1A1A1A] text-white hover:bg-[#C5A059] font-bold text-xs transition cursor-pointer shrink-0 disabled:opacity-50"
                          >
                            {activationLoading ? "جاري..." : "تفعيل"}
                          </button>
                          <input
                            type="text"
                            placeholder="TEID-OTHMAN-XXXXXXXXX"
                            value={activationCodeInput}
                            onChange={(e) => setActivationCodeInput(e.target.value)}
                            className="flex-1 px-3 py-2 text-xs border border-[#EAE2D5] bg-white rounded-lg font-mono text-left focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                          />
                        </form>

                        {activationError && (
                          <p className="text-red-600 text-[10px] font-bold mt-1.5">{activationError}</p>
                        )}
                        {activationSuccess && (
                          <p className="text-emerald-600 text-[10px] font-bold mt-1.5">{activationSuccess}</p>
                        )}
                        {!user && (
                          <p className="text-amber-600 text-[10px] mt-1.5">💡 يرجى تسجيل الدخول أو إنشاء حساب أولاً لحفظ تفعيل باقتك.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                    {SUBSCRIPTION_PLANS.map((plan) => (
                      <div 
                        key={plan.id}
                        className={`rounded-2xl border-2 p-5 flex flex-col justify-between transition-all hover:scale-[1.02] ${plan.color}`}
                      >
                        {plan.isPopular && (
                          <div className="absolute top-0 right-1/2 transform translate-x-1/2 -translate-y-1/2 bg-amber-500 text-white font-bold text-[10px] uppercase px-3 py-1 rounded-full shadow-md">
                            الخيار الموصى به
                          </div>
                        )}

                        <div>
                          <h3 className="font-extrabold text-base mb-1 text-right">{plan.name}</h3>
                          <div className="flex items-baseline justify-end gap-1 my-3">
                            <span className="text-3xl font-black">${plan.price}</span>
                            <span className="text-xs text-gray-500">/{plan.period}</span>
                          </div>

                          <div className="h-px bg-gray-100 my-4" />

                          <ul className="space-y-2 text-xs text-gray-600 mb-6 text-right">
                            {plan.features.map((feat, index) => (
                              <li key={index} className="flex flex-row-reverse items-start gap-1.5 leading-relaxed">
                                <span className="text-emerald-500 text-sm mt-0.5">✓</span>
                                <span className="flex-1">{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {currentPlanId === plan.id ? (
                          <button
                            disabled
                            className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-500 font-bold text-xs"
                          >
                            باقتك الحالية نشطة
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedPlanForPayment(plan)}
                            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                          >
                            اشترك الآن بالباقة
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

      {/* Floating Support Chat Component */}
      <SupportChat />

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
                    className="w-full px-3 py-2.5 rounded-lg text-xs border border-[#EAE2D5] bg-[#FDFCFB] focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-serif font-bold text-[#2D2D2D] mb-1.5">البريد الإلكتروني</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-xs border border-[#EAE2D5] bg-[#FDFCFB] focus:outline-none focus:ring-1 focus:ring-[#C5A059] text-left font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-serif font-bold text-[#2D2D2D] mb-1.5">كلمة المرور</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-xs border border-[#EAE2D5] bg-[#FDFCFB] focus:outline-none focus:ring-1 focus:ring-[#C5A059] text-left font-mono"
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
                className="w-full py-3 rounded-xl bg-[#C5A059] hover:bg-[#1A1A1A] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
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
                  className="text-xs text-[#C5A059] hover:underline font-bold"
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
