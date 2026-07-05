import { Invitation } from "../types";

export const DEFAULT_TEMPLATES: Omit<Invitation, "id" | "createdAt">[] = [
  {
    type: "wedding",
    style: "royal",
    title: "دعوة زفاف ملكية فاخرة",
    names: "عبد الرحمن & مريم",
    date: "2026-09-18",
    time: "20:00",
    locationName: "قاعة ليلتي الكبرى - الرياض",
    locationCoordinates: { lat: 24.7136, lng: 46.6753 },
    locationUrl: "https://maps.google.com/?q=24.7136,46.6753",
    openingQuote: "«وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً»",
    bodyText: "بكل معاني الود والتقدير وتحت ظلال الفرح والسرور، تتشرف عائلاتنا الكريمة بدعوتكم لحضور حفل الزفاف الميمون لقرتي أعيننا (عبد الرحمن ومريم)، وذلك بمشيئة الله تعالى مساء يوم الجمعة الموافق 18 سبتمبر 2026م. حضوركم يزيد أفراحنا بهجةً وضياء.",
    closingQuote: "ودامت دياركم مأهولةً بالأفراح والمسرات والبهجة السعيدة.",
    colors: {
      background: "#12261e", // Dark emerald green
      primary: "#d4af37",    // Luxury Gold
      secondary: "#1f4436",  // Lighter emerald green
      text: "#f9f6f0",       // Cream white
      accent: "#e5c158"      // Bright Gold
    },
    fontStyle: "serif",
    musicTheme: "royal-instrumental",
    particlesEffect: "gold-dust",
    status: "active"
  },
  {
    type: "wedding",
    style: "floral",
    title: "دعوة زفاف الزهور العصرية",
    names: "أحمد & فاطمة",
    date: "2026-10-05",
    time: "19:30",
    locationName: "فندق فورسيزونز - جدة",
    locationCoordinates: { lat: 21.5433, lng: 39.1728 },
    locationUrl: "https://maps.google.com/?q=21.5433,39.1728",
    openingQuote: "يجمعنا الحب وتكتمل سعادتنا برؤية وجوهكم الكريمة تبتسم في ليلتنا المنتظرة.",
    bodyText: "بقلوب ملؤها المحبة وأهازيج الفرح والود، نتشرف بدعوتكم الكريمة لحضور حفل زفافنا الميمون (أحمد وفاطمة)، لنسطر معاً بداية قصة جديدة مكللة بالوفاء والمسرات، وذلك في تمام الساعة السابعة والنصف مساء يوم الإثنين الموافق 5 أكتوبر 2026م. شرفنا حضوركم المبارك.",
    closingQuote: "حضوركم شرف عظيم، ونور يضيء محافلنا السعيدة.",
    colors: {
      background: "#faf3f0", // Soft cream pink
      primary: "#c88b8b",    // Rose gold dusty pink
      secondary: "#4a3e3d",  // Deep charcoal
      text: "#3a2a29",       // Charcoal brown
      accent: "#e6b0aa"      // Peach highlight
    },
    fontStyle: "cursive",
    musicTheme: "soft-piano",
    particlesEffect: "rose-petals",
    status: "active"
  },
  {
    type: "baby",
    style: "modern",
    title: "دعوة استقبال المولودة الجديدة",
    names: "المولودة تالا",
    date: "2026-08-12",
    time: "16:00",
    locationName: "صالة الجوري للمناسبات - دبي",
    locationCoordinates: { lat: 25.2048, lng: 55.2708 },
    locationUrl: "https://maps.google.com/?q=25.2048,55.2708",
    openingQuote: "«الْمَالُ وَالْبَنُونَ زِينَةُ الْحَيَاةِ الدُّنْيَا» .. هلت علينا بشائر الفرح بقدوم أميرتنا الصغيرة.",
    bodyText: "الحمد لله الذي بنعمته تتم الصالحات، بقلوب تملؤها البهجة والسرور وبفضل كريم من رب العالمين، يسعدنا أن ندعوكم لمشاركتنا حفل استقبال مولودتنا الغالية (تالا) لتكتمل فرحتنا بوجودكم ورؤيتكم الميمونة، يوم السبت الموافق 12 أغسطس 2026م ابتداءً من الساعة الرابعة عصراً.",
    closingQuote: "شكر الله لكم ومشاركتكم أفراحنا الدائمة بفضل من الله.",
    colors: {
      background: "#f4f9f9", // Gentle sky blue tint
      primary: "#a8dadc",    // Pastel blue
      secondary: "#457b9d",  // Steel blue
      text: "#1d3557",       // Navy text
      accent: "#f1faee"      // Cloud white background glow
    },
    fontStyle: "sans-serif",
    musicTheme: "sweet-lullaby",
    particlesEffect: "baby-stars",
    status: "active"
  },
  {
    type: "baby",
    style: "traditional",
    title: "دعوة عقيقة وتسمية المولود",
    names: "المولود فهد",
    date: "2026-07-28",
    time: "20:00",
    locationName: "استراحة النخبة - المنامة",
    locationCoordinates: { lat: 26.2285, lng: 50.586 },
    locationUrl: "https://maps.google.com/?q=26.2285,50.586",
    openingQuote: "بورك لكم في الموهوب وشكرتم الواهب وبلغ أشده ورزقتم بره.",
    bodyText: "يسرنا ببالغ الفرح والسعادة دعوتكم لحفل عقيقة وتسمية ابننا العزيز (فهد) وذلك بمناسبة قدومه الميمون للحياة، سائلين الله عز وجل أن يجعله من عباده الصالحين، وذلك يوم الثلاثاء الموافق 28 يوليو 2026م بعد صلاة العشاء. حضوركم ودعواتكم الصادقة تسعدنا.",
    closingQuote: "أهلاً ومرحباً بكم في ليلتنا المباركة.",
    colors: {
      background: "#fdfefe", // Clean white
      primary: "#2e86c1",    // Royal Blue
      secondary: "#1a5276",  // Deep blue
      text: "#212f3d",       // Dark charcoal
      accent: "#f4d03f"      // Sun gold accent
    },
    fontStyle: "serif",
    musicTheme: "ambient-nature",
    particlesEffect: "baby-stars",
    status: "active"
  }
];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "الباقة المجانية",
    price: "0",
    period: "دائمًا",
    features: [
      "تصميم دعوة واحدة مجانية",
      "قوالب كلاسيكية محدودة",
      "رابط مشاركة مباشر عبر واتساب",
      "تأكيد حضور حتى 20 ضيفًا",
      "موقع تقريبي عبر الخرائط"
    ],
    color: "border-gray-200 text-gray-800 bg-white",
  },
  {
    id: "pro",
    name: "الباقة الاحترافية (الأكثر طلباً)",
    price: "15",
    period: "دعوة واحدة",
    features: [
      "تصميم دعوات زفاف ومواليد غير محدود التعديل",
      "مولد الدعوة الذكي بذكاء اصطناعي (AI)",
      "قوالب عصرية وتأثيرات خلفية تفاعلية (ورود، نجوم، غبار ذهبي)",
      "تأكيد حضور غير محدود وتنزيل تقارير Excel",
      "إضافة موسيقى مخصصة أو فيديو ترحيبي",
      "تحديد دقيق للموقع عبر خرائط جوجل",
      "نظام جدولة تذكيرات تلقائية للضيوف عبر واتساب",
      "إحصائيات تفاعلية ونسب حضور دقيقة",
      "دعم فني مباشر على مدار الساعة"
    ],
    color: "border-amber-400 text-amber-950 bg-amber-50/70 shadow-lg relative",
    isPopular: true
  },
  {
    id: "royal",
    name: "الباقة الملكية الفاخرة",
    price: "35",
    period: "دعوة واحدة",
    features: [
      "كل مميزات الباقة الاحترافية",
      "قالب مخصص بالكامل مصمم من قبل فناني المنصة",
      "إزالة كاملة لشعار منصة زفافي",
      "رابط خاص (Subdomain) باسم أصحاب الحفل",
      "إرسال تذكيرات آلية مؤتمتة وحقيقية للضيوف",
      "دعم فني مخصص بمدير حساب شخصي لحفلكم",
      "تقارير متقدمة بنسب التفاعل ومشاركتها مع المخططين"
    ],
    color: "border-purple-500 text-purple-950 bg-purple-50/70 shadow-xl",
  }
];
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  color: string;
  isPopular?: boolean;
}
