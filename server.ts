import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where 
} from "firebase/firestore";

dotenv.config();

// Load Firebase configuration
const firebaseConfig = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "firebase-applet-config.json"), "utf8")
);
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Dynamic Telegram Webhook Self-Registration across different deployment environments
  const registeredWebhooks = new Set<string>();
  async function registerTelegramWebhook(appUrl: string) {
    if (registeredWebhooks.has(appUrl)) return;
    const token = "8789851822:AAEzFmOUrP2Ap35Ztey6TNQZ2NYb-W3ULSE";
    const webhookUrl = `${appUrl}/api/telegram-webhook`;
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}`);
      const data: any = await res.json();
      console.log(`Telegram Webhook Registration for ${webhookUrl}:`, data);
      if (data.ok) {
        registeredWebhooks.add(appUrl);
      }
    } catch (err) {
      console.error("Error setting Telegram Webhook:", err);
    }
  }

  // Intercept requests to trigger self-registration dynamically on first load
  app.use((req, res, next) => {
    const host = req.get("host");
    if (host && !host.includes("localhost") && !host.includes("127.0.0.1") && !host.includes("0.0.0.0")) {
      const protocol = req.headers["x-forwarded-proto"] || "https";
      let appUrl = `${protocol}://${host}`;
      // CRITICAL: Replace 'ais-dev-' (private/authenticated developer environment) with 'ais-pre-' (public preview environment)
      // This ensures Telegram can send webhook updates to our public endpoint which routes to this exact same container.
      if (host.includes("ais-dev-")) {
        appUrl = appUrl.replace("ais-dev-", "ais-pre-");
      }
      registerTelegramWebhook(appUrl).catch(console.error);
    }
    next();
  });

  // Lazy initialize Gemini AI client
  let aiClient: GoogleGenAI | null = null;
  function getAi(): GoogleGenAI {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not defined. Please add it to your secrets or environment variables.");
      }
      aiClient = new GoogleGenAI({ 
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return aiClient;
  }

  // API: AI Invitation Generation
  app.post("/api/generate-invitation", async (req, res) => {
    try {
      const { type, style, names, date, location, tone, extraInfo } = req.body;

      if (!type || !names) {
        return res.status(400).json({ error: "Type and Names are required" });
      }

      const prompt = `
        You are an elite expert in designing luxury, modern, and interactive digital invitations for weddings (زفاف) and newborn events (مولود/مواليد) in Arabic.
        Generate a highly professional, beautiful digital invitation design config and poetic/elegant invitation text based on:
        - Event Type: ${type} (wedding or newborn)
        - Design Style: ${style || "modern"} (supported styles: modern, traditional, royal, minimalist, floral, or Disney's Lilo & Stitch themed styles: 'stitch-ohana', 'stitch-angel-romance', 'stitch-baby-shower', 'stitch-cosmic-night')
        - Host/Guest Names: ${names}
        - Event Date: ${date || "not specified"}
        - Location details: ${location || "not specified"}
        - Tone: ${tone || "poetic and warm"} (poetic, formal, simple, cheerful)
        - Additional info: ${extraInfo || "none"}

        SPECIAL DESIGN RULES FOR LILO & STITCH (ستيتش) STYLES:
        If style is stitch-themed (contains "stitch" or "ستيتش") or the user requests Stitch, design a delightful, playful Disney Lilo & Stitch tropical or cosmic space themed invitation card in Arabic:
        1. The text should have cute references to Lilo, Stitch, Angel, or the Ohana family concept (e.g. "أوهانا تعني العائلة، والعائلة تعني ألا يُترك أحد أو يُنسى 💙").
        2. Set colors beautifully:
           - for 'stitch-ohana': background="#0c2240" (deep navy), primary="#00a2ff" (stitch blue), secondary="#ff4b91" (hibiscus pink), text="#f0fdf4" (minty white), accent="#ffd700" (pineapple gold).
           - for 'stitch-angel-romance': background="#fff1f2" (rose pastel), primary="#ec4899" (angel deep pink), secondary="#3b82f6" (stitch sky blue), text="#312e81" (dark indigo), accent="#facc15" (star gold).
           - for 'stitch-baby-shower': background="#f0f9ff" (pale water blue), primary="#0ea5e9" (sky blue), secondary="#f472b6" (bubblegum pink), text="#0369a1" (ocean blue), accent="#fef08a" (lemon yellow).
           - for 'stitch-cosmic-night': background="#020617" (cosmic dark), primary="#38bdf8" (electric cyan), secondary="#a21caf" (starry magenta), text="#f8fafc" (starlight white), accent="#38bdf8" (galaxy glow).
        3. Set particlesEffect to either 'stitch-bubbles', 'tropical-leaves', or 'baby-stars'.
        4. Set splashStyle to either 'stitch-ears', 'stitch-cute', or 'ohana-gate'.

        Your response must be a valid JSON object only. Do not wrap in markdown quotes. The JSON must have exactly the following structure:
        {
          "title": "A short elegant main title for the card in Arabic (e.g. 'دعوة زفاف مريم وأحمد' or 'مرحباً بطفلنا الصغير' or 'دعوة ميلاد ستيتش الاستوائية المبهجة')",
          "openingQuote": "A beautiful, deeply emotional opening quote or Quranic verse/poem/Ohana quote fitting the event",
          "bodyText": "The full body of the invitation card, written in highly professional, luxurious Arabic. It must contain the names, date, and location beautifully written.",
          "closingQuote": "A warm closing greeting (e.g., 'حضوركم يكتمل به فرحنا')",
          "colors": {
            "background": "Hex color code fitting the selected style",
            "primary": "Hex color code for primary buttons/accents",
            "secondary": "Hex color code for secondary elements",
            "text": "Hex color code for readability against the background",
            "accent": "Hex color code for beautiful highlight/glow effects"
          },
          "fontStyle": "One of: 'serif' (for traditional/royal), 'sans-serif' (for clean modern), 'cursive' (for artistic/cute), 'mono' (for experimental/minimalist/cosmic)",
          "musicTheme": "Suggested background music style: 'royal-instrumental' or 'soft-piano' or 'traditional-arabic' or 'sweet-lullaby' or 'ambient-nature'",
          "particlesEffect": "Suggested decorative background particles: 'gold-dust' or 'rose-petals' or 'baby-stars' or 'stitch-bubbles' or 'tropical-leaves' or 'none'",
          "splashStyle": "Suggested welcome screen design: 'envelope' or 'wax-seal' or 'royal-curtain' or 'glowing-star' or 'matte-glass' or 'classical-gate' or 'floral-vignette' or 'bohemian-arch' or 'vintage-lace' or 'starry-night' or 'stitch-ears' or 'stitch-cute' or 'ohana-gate'",
          "splashWelcomeText": "A warm welcome greeting displayed on the starting gate screen (e.g. 'أوهانا ترحب بكم في عالم ستيتش الأزرق! 💙')",
          "splashButtonText": "Label for the open card button (e.g. 'افتح ظرف ستيتش اللطيف ✉️' or 'افتح دعوة ستيتش وأنجل الوردي 🌸')"
        }
      `;

      const ai = getAi();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text || "{}";
      const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const result = JSON.parse(cleanedText);

      return res.json(result);
    } catch (error: any) {
      console.error("AI Generation Error:", error);
      // Return a beautiful fallback if there's an issue with API key or other things
      const isStitch = String(req.body.style).includes("stitch") || String(req.body.names).includes("ستيتش") || String(req.body.extraInfo).includes("ستيتش");
      
      return res.status(200).json({
        isFallback: true,
        apiError: error.message || String(error),
        title: isStitch 
          ? "دعوة ميلاد ستيتش الاستوائية المبهجة (ثيم أوهانا) 🌺" 
          : req.body.type === "wedding" ? "دعوة زفاف مميزة" : "دعوة استقبال مولود جديد",
        openingQuote: isStitch
          ? "«أوهانا تعني العائلة، والعائلة تعني ألا يُترك أحد أو يُنسى» 💙"
          : req.body.type === "wedding" ? "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا" : "الْمالُ وَالْبَنُونَ زِينَةُ الْحَياةِ الدُّنْيا",
        bodyText: isStitch
          ? `يسعدنا جداً دعوتكم لحضور حفلة استقبال وعيد ميلاد ابننا الغالي (${req.body.names || "يوسف"}) المليئة بالبهجة والمرح الاستوائي بطابع وحش ديزني اللطيف ستيتش! حضوركم سيزيدنا فرحاً وسعادة لا تُنسى في هذه الليلة الاستثنائية.`
          : `بكل الحب والتقدير، ندعوكم لمشاركتنا فرحتنا الكبرى بمناسبة ${req.body.type === "wedding" ? "حفل زفاف" : "استقبال مولودنا"} الغالي: ${req.body.names}، وذلك بمشيئة الله يوم ${req.body.date || "المحدد"} في ${req.body.location || "القاعة الكبرى"}. حضوركم تكتمل به فرحتنا ويزيدنا سروراً وعزاً.`,
        closingQuote: "ودامت دياركم مكللة بالأفراح والمسرات",
        colors: isStitch 
          ? {
              background: "#0c2240",
              primary: "#00a2ff",
              secondary: "#ff4b91",
              text: "#f0fdf4",
              accent: "#ffd700"
            }
          : {
              background: req.body.style === "royal" ? "#1a2a1d" : "#fbf8f3",
              primary: "#c5a880",
              secondary: "#2c4a3e",
              text: req.body.style === "royal" ? "#fbf8f3" : "#2c4a3e",
              accent: "#d4af37"
            },
        fontStyle: isStitch ? "cursive" : "serif",
        musicTheme: isStitch ? "sweet-lullaby" : req.body.type === "wedding" ? "royal-instrumental" : "sweet-lullaby",
        particlesEffect: isStitch ? "stitch-bubbles" : req.body.type === "wedding" ? "gold-dust" : "baby-stars",
        splashStyle: isStitch ? "stitch-ears" : req.body.type === "wedding" ? "envelope" : "glowing-star",
        splashWelcomeText: isStitch ? "أوهانا ترحب بكم في عالم ستيتش الأزرق! 💙" : "مرحباً بكم في حفلنا البهيج ✨",
        splashButtonText: isStitch ? "افتح ظرف ستيتش اللطيف ✉️" : "افتح كارت الدعوة اللطيف ✉️"
      });
    }
  });

  // API: Simulate sending WhatsApp/SMS reminder
  app.post("/api/send-reminder-simulation", (req, res) => {
    const { inviteId, guestName, guestPhone, time, message } = req.body;
    if (!guestName || !guestPhone) {
      return res.status(400).json({ error: "Guest name and phone are required" });
    }
    // Simulate scheduling/sending a reminder
    return res.json({
      success: true,
      messageId: "msg_" + Math.random().toString(36).substring(2, 9),
      sentAt: new Date().toISOString(),
      status: "delivered",
      details: `تمت محاكاة إرسال تذكير عبر واتساب للضيف ${guestName} بنجاح إلى الرقم ${guestPhone}.`
    });
  });

  // API: User Registration
  app.post("/api/register", async (req, res) => {
    try {
      const { email, password, name } = req.body;
      console.log("Registration attempt: ", { email, name });
      if (!email || !password || !name) {
        console.warn("Registration missing fields:", { email, name, hasPassword: !!password });
        return res.status(400).json({ error: "جميع الحقول مطلوبة" });
      }

      const emailKey = email.trim().toLowerCase();
      const userDocRef = doc(db, "users", emailKey);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        console.warn("Registration error: Email already registered:", emailKey);
        return res.status(400).json({ error: "البريد الإلكتروني مسجل بالفعل!" });
      }

      // Create User
      const newUser = {
        email: emailKey,
        password,
        name: name.trim(),
        planId: "free",
        activatedCode: null,
        createdAt: new Date().toISOString()
      };
      await setDoc(userDocRef, newUser);
      console.log("Registration: User document written successfully");

      // Create a default custom invitation for this user
      const inviteId = `invite_${emailKey.replace(/[^a-zA-Z0-9]/g, "_")}`;
      const inviteDocRef = doc(db, "invitations", inviteId);
      
      await setDoc(inviteDocRef, {
        id: inviteId,
        type: "wedding",
        style: "royal",
        title: "دعوة زفاف فاخرة",
        names: "عريس وعروس",
        date: "2026-08-15",
        time: "08:00 مساءً",
        locationName: "قاعة أفراح الورد بجدة",
        locationCoordinates: { lat: 21.4858, lng: 39.1925 },
        locationUrl: "https://maps.google.com",
        openingQuote: "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً",
        bodyText: "نتشرف بدعوتكم لحضور حفل زفافنا الميمون ومشاركتنا فرحتنا وسرورنا. حضوركم يزدنا بهجة وسعادة.",
        closingQuote: "ودامت دياركم مكللة بالأفراح والمسرات",
        colors: {
          background: "#1a2a1d",
          primary: "#c5a880",
          secondary: "#2c4a3e",
          text: "#fbf8f3",
          accent: "#d4af37"
        },
        fontStyle: "serif",
        musicTheme: "royal-instrumental",
        particlesEffect: "gold-dust",
        createdAt: new Date().toISOString(),
        status: "active",
        viewsCount: 138,
        ownerEmail: emailKey
      });
      console.log("Registration: Default invitation document written successfully with ID:", inviteId);

      return res.json({
        success: true,
        user: {
          email: emailKey,
          name: newUser.name,
          planId: "free",
          inviteId
        }
      });
    } catch (error: any) {
      console.error("Registration Error:", error);
      return res.status(500).json({ error: "حدث خطأ أثناء إنشاء الحساب: " + (error.message || String(error)) });
    }
  });

  // API: User Login
  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log("Login attempt:", { email });
      if (!email || !password) {
        return res.status(400).json({ error: "يرجى إدخال البريد الإلكتروني وكلمة المرور" });
      }

      const emailKey = email.trim().toLowerCase();
      const userDocRef = doc(db, "users", emailKey);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        console.warn("Login warning: User not found:", emailKey);
        return res.status(400).json({ error: "الحساب غير موجود!" });
      }

      const userData = userDoc.data();
      if (userData.password !== password) {
        console.warn("Login warning: Incorrect password for:", emailKey);
        return res.status(400).json({ error: "كلمة المرور غير صحيحة!" });
      }

      const inviteId = `invite_${emailKey.replace(/[^a-zA-Z0-9]/g, "_")}`;
      console.log("Login success for user:", emailKey);

      return res.json({
        success: true,
        user: {
          email: emailKey,
          name: userData.name,
          planId: userData.planId || "free",
          activatedCode: userData.activatedCode || null,
          inviteId
        }
      });
    } catch (error: any) {
      console.error("Login Error:", error);
      return res.status(500).json({ error: "حدث خطأ أثناء تسجيل الدخول: " + (error.message || String(error)) });
    }
  });

  // API: Activate plan via code
  app.post("/api/activate-code", async (req, res) => {
    try {
      const { email, code } = req.body;
      if (!email || !code) {
        return res.status(400).json({ error: "البريد الإلكتروني وكود التفعيل مطلوبان" });
      }

      const emailKey = email.trim().toLowerCase();
      const codeKey = code.trim().toUpperCase();

      const codeDocRef = doc(db, "activation_codes", codeKey);
      const codeDoc = await getDoc(codeDocRef);

      if (!codeDoc.exists()) {
        return res.status(400).json({ error: "كود التفعيل المدخل غير صحيح أو غير متوفر!" });
      }

      const codeData = codeDoc.data();
      if (codeData.used) {
        return res.status(400).json({ error: "كود التفعيل هذا تم استخدامه مسبقاً لحساب آخر!" });
      }

      // Check user existence
      const userDocRef = doc(db, "users", emailKey);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        return res.status(400).json({ error: "الحساب المستخدم لتفعيل الكود غير موجود!" });
      }

      // Update code status
      const now = new Date().toISOString();
      await updateDoc(codeDocRef, {
        used: true,
        usedBy: emailKey,
        usedAt: now
      });

      // Update user subscription
      await updateDoc(userDocRef, {
        planId: codeData.plan,
        activatedCode: codeKey
      });

      return res.json({
        success: true,
        planId: codeData.plan,
        code: codeKey
      });
    } catch (error: any) {
      console.error("Activation Code Error:", error);
      return res.status(500).json({ error: "حدث خطأ أثناء تفعيل الكود" });
    }
  });

  // API: Generate code manually via website
  app.post("/api/generate-code-manual", async (req, res) => {
    try {
      const { plan } = req.body;
      if (plan !== "pro" && plan !== "royal") {
        return res.status(400).json({ error: "نوع الباقة المطلوب غير صحيح" });
      }

      const codeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let randomPart = "";
      for (let i = 0; i < 9; i++) {
        randomPart += codeChars.charAt(Math.floor(Math.random() * codeChars.length));
      }
      const fullCode = `TEID-OTHMAN-${randomPart}`;

      const codeDocRef = doc(db, "activation_codes", fullCode);
      await setDoc(codeDocRef, {
        code: fullCode,
        plan,
        used: false,
        usedBy: null,
        usedAt: null,
        createdAt: new Date().toISOString()
      });

      return res.json({
        success: true,
        code: fullCode,
        plan
      });
    } catch (error: any) {
      console.error("Manual Code Generation Error:", error);
      return res.status(500).json({ error: "حدث خطأ أثناء توليد الكود" });
    }
  });

  // API: Telegram Webhook Diagnostic Info
  app.get("/api/telegram-webhook-info", async (req, res) => {
    const token = "8789851822:AAEzFmOUrP2Ap35Ztey6TNQZ2NYb-W3ULSE";
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
      const data = await response.json();
      return res.json({
        success: true,
        registeredWebhooks: Array.from(registeredWebhooks),
        webhookInfo: data
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message
      });
    }
  });

  // Shared Telegram Message Processor
  async function processTelegramUpdate(update: any) {
    const token = "8789851822:AAEzFmOUrP2Ap35Ztey6TNQZ2NYb-W3ULSE";
    try {
      if (!update || !update.message) {
        return;
      }

      const chatId = update.message.chat.id;
      const text = update.message.text ? update.message.text.trim() : "";
      const lowerText = text.toLowerCase();
      const userFirstName = update.message.from?.first_name || "عزيزي";

      const sendTelegramMessage = async (msgText: string) => {
        try {
          await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: msgText,
              parse_mode: "Markdown"
            })
          });
        } catch (err) {
          console.error("Error sending message to Telegram:", err);
        }
      };

      if (lowerText.startsWith("/start") || lowerText.startsWith("/help")) {
        const welcomeMessage = 
          `مرحباً بك يا ${userFirstName} في بوت إدارة تفعيل الباقات! 🌸✨\n\n` +
          `التعليمات المتاحة للتحكم وتوليد الأكواد:\n` +
          `🔑 لإنشاء كود تفعيل لباقة برو (Pro):\n` +
          `/generate_pro\n\n` +
          `👑 لإنشاء كود تفعيل لباقة رويال الملكية (Royal):\n` +
          `/generate_royal\n\n` +
          `📊 لعرض إحصائيات التفعيلات والأكواد في قاعدة البيانات:\n` +
          `/status`;
        await sendTelegramMessage(welcomeMessage);
      } else if (lowerText.startsWith("/generate_pro") || lowerText.startsWith("/generatepro")) {
        const codeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let randomPart = "";
        for (let i = 0; i < 9; i++) {
          randomPart += codeChars.charAt(Math.floor(Math.random() * codeChars.length));
        }
        const fullCode = `TEID-OTHMAN-${randomPart}`;

        const codeDocRef = doc(db, "activation_codes", fullCode);
        await setDoc(codeDocRef, {
          code: fullCode,
          plan: "pro",
          used: false,
          usedBy: null,
          usedAt: null,
          createdAt: new Date().toISOString()
        });

        const replyMsg = 
          `🔑 *تم توليد كود تفعيل باقة برو (Pro) بنجاح!*\n\n` +
          `الكود: \`${fullCode}\`\n\n` +
          `_(اضغط على الكود لنسخه مباشرة في التطبيق ومشاركته مع العميل)_`;
        await sendTelegramMessage(replyMsg);
      } else if (lowerText.startsWith("/generate_royal") || lowerText.startsWith("/generateroyal")) {
        const codeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let randomPart = "";
        for (let i = 0; i < 9; i++) {
          randomPart += codeChars.charAt(Math.floor(Math.random() * codeChars.length));
        }
        const fullCode = `TEID-OTHMAN-${randomPart}`;

        const codeDocRef = doc(db, "activation_codes", fullCode);
        await setDoc(codeDocRef, {
          code: fullCode,
          plan: "royal",
          used: false,
          usedBy: null,
          usedAt: null,
          createdAt: new Date().toISOString()
        });

        const replyMsg = 
          `👑 *تم توليد كود تفعيل باقة رويال الملكية (Royal) بنجاح!*\n\n` +
          `الكود: \`${fullCode}\`\n\n` +
          `_(اضغط على الكود لنسخه مباشرة في التطبيق ومشاركته مع العميل)_`;
        await sendTelegramMessage(replyMsg);
      } else if (lowerText.startsWith("/status")) {
        const codesCol = collection(db, "activation_codes");
        const codesSnapshot = await getDocs(codesCol);
        let total = 0;
        let used = 0;
        let unused = 0;
        
        codesSnapshot.forEach((doc) => {
          const data = doc.data();
          total++;
          if (data.used) {
            used++;
          } else {
            unused++;
          }
        });

        const statsMsg = 
          `📊 *إحصائيات أكواد التفعيل الحالية:*\n\n` +
          `- إجمالي الأكواد المولّدة: \`${total}\`\n` +
          `- الأكواد غير المستخدمة (صالحة): \`${unused}\`\n` +
          `- الأكواد المستخدمة والمفعّلة: \`${used}\``;
        await sendTelegramMessage(statsMsg);
      } else {
        await sendTelegramMessage("⚠️ عذراً، الأمر غير معروف. اكتب /help لعرض قائمة الأوامر المتاحة.");
      }

    } catch (err: any) {
      const errorMsg = `[${new Date().toISOString()}] Error in processTelegramUpdate: ${err.stack || err.message || err}\n`;
      console.error(errorMsg);
      fs.appendFileSync(path.join(process.cwd(), "bot-debug.log"), errorMsg);
    }
  }

  // API: Telegram Webhook handler
  app.post("/api/telegram-webhook", async (req, res) => {
    try {
      const update = req.body;
      console.log("Incoming Telegram Update via Webhook:", JSON.stringify(update));
      fs.appendFileSync(path.join(process.cwd(), "bot-debug.log"), `[${new Date().toISOString()}] Incoming webhook update: ${JSON.stringify(update)}\n`);
      await processTelegramUpdate(update);
    } catch (err: any) {
      console.error("Webhook Route Error:", err);
      fs.appendFileSync(path.join(process.cwd(), "bot-debug.log"), `[${new Date().toISOString()}] Webhook route error: ${err.message}\n`);
    }
    return res.status(200).send("OK");
  });

  // Background Long Polling Loop for the bot
  async function startTelegramPolling() {
    const token = "8789851822:AAEzFmOUrP2Ap35Ztey6TNQZ2NYb-W3ULSE";
    console.log("Telegram Polling: Deleting webhook to switch to polling...");
    fs.appendFileSync(path.join(process.cwd(), "bot-debug.log"), `[${new Date().toISOString()}] Telegram Polling: Starting bot polling...\n`);
    try {
      await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`);
    } catch (err: any) {
      console.error("Error deleting webhook:", err);
      fs.appendFileSync(path.join(process.cwd(), "bot-debug.log"), `[${new Date().toISOString()}] Error deleting webhook: ${err.message}\n`);
    }

    let offset = 0;
    console.log("Telegram Polling: Bot Polling loop started!");
    
    while (true) {
      try {
        const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&timeout=30`);
        if (!response.ok) {
          throw new Error(`Telegram API returned status ${response.status}`);
        }
        const data: any = await response.json();
        if (data.ok && data.result && data.result.length > 0) {
          for (const update of data.result) {
            fs.appendFileSync(path.join(process.cwd(), "bot-debug.log"), `[${new Date().toISOString()}] Polled update: ${JSON.stringify(update)}\n`);
            await processTelegramUpdate(update);
            offset = update.update_id + 1;
          }
        }
      } catch (err: any) {
        console.error("Error in Telegram Polling loop:", err.message || err);
        fs.appendFileSync(path.join(process.cwd(), "bot-debug.log"), `[${new Date().toISOString()}] Polling loop error: ${err.message || err}\n`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Run Long Polling in the background (will function in both dev & shared environments)
  startTelegramPolling().catch((err) => console.error("Long Polling Crash:", err));


  // Serve static assets in production, mount Vite in dev
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
