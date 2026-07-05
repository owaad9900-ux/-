import React, { useState } from "react";
import { 
  TrendingUp, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Send, 
  FileSpreadsheet, 
  Plus, 
  Trash2, 
  Calendar,
  MessageSquare,
  Sparkles,
  Search
} from "lucide-react";
import { RSVP, Reminder } from "../types";

interface DashboardProps {
  rsvps: RSVP[];
  reminders: Reminder[];
  onAddRsvp: (rsvp: RSVP) => void;
  onDeleteRsvp: (id: string) => void;
  onSendReminder: (reminder: Omit<Reminder, "id" | "status">) => void;
  viewsCount: number;
}

export default function Dashboard({ 
  rsvps, 
  reminders, 
  onAddRsvp, 
  onDeleteRsvp, 
  onSendReminder,
  viewsCount = 138
}: DashboardProps) {
  // Manual RSVP entry Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestPhone, setNewGuestPhone] = useState("");
  const [newGuestCount, setNewGuestCount] = useState(1);
  const [newGuestStatus, setNewGuestStatus] = useState<"confirmed" | "declined">("confirmed");
  const [newGuestNotes, setNewGuestNotes] = useState("");

  // Reminder scheduling state
  const [selectedGuestName, setSelectedGuestName] = useState("");
  const [selectedGuestPhone, setSelectedGuestPhone] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [customMsg, setCustomMsg] = useState("نود تذكيركم بموعد حفلنا القادم ويسعدنا جداً حضوركم ومشاركتنا فرحتنا. دمتم بخير!");
  const [reminderNotification, setReminderNotification] = useState<string | null>(null);

  // Search/Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "confirmed" | "declined">("all");

  // Calculations
  const totalGuestsConfirmed = rsvps
    .filter(r => r.status === "confirmed")
    .reduce((sum, r) => sum + r.guestCount, 0);

  const totalGuestsDeclined = rsvps
    .filter(r => r.status === "declined")
    .reduce((sum, r) => sum + r.guestCount, 0);

  const rsvpsCount = rsvps.length;
  const confirmedCount = rsvps.filter(r => r.status === "confirmed").length;
  const declinedCount = rsvps.filter(r => r.status === "declined").length;

  const acceptancePercentage = rsvpsCount > 0 ? Math.round((confirmedCount / rsvpsCount) * 100) : 0;
  const declinePercentage = rsvpsCount > 0 ? Math.round((declinedCount / rsvpsCount) * 100) : 0;

  const filteredRsvps = rsvps.filter((rsvp) => {
    const matchesSearch = rsvp.guestName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          rsvp.phone.includes(searchQuery);
    const matchesFilter = statusFilter === "all" ? true : rsvp.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const handleAddRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim() || !newGuestPhone.trim()) return;

    onAddRsvp({
      id: "rsvp_" + Math.random().toString(36).substring(2, 9),
      guestName: newGuestName,
      phone: newGuestPhone,
      guestCount: newGuestCount,
      status: newGuestStatus,
      notes: newGuestNotes,
      submittedAt: new Date().toISOString().split("T")[0] + " " + new Date().toTimeString().split(" ")[0].substring(0, 5)
    });

    // Reset Form
    setNewGuestName("");
    setNewGuestPhone("");
    setNewGuestCount(1);
    setNewGuestStatus("confirmed");
    setNewGuestNotes("");
    setShowAddForm(false);
  };

  const handleScheduleReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuestName || !selectedGuestPhone) return;

    onSendReminder({
      guestName: selectedGuestName,
      guestPhone: selectedGuestPhone,
      scheduledTime: reminderTime || new Date(Date.now() + 3600000).toISOString().replace("T", " ").substring(0, 16)
    });

    setReminderNotification(`تمت مجدولة التذكير لـ ${selectedGuestName} بنجاح! سيتم إرساله تلقائياً عبر واتساب.`);
    setTimeout(() => setReminderNotification(null), 4000);

    // Reset Form
    setSelectedGuestName("");
    setSelectedGuestPhone("");
    setReminderTime("");
  };

  const selectGuestForReminder = (name: string, phone: string) => {
    setSelectedGuestName(name);
    setSelectedGuestPhone(phone);
  };

  const exportToExcelSimulation = () => {
    // Generate a downloadable CSV string
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "الاسم,رقم الهاتف,عدد المرافقين,الحالة,ملاحظات,تاريخ التقديم\n";
    
    rsvps.forEach((rsvp) => {
      const statusAr = rsvp.status === "confirmed" ? "مؤكد" : "معتذر";
      const notesClean = rsvp.notes ? rsvp.notes.replace(/,/g, " ") : "";
      csvContent += `${rsvp.guestName},${rsvp.phone},${rsvp.guestCount},${statusAr},${notesClean},${rsvp.submittedAt}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `تقرير_الحضور_دعوات_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 text-right">
      
      {/* Top statistics cards (Bento style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Views */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <TrendingUp className="h-5 w-5" />
            </span>
            <span className="text-xs text-gray-400 font-semibold">إجمالي المشاهدات</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-gray-800">{viewsCount}</h3>
            <p className="text-[10px] text-emerald-600 font-medium mt-1">تفاعل مستمر للبطاقة 📈</p>
          </div>
        </div>

        {/* Confirmed Attendance */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle className="h-5 w-5" />
            </span>
            <span className="text-xs text-gray-400 font-semibold">الحضور المؤكد</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-gray-800">{totalGuestsConfirmed} <span className="text-xs text-gray-500 font-normal">أشخاص</span></h3>
            <p className="text-[10px] text-gray-500 mt-1">من أصل {confirmedCount} عائلات/بطاقات</p>
          </div>
        </div>

        {/* Declined Attendance */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <XCircle className="h-5 w-5" />
            </span>
            <span className="text-xs text-gray-400 font-semibold">المعتذرون عن الحضور</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-gray-800">{totalGuestsDeclined} <span className="text-xs text-gray-500 font-normal">أشخاص</span></h3>
            <p className="text-[10px] text-gray-500 mt-1">من أصل {declinedCount} عائلات/بطاقات</p>
          </div>
        </div>

        {/* Acceptance Rate Diagram */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Users className="h-5 w-5" />
            </span>
            <span className="text-xs text-gray-400 font-semibold">نسبة تلبية الدعوة</span>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>{declinePercentage}% اعتذار</span>
              <span>{acceptancePercentage}% قبول</span>
            </div>
            {/* Visual Bar chart */}
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden flex flex-row-reverse">
              <div className="bg-emerald-500 h-full" style={{ width: `${acceptancePercentage}%` }} />
              <div className="bg-rose-400 h-full" style={{ width: `${declinePercentage}%` }} />
            </div>
            <p className="text-[9px] text-gray-400 mt-1.5">معدل رائع لاستجابة الضيوف</p>
          </div>
        </div>

      </div>

      {/* Main Content: Guest List & Schedulers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Guest List (Col-span 2) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>إضافة ضيف يدوياً</span>
              </button>

              <button
                onClick={exportToExcelSimulation}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>تنزيل التقرير (Excel)</span>
              </button>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">سجل تأكيدات الحضور (RSVP)</h2>
              <p className="text-xs text-gray-500">إدارة قوائم الضيوف وحالة الحضور والتهاني المكتوبة</p>
            </div>
          </div>

          {/* Manual Add RSVP Form */}
          {showAddForm && (
            <form onSubmit={handleAddRsvpSubmit} className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 mb-6 space-y-4">
              <h3 className="text-sm font-bold text-amber-950">إضافة ضيف جديد يدوياً إلى السجل</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">اسم الضيف</label>
                  <input
                    type="text"
                    required
                    value={newGuestName}
                    onChange={(e) => setNewGuestName(e.target.value)}
                    placeholder="الاسم الثلاثي للضيف"
                    className="w-full px-3 py-2 rounded-xl text-xs border bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">رقم الهاتف</label>
                  <input
                    type="tel"
                    required
                    value={newGuestPhone}
                    onChange={(e) => setNewGuestPhone(e.target.value)}
                    placeholder="9665xxxxxxxx"
                    className="w-full px-3 py-2 rounded-xl text-xs border bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">عدد الأفراد</label>
                  <select
                    value={newGuestCount}
                    onChange={(e) => setNewGuestCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-xs border bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 text-right"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num} أفراد</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">حالة الحضور</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNewGuestStatus("confirmed")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border ${newGuestStatus === "confirmed" ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-gray-200"}`}
                    >
                      مؤكد الحضور
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewGuestStatus("declined")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border ${newGuestStatus === "declined" ? "bg-rose-500 border-rose-500 text-white" : "bg-white border-gray-200"}`}
                    >
                      معتذر
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">ملاحظة أو تهنئة</label>
                  <input
                    type="text"
                    value={newGuestNotes}
                    onChange={(e) => setNewGuestNotes(e.target.value)}
                    placeholder="أضف أي ملاحظات خاصة بالضيف"
                    className="w-full px-3 py-2 rounded-xl text-xs border bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 text-right"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 rounded-xl border text-xs text-gray-600 bg-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-bold"
                >
                  إضافة الآن
                </button>
              </div>
            </form>
          )}

          {/* Search/Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="ابحث باسم الضيف أو رقم الهاتف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-100 rounded-xl text-xs focus:outline-none focus:border-amber-500 text-right"
              />
            </div>

            <div className="flex gap-1 justify-end">
              {[
                { id: "all", label: "الكل" },
                { id: "confirmed", label: "سأحضر" },
                { id: "declined", label: "معتذر" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    statusFilter === tab.id
                      ? "bg-amber-500 text-white font-bold"
                      : "bg-gray-50 hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* RSVP Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">الاسم الكامل</th>
                  <th className="px-4 py-3">رقم الهاتف</th>
                  <th className="px-4 py-3">عدد الأفراد</th>
                  <th className="px-4 py-3">حالة الحضور</th>
                  <th className="px-4 py-3">التهاني والملاحظات</th>
                  <th className="px-4 py-3">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRsvps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400 italic">
                      لا توجد استجابات حضور مطابقة للبحث
                    </td>
                  </tr>
                ) : (
                  filteredRsvps.map((rsvp) => (
                    <tr key={rsvp.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-gray-800">{rsvp.guestName}</td>
                      <td className="px-4 py-3 font-mono text-gray-500">{rsvp.phone}</td>
                      <td className="px-4 py-3 font-bold">{rsvp.guestCount} مرافقين</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          rsvp.status === "confirmed" 
                            ? "bg-emerald-50 text-emerald-700" 
                            : "bg-rose-50 text-rose-700"
                        }`}>
                          {rsvp.status === "confirmed" ? (
                            <>
                              <CheckCircle className="h-3 w-3" />
                              <span>مؤكد الحضور</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3" />
                              <span>معتذر</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-xs truncate" title={rsvp.notes}>
                        {rsvp.notes || "-"}
                      </td>
                      <td className="px-4 py-3 space-x-1 flex justify-end gap-1">
                        <button
                          onClick={() => selectGuestForReminder(rsvp.guestName, rsvp.phone)}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg font-semibold transition-all text-[10px]"
                          title="اختر لجدولة تذكير واتساب"
                        >
                          تذكير
                        </button>
                        <button
                          onClick={() => onDeleteRsvp(rsvp.id)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="حذف الاستجابة"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reminders Scheduler Sidebar */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center justify-end gap-1.5">
              <span>تذكير الضيوف التلقائي</span>
              <MessageSquare className="h-5 w-5 text-amber-500" />
            </h3>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              قم بجدولة رسائل وتذكيرات تلقائية للضيوف ترسل عبر تطبيق واتساب لتذكيرهم بموعد الحفل والترحيب بهم.
            </p>

            {reminderNotification && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs mb-4">
                {reminderNotification}
              </div>
            )}

            <form onSubmit={handleScheduleReminder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">اسم المستلم</label>
                <input
                  type="text"
                  required
                  placeholder="اختر ضيفًا من الجدول أو أدخله يدويًا"
                  value={selectedGuestName}
                  onChange={(e) => setSelectedGuestName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border text-right focus:outline-none focus:border-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">رقم هاتف واتساب</label>
                <input
                  type="tel"
                  required
                  placeholder="9665xxxxxxxx"
                  value={selectedGuestPhone}
                  onChange={(e) => setSelectedGuestPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border text-right focus:outline-none focus:border-amber-500 font-mono bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">موعد إرسال التذكير الآلي</label>
                <input
                  type="datetime-local"
                  required
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border text-right focus:outline-none focus:border-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">نص رسالة التذكير عبر واتساب</label>
                <textarea
                  required
                  rows={3}
                  value={customMsg}
                  onChange={(e) => setCustomMsg(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border text-right focus:outline-none focus:border-amber-500 bg-white leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={!selectedGuestName}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
                <span>جدولة التذكير الآلي ⏰</span>
              </button>
            </form>
          </div>

          {/* Schedulers logs list */}
          <div className="mt-6 border-t border-gray-100 pt-4">
            <h4 className="text-xs font-bold text-gray-700 mb-3">الحالات المجدولة حالياً</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {reminders.length === 0 ? (
                <p className="text-[10px] text-gray-400 italic text-center">لا توجد تذكيرات مجدولة مسبقاً</p>
              ) : (
                reminders.map((rem) => (
                  <div key={rem.id} className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-[10px] flex items-center justify-between">
                    <span className={`px-1.5 py-0.5 rounded-full font-bold ${
                      rem.status === "sent" 
                        ? "bg-emerald-50 text-emerald-600" 
                        : "bg-amber-50 text-amber-600"
                    }`}>
                      {rem.status === "sent" ? "تم الإرسال" : "مجدول"}
                    </span>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">{rem.guestName}</p>
                      <p className="text-[9px] text-gray-400 flex items-center justify-end gap-1 mt-0.5">
                        <span>{rem.scheduledTime}</span>
                        <Clock className="h-2.5 w-2.5" />
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
