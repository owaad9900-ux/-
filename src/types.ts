export interface Invitation {
  id: string;
  type: "wedding" | "baby";
  style: string;
  title: string;
  names: string;
  date: string;
  time: string;
  locationName: string;
  locationCoordinates: { lat: number; lng: number };
  locationUrl: string;
  openingQuote: string;
  bodyText: string;
  closingQuote: string;
  colors: {
    background: string;
    primary: string;
    secondary: string;
    text: string;
    accent: string;
  };
  fontStyle: "serif" | "sans-serif" | "cursive" | "mono";
  musicTheme: string;
  musicUrl?: string; // URL of the audio file
  videoUrl?: string; // YouTube or generic video embed URL
  particlesEffect: "gold-dust" | "rose-petals" | "baby-stars" | "stitch-bubbles" | "tropical-leaves" | "none";
  createdAt: string;
  status: "active" | "draft";
  viewsCount?: number;
  animationType?: "zoom-in" | "slide-up" | "fade-in" | "rotate-fade" | "bounce" | "elastic-pop" | "flip-x" | "slide-left" | "slide-right" | "glow-grow";
  splashStyle?: string;
  splashWelcomeText?: string;
  splashButtonText?: string;
}

export interface RSVP {
  id: string;
  guestName: string;
  guestCount: number;
  status: "confirmed" | "declined" | "pending";
  phone: string;
  notes?: string;
  submittedAt: string;
}

export interface Reminder {
  id: string;
  guestName: string;
  guestPhone: string;
  scheduledTime: string;
  status: "pending" | "sent" | "failed";
}

export interface SupportMessage {
  id: string;
  sender: "user" | "support";
  text: string;
  timestamp: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  color: string;
  isPopular?: boolean;
}
