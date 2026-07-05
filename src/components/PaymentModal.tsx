import React, { useState } from "react";
import { ShieldCheck, CreditCard, Lock, CheckCircle } from "lucide-react";
import { SubscriptionPlan } from "../types";

interface PaymentModalProps {
  plan: SubscriptionPlan | null;
  onClose: () => void;
  onPaymentSuccess: (planId: string) => void;
}

export default function PaymentModal({ plan, onClose, onPaymentSuccess }: PaymentModalProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!plan) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment transaction securely
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        onPaymentSuccess(plan.id);
        onClose();
      }, 2000);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 text-right">
        
        {/* Header decoration */}
        <div className="bg-gradient-to-l from-amber-500 to-amber-600 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute left-4 top-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-bold text-sm cursor-pointer"
          >
            ✕
          </button>
          
          <h3 className="text-xl font-bold mb-1">الترقية إلى {plan.name}</h3>
          <p className="text-xs opacity-90">نظام دفع إلكتروني آمن وموثوق ومحمي بالكامل 🔒</p>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h4 className="text-xl font-bold text-emerald-700">تمت الترقية بنجاح!</h4>
            <p className="text-sm text-gray-500">
              شكراً لثقتكم بنا. تم فتح جميع قوالب الذكاء الاصطناعي والميزات الاحترافية لبطاقة دعوتكم حالاً.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Package details */}
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100/50 flex justify-between items-center text-sm">
              <span className="text-lg font-bold text-amber-900">${plan.price} <span className="text-xs font-normal text-gray-500">/{plan.period}</span></span>
              <span className="font-bold text-gray-800">{plan.name}</span>
            </div>

            {/* Credit Card Details */}
            <div className="space-y-3 text-right">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">اسم صاحب البطاقة</label>
                <input
                  type="text"
                  required
                  placeholder="الاسم كما هو مكتوب على البطاقة"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs text-right focus:outline-none focus:border-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">رقم بطاقة الائتمان</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    maxLength={19}
                    placeholder="4000 1234 5678 9010"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, "").replace(/(\d{4})/g, "$1 ").trim())}
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-xs text-left font-mono focus:outline-none focus:border-amber-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">الرمز السري (CVV)</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="password"
                      required
                      maxLength={3}
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-xs text-left font-mono focus:outline-none focus:border-amber-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">تاريخ الانتهاء</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs text-center font-mono focus:outline-none focus:border-amber-500 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Safety badge info */}
            <div className="p-3 bg-gray-50 rounded-xl border flex items-center justify-between text-[10px] text-gray-500">
              <span className="flex items-center gap-1 font-semibold text-emerald-600">
                <ShieldCheck className="h-4 w-4" />
                تشفير SSL 256-bit
              </span>
              <span>بوابتنا آمنة ومصرحة من البنك المركزي</span>
            </div>

            {/* Pay Button */}
            <button
              type="submit"
              disabled={isProcessing || !cardHolder || !cardNumber}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جاري معالجة العملية بأمان...</span>
                </>
              ) : (
                <span>دفع وتأكيد الاشتراك الآن 💳</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
