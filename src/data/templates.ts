import { Invitation } from "../types";

const MANUAL_TEMPLATES: Omit<Invitation, "id" | "createdAt">[] = [
  {
    type: "baby",
    style: "stitch-ohana",
    title: "دعوة ميلاد ستيتش الاستوائية المبهجة (ثيم أوهانا) 🌺",
    names: "المولود يوسف (ثيم ستيتش الأزرق)",
    date: "2026-08-25",
    time: "17:00",
    locationName: "صالة الجوري للمناسبات - دبي",
    locationCoordinates: { lat: 25.2048, lng: 55.2708 },
    locationUrl: "https://maps.google.com/?q=25.2048,55.2708",
    openingQuote: "«أوهانا تعني العائلة، والعائلة تعني ألا يُترك أحد أو يُنسى» 💙",
    bodyText: "يسعدنا جداً دعوتكم لحضور حفلة استقبال وعيد ميلاد ابننا الغالي (يوسف) المليئة بالبهجة والمرح الاستوائي بطابع وحش ديزني اللطيف ستيتش! حضوركم سيزيدنا فرحاً وسعادة لا تُنسى في هذه الليلة الاستثنائية.",
    closingQuote: "ودامت دياركم مأهولة بالأفراح والمحبة والمسرات الكبرى!",
    colors: {
      background: "#0c2240", // Deep navy space blue
      primary: "#00a2ff",    // Stitch blue
      secondary: "#ff4b91",  // Hibiscus pink
      text: "#f0fdf4",       // Minty white
      accent: "#ffd700"      // Pineapple gold
    },
    fontStyle: "cursive",
    musicTheme: "sweet-lullaby",
    particlesEffect: "stitch-bubbles",
    status: "active",
    animationType: "elastic-pop",
    splashStyle: "stitch-ears",
    splashWelcomeText: "أوهانا ترحب بكم في عالم ستيتش الأزرق! 💙",
    splashButtonText: "افتح ظرف ستيتش اللطيف ✉️"
  },
  {
    type: "wedding",
    style: "stitch-angel-romance",
    title: "دعوة زفاف ستيتش وأنجل الرومانسية اللطيفة ✨",
    names: "خالد & ريما (ثيم ستيتش وأنجل الاستوائي)",
    date: "2026-11-12",
    time: "20:00",
    locationName: "قاعة قصر الأفراح - مكة المكرمة",
    locationCoordinates: { lat: 21.4225, lng: 39.8262 },
    locationUrl: "https://maps.google.com/?q=21.4225,39.8262",
    openingQuote: "كـ ستيتش وأنجل.. وجدنا نغمتنا الساحرة في هذا الكون الفسيح لتكتمل قصة حبنا الأبدي.",
    bodyText: "بقلوب مغمورة بالسعادة وبكل ود وحب، ندعو عائلتنا وأصدقاءنا الأعزاء لمشاركتنا ليلة عقد قراننا الاستوائي المبتكر والمميز، حيث تجتمع الألوان الزاهية لشخصياتنا المفضلة ستيتش وأنجل! حضوركم هو النور البهيج الذي يملأ محافلنا بالسرور والبهجة.",
    closingQuote: "حضوركم يزيد ليلتنا جمالاً ودفئاً وسعادة لا تنتهي.",
    colors: {
      background: "#fff1f2", // Rose pastel background
      primary: "#ec4899",    // Angel deep pink
      secondary: "#3b82f6",  // Stitch sky blue
      text: "#312e81",       // Dark indigo text
      accent: "#facc15"      // Star gold
    },
    fontStyle: "serif",
    musicTheme: "soft-piano",
    particlesEffect: "tropical-leaves",
    status: "active",
    animationType: "zoom-in",
    splashStyle: "ohana-gate",
    splashWelcomeText: "مرحباً بكم في ليلة الحب الاستوائية 💖",
    splashButtonText: "افتح دعوة ستيتش وأنجل الوردي 🌸"
  },
  {
    type: "baby",
    style: "stitch-baby-shower",
    title: "دعوة استقبال مولود ستيتش اللطيف 👶🍼",
    names: "المولود جاسم (بيبي ستيتش الأزرق)",
    date: "2026-09-02",
    time: "16:30",
    locationName: "استراحة النخبة - المنامة",
    locationCoordinates: { lat: 26.2285, lng: 50.586 },
    locationUrl: "https://maps.google.com/?q=26.2285,50.586",
    openingQuote: "الحمد لله على تمام النعمة واكتمال المنة.. بقدوم ملاكنا الصغير هبطت علينا السعادة والبركة!",
    bodyText: "يسعد عائلتنا أن تشارككم فرحتها الغامرة باستقبال قرة عيننا وصغيرنا الغالي (جاسم)، ويسرنا دعوتكم الكريمة لمشاركتنا مأدبة الاستقبال والتبريكات بطابع بيبي ستيتش اللطيف ذو الألوان الهادئة.",
    closingQuote: "مشاركتكم بهجتنا ودعواتكم الصادقة تملأ قلوبنا امتناناً وشكراً.",
    colors: {
      background: "#f0f9ff", // Bright water sky
      primary: "#0ea5e9",    // Sky blue
      secondary: "#f472b6",  // Bubblegum pink
      text: "#0369a1",       // Ocean blue text
      accent: "#fef08a"      // Soft lemon yellow
    },
    fontStyle: "sans-serif",
    musicTheme: "sweet-lullaby",
    particlesEffect: "stitch-bubbles",
    status: "active",
    animationType: "bounce",
    splashStyle: "stitch-cute",
    splashWelcomeText: "بشرى لنا بقدوم أميرنا الصغير بيبي ستيتش 💙",
    splashButtonText: "افتح بطاقة استقبال بيبي ستيتش 🥰"
  },
  {
    type: "baby",
    style: "stitch-cosmic-night",
    title: "دعوة ليلة الفضاء الكرتونية لستيتش 🌟🛸",
    names: "البطل ريان (عيد ميلاد ستيتش)",
    date: "2026-10-30",
    time: "19:00",
    locationName: "فندق الشيراتون - الكويت",
    locationCoordinates: { lat: 29.3759, lng: 47.9774 },
    locationUrl: "https://maps.google.com/?q=29.3759,47.9774",
    openingQuote: "مغامرة فضائية ممتعة تبدأ الآن مع ستيتش وصديقنا البطل!",
    bodyText: "استعدوا لركوب سفينة الفضاء الاستكشافية! يدعوكم بطلنا الصغير (ريان) لمشاركته احتفال عيد ميلاده المثير بطابع ستيتش الفضائي، حيث المتعة والمغامرة والشهب الساطعة والألوان النجمية البراقة!",
    closingQuote: "أوهانا! لا تنسوا الحضور والمشاركة في مركبتنا الفضائية المرحة!",
    colors: {
      background: "#020617", // Cosmic space dark
      primary: "#38bdf8",    // Electric cyan
      secondary: "#a21caf",  // Starry magenta
      text: "#f8fafc",       // Starlight white
      accent: "#38bdf8"      // Galaxy glow
    },
    fontStyle: "mono",
    musicTheme: "ambient-nature",
    particlesEffect: "baby-stars",
    status: "active",
    animationType: "glow-grow",
    splashStyle: "starry-night",
    splashWelcomeText: "استعد للهبوط على كوكب ستيتش المبهج! 🛸",
    splashButtonText: "افتح بوابة الفضاء الخارجي 🌌"
  },
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
    status: "active",
    animationType: "zoom-in",
    splashStyle: "royal-curtain",
    splashWelcomeText: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    splashButtonText: "افتح الدعوة الملكية ✨"
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
    status: "active",
    animationType: "slide-up",
    splashStyle: "floral-vignette",
    splashWelcomeText: "يا أهلاً ومرحباً بالجميع",
    splashButtonText: "تفضل بفتح بطاقة الدعوة ✉️"
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
    status: "active",
    animationType: "fade-in",
    splashStyle: "glowing-star",
    splashWelcomeText: "الحمد لله على تمام النعمة",
    splashButtonText: "افتح بطاقة استقبال أميرتنا 💖"
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
    status: "active",
    animationType: "bounce",
    splashStyle: "classic-calligraphy",
    splashWelcomeText: "بشرى لنا بقدوم الغالي",
    splashButtonText: "افتح دعوة العقيقة"
  }
];

// High-quality generation assets
const arabicMaleNames = ["فيصل", "خالد", "يوسف", "عمر", "عبد الله", "محمد", "نواف", "سلطان", "علي", "سلمان", "سعود", "ريان", "بدر", "طارق", "مشعل", "حاتم", "بسام", "سعد", "تركي", "ماجد"];
const arabicFemaleNames = ["ريما", "سارة", "هيفاء", "نورة", "شهد", "ليلى", "دلال", "منى", "يارا", "ريناد", "لجين", "رهف", "خلود", "عبير", "هديل", "غادة", "جواهر", "ريم", "مريم", "موضي"];
const babyMaleNames = ["ريان", "تميم", "سليمان", "عبد العزيز", "إياد", "سند", "جود", "آسر", "يمان", "زين", "غيث", "سيف", "قصي", "فراس"];
const babyFemaleNames = ["جوري", "جود", "ديم", "ميرا", "سديم", "وتين", "ليان", "تولين", "ريتال", "سدرة", "حلا", "مسك", "ألين", "سوار"];

const colorPalettes = [
  { background: "#0c1a15", primary: "#d4af37", secondary: "#183228", text: "#fbf9f4", accent: "#ffd700" }, // Emerald Gold
  { background: "#21050a", primary: "#c0392b", secondary: "#400d14", text: "#fef5f6", accent: "#f1948a" }, // Royal Ruby
  { background: "#0d1b2a", primary: "#e0e1dd", secondary: "#1b263b", text: "#f8f9fa", accent: "#4a90e2" }, // Sapphire Navy
  { background: "#1b1429", primary: "#d6c3e9", secondary: "#312244", text: "#fbf9ff", accent: "#cc8ef5" }, // Lavender Plum
  { background: "#fcfaf6", primary: "#8a7355", secondary: "#dfd5c6", text: "#2c2520", accent: "#b09b80" }, // Marble Beige
  { background: "#fbf6f0", primary: "#ca7a5c", secondary: "#eae0d5", text: "#3c2a21", accent: "#e76f51" }, // Terracotta Boho
  { background: "#fff5f5", primary: "#db99a5", secondary: "#ffeaee", text: "#4a3538", accent: "#e8a7b5" }, // Pastel Rose
  { background: "#f2f7fc", primary: "#7ca8cc", secondary: "#e3effa", text: "#2c3e50", accent: "#5499c7" }, // Soft Sky Blue
  { background: "#fdfbf7", primary: "#6e523f", secondary: "#edd9c0", text: "#3d2e24", accent: "#c29e84" }, // Warm Coffee
  { background: "#1a241e", primary: "#c2a649", secondary: "#2c3e35", text: "#f4fcf7", accent: "#dfcd8d" }, // Sage Olive Gold
  { background: "#061f22", primary: "#40e0d0", secondary: "#0b3c41", text: "#e8fafb", accent: "#afeeee" }, // Ocean Turquoise
  { background: "#fef6f8", primary: "#ffb7c5", secondary: "#ffdfeb", text: "#3c1e22", accent: "#ff6b8b" }, // Sakura Pink
  { background: "#0b132b", primary: "#cb997e", secondary: "#1c2541", text: "#f4f6fc", accent: "#ddbea9" }, // Copper Navy
  { background: "#0f1f1d", primary: "#8ef9f3", secondary: "#1e3c38", text: "#f0fdfc", accent: "#20b2aa" }, // Emerald Mint
  { background: "#eef1f6", primary: "#4a90e2", secondary: "#d0d9e8", text: "#1a2e40", accent: "#9bbaeb" }, // Classic Slate
  { background: "#120107", primary: "#ff007f", secondary: "#3a001a", text: "#ffeaf4", accent: "#ff66b2" }, // Cosmic Fuchsia
  { background: "#1a120b", primary: "#d4a373", secondary: "#3c2f2f", text: "#fefae0", accent: "#faedcd" }, // Bronze Vintage
  { background: "#fffcf7", primary: "#a08151", secondary: "#f2ede4", text: "#3a3328", accent: "#c0a980" }, // Silk Cream Gold
  { background: "#2d0a12", primary: "#d4af37", secondary: "#521623", text: "#fff9fa", accent: "#f39c12" }  // Velvet Gold
];

const weddingTitles = [
  "دعوة زفاف ملكية فاخرة",
  "دعوة عقد قران ميمون",
  "ليلة العمر المنتظرة السعيدة",
  "فرحة العمر الكبرى والمباركة",
  "دعوة زواج أنيقة وعصرية",
  "حفل زفاف بهيج ومبارك",
  "دعوة زواج كلاسيكية مميزة",
  "دعوة ليلة الفرح والسرور",
  "ليلة من ألف ليلة وليلة فاخرة",
  "دعوة زفاف بوهيمية دافئة"
];

const babyTitles = [
  "دعوة استقبال المولود الجديد",
  "دعوة عقيقة وتسمية مباركة",
  "بشرى بقدوم أميرنا الصغير",
  "بشرى بقدوم أميرتنا الصغيرة",
  "استقبال مولودنا الغالي الجميل",
  "دعوة حفل ترحيب بالطفل الجديد",
  "دعوة استقبال وتسمية وتبريكات",
  "فرحة قدوم المولود الميمون"
];

const locations = [
  { name: "قاعة ليلتي الكبرى - الرياض", lat: 24.7136, lng: 46.6753 },
  { name: "فندق فورسيزونز - جدة", lat: 21.5433, lng: 39.1728 },
  { name: "صالة الجوري للمناسبات - دبي", lat: 25.2048, lng: 55.2708 },
  { name: "استراحة النخبة - المنامة", lat: 26.2285, lng: 50.586 },
  { name: "فندق الشيراتون - الكويت", lat: 29.3759, lng: 47.9774 },
  { name: "قاعة السرايا الكبرى - مسقط", lat: 23.5859, lng: 58.4059 },
  { name: "فندق الريتز كارلتون - الدوحة", lat: 25.2854, lng: 51.531 },
  { name: "فندق راديسون بلو - الدمام", lat: 26.4207, lng: 50.1033 },
  { name: "قاعة قصر الأفراح - مكة المكرمة", lat: 21.4225, lng: 39.8262 },
  { name: "قاعة التاج الفاخرة - أبوظبي", lat: 24.4539, lng: 54.3773 }
];

const weddingOpeningQuotes = [
  "«وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً»",
  "يجمعنا الحب وتكتمل سعادتنا برؤية وجوهكم الكريمة تبتسم في ليلتنا المنتظرة.",
  "باسم الحب والوفاء، نخط أولى خطواتنا معاً، ويشرفنا حضوركم لتباركوا جمعنا الكريم.",
  "صوت الفرح يعلو، ودقات القلوب تتسارع في انتظار تشريفكم لليلة زفافنا الميمونة.",
  "بمشيئة الله وفضله، نوقد شموع الفرح لندشن معاً عهداً جديداً مكللاً بالمحبة الخالصة."
];

const babyOpeningQuotes = [
  "«الْمَالُ وَالْبَنُونَ زِينَةُ الْحَيَاةِ الدُّنْيَا» .. هلت علينا بشائر الفرح بقدوم طفلنا الغالي.",
  "بورك لكم في الموهوب وشكرتم الواهب وبلغ أشده ورزقتم بره المبارك.",
  "بقدومه هلت البشاير، وبصوته هز المشاعر، الله يحميه ويجعله دوم طيب الخاطر ومن الصالحين.",
  "الحمد لله الذي وهبنا أجمل العطايا وأنبتها نباتاً حسناً، يسعدنا مشاركتكم فرحتنا بقدوم المولود."
];

const fontStyles = ["serif", "sans-serif", "cursive", "mono"] as const;
const musicThemes = ["royal-instrumental", "soft-piano", "sweet-lullaby", "ambient-nature"];
const particlesEffects = ["gold-dust", "rose-petals", "baby-stars", "stitch-bubbles", "tropical-leaves", "none"] as const;

const animationTypes = [
  "zoom-in", "slide-up", "fade-in", "rotate-fade", "bounce", 
  "elastic-pop", "flip-x", "slide-left", "slide-right", "glow-grow"
] as const;

const splashStyles = [
  "envelope", "wax-seal", "royal-curtain", "glowing-star", 
  "matte-glass", "classical-gate", "floral-vignette", 
  "bohemian-arch", "vintage-lace", "starry-night",
  "stitch-ears", "stitch-cute", "ohana-gate"
];

const splashWelcomeTexts = [
  "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  "دعوة خاصة تليق بحضوركم الكريم",
  "يا أهلاً ومرحباً بضيوفنا الأعزاء",
  "بمحبّتكم تكتمل فرحتنا الكبرى",
  "ننتظركم بكل شوق وحب وود",
  "أهلاً بكم في ليلتنا وسعادتنا الغامرة",
  "نوركم يضيء محافلنا ويبهج قلوبنا"
];

const splashButtonTexts = [
  "افتح الدعوة الملكية ✨",
  "تفضل بفتح بطاقة الدعوة ✉️",
  "افتح المظروف الفاخر",
  "انقر لفتح الدعوة الرائعة 💖",
  "تفضل بالدخول والاطلاع",
  "شرفنا بفتح دعوتكم الخاصة 🌹"
];

// Procedurally generate 102 templates to make 106 templates total
const generateTemplates = (): Omit<Invitation, "id" | "createdAt">[] => {
  const templates: Omit<Invitation, "id" | "createdAt">[] = [];

  for (let i = 1; i <= 102; i++) {
    const isWedding = i % 2 === 1; // Alternating weddings and baby showers
    const type = isWedding ? "wedding" : "baby";
    
    // Choose properties deterministically based on index to ensure rich variety
    const styleId = `generated-${type}-${i}`;
    const palette = colorPalettes[(i + 3) % colorPalettes.length];
    const fontStyle = fontStyles[i % fontStyles.length];
    const musicTheme = isWedding 
      ? musicThemes[i % 2] // Fanfare or Piano
      : musicThemes[(i % 2) + 2]; // Lullaby or Nature
    
    const particlesEffect = isWedding
      ? particlesEffects[i % 3] // gold, rose or baby stars
      : particlesEffects[(i % 2) + 2]; // baby stars or none

    const animationType = animationTypes[i % animationTypes.length];
    const splashStyle = splashStyles[i % splashStyles.length];
    const splashWelcomeText = splashWelcomeTexts[i % splashWelcomeTexts.length];
    const splashButtonText = splashButtonTexts[i % splashButtonTexts.length];

    const loc = locations[i % locations.length];

    let title = "";
    let names = "";
    let openingQuote = "";
    let bodyText = "";
    let closingQuote = "";

    if (isWedding) {
      title = weddingTitles[i % weddingTitles.length] + ` (قالب رقم ${i + 4})`;
      const mName = arabicMaleNames[i % arabicMaleNames.length];
      const fName = arabicFemaleNames[(i + 7) % arabicFemaleNames.length];
      names = `${mName} & ${fName}`;
      openingQuote = weddingOpeningQuotes[i % weddingOpeningQuotes.length];
      bodyText = `بقلوب تملؤها المحبة وأهازيج الفرح، تتشرف عائلاتنا بدعوتكم لحضور حفل الزفاف الميمون لـ (${names})، وذلك في تمام الساعة الثامنة مساءً يوم الجمعة الموافق 15 نوفمبر 2026م في قاعة الأفراح. يسعدنا تشريفكم وحضوركم الكريم لمشاركتنا فرحة العمر ونبضات قلوبنا.`;
      closingQuote = "ودامت دياركم العامرة مأهولةً بالأفراح والمسرات والبهجة الكبرى.";
    } else {
      title = babyTitles[i % babyTitles.length] + ` (قالب رقم ${i + 4})`;
      const isBabyGirl = i % 4 === 0;
      const babyName = isBabyGirl 
        ? babyFemaleNames[i % babyFemaleNames.length] 
        : babyMaleNames[i % babyMaleNames.length];
      names = isBabyGirl ? `المولودة ${babyName}` : `المولود ${babyName}`;
      openingQuote = babyOpeningQuotes[i % babyOpeningQuotes.length];
      bodyText = `الحمد لله الذي بنعمته تتم الصالحات، لقد هلت علينا البشاير بقدوم قرة عيننا (${names})، وبهذه المناسبة السعيدة نتشرف بدعوتكم لمشاركتنا مأدبة استقبال وعقيقة مولودنا المبارك لتكتمل فرحتنا برؤيتكم وسماع تبريكاتكم الصادقة.`;
      closingQuote = "شرف حضوركم يسعدنا وجعله الله في ميزان حسناتكم.";
    }

    // Varied future dates to make templates look real
    const month = String(((i % 5) + 8)).padStart(2, "0"); // August to December
    const day = String(((i % 25) + 1)).padStart(2, "0");
    const date = `2026-${month}-${day}`;

    templates.push({
      type,
      style: styleId,
      title,
      names,
      date,
      time: i % 2 === 0 ? "19:00" : "20:30",
      locationName: loc.name,
      locationCoordinates: { lat: loc.lat, lng: loc.lng },
      locationUrl: `https://maps.google.com/?q=${loc.lat},${loc.lng}`,
      openingQuote,
      bodyText,
      closingQuote,
      colors: {
        background: palette.background,
        primary: palette.primary,
        secondary: palette.secondary,
        text: palette.text,
        accent: palette.accent
      },
      fontStyle,
      musicTheme,
      particlesEffect,
      status: "active",
      animationType,
      splashStyle,
      splashWelcomeText,
      splashButtonText
    });
  }

  return templates;
};

export const DEFAULT_TEMPLATES: Omit<Invitation, "id" | "createdAt">[] = [
  ...MANUAL_TEMPLATES,
  ...generateTemplates()
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
