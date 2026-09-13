"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Settings, 
  Building2, 
  Phone, 
  Calendar, 
  CreditCard, 
  Bell, 
  Shield, 
  User, 
  Save, 
  RefreshCw, 
  History, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  Sliders,
  Mail,
  MapPin,
  Clock,
  KeyRound,
  ShieldCheck,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";

type SettingsTab = "general" | "contact" | "booking" | "payment" | "notifications" | "security" | "profile";

export default function AdminSettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings State
  const [settings, setSettings] = useState<any>({
    general: {
      siteName: "Minh Khoa – Car Rental & Travel",
      tagline: "Dịch vụ cho thuê xe tự lái và có tài xế uy tín tại Cần Thơ & Miền Tây",
      logoUrl: "",
      description: "Hệ thống đặt xe trực tuyến hàng đầu với đa dạng dòng xe đời mới từ 4 - 45 chỗ.",
      maintenanceMode: false,
    },
    contact: {
      hotline: "0987 654 321",
      zalo: "0987 654 321",
      supportEmail: "support@minhkhoa.vn",
      address: "123 Đường 30 Tháng 4, Phường Hưng Lợi, Quận Ninh Kiều, Cần Thơ",
      workingHours: "07:00 - 22:00 (Tất cả các ngày trong tuần)",
    },
    booking: {
      minRentalHours: 4,
      minAdvanceHours: 2,
      depositPercentage: 30,
      cancellationFeePercentage: 10,
      autoCancelUnpaidMinutes: 60,
      allowCustomerCancel: true,
    },
    payment: {
      bankName: "Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)",
      bankAccount: "1029384756",
      bankAccountName: "NGUYEN MINH KHOA",
      bankBranch: "Chi nhánh Cần Thơ",
      transferSyntaxPrefix: "MKRENT",
      allowCash: true,
      enableVnpay: true,
      enableMomo: true,
    },
    notifications: {
      adminNotificationEmail: "admin@minhkhoa.vn",
      sendEmailBookingConfirmed: true,
      notifyOnPaymentSubmitted: true,
      notifyOnNewBooking: true,
    },
    security: {
      sessionTimeoutMinutes: 120,
      maxFailedLogins: 5,
      enforceStrongPassword: true,
      enableAuditLogging: true,
    },
  });

  // Profile State
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    avatar: "",
    lastLoginAt: "",
  });

  // Change Password State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  // Fetch Settings & Profile
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsRes, profileRes] = await Promise.all([
        api.get("/admin/settings"),
        api.get("/admin/settings/profile"),
      ]);

      if (settingsRes.data.success && settingsRes.data.data.settings) {
        setSettings((prev: any) => ({
          ...prev,
          ...settingsRes.data.data.settings,
        }));
      }

      if (profileRes.data.success && profileRes.data.data.profile) {
        const p = profileRes.data.data.profile;
        setProfile({
          name: p.name || "",
          email: p.email || "",
          phone: p.phone || "",
          role: p.role || "",
          avatar: p.avatar || "",
          lastLoginAt: p.lastLoginAt || "",
        });
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Không thể tải dữ liệu cài đặt");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Handle Section Settings Save
  const handleSaveSection = async (section: string) => {
    setSaving(true);
    try {
      const res = await api.put(`/admin/settings/${section}`, {
        settings: settings[section],
      });
      if (res.data.success) {
        toast.success(`Đã lưu cấu hình mục "${getTabLabel(section)}" thành công!`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi lưu cấu hình");
    } finally {
      setSaving(false);
    }
  };

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put("/admin/settings/profile", {
        name: profile.name,
        phone: profile.phone,
        avatar: profile.avatar,
      });
      if (res.data.success) {
        toast.success("Cập nhật thông tin hồ sơ thành công!");
        updateUser({ name: profile.name });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi cập nhật hồ sơ");
    } finally {
      setSaving(false);
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      toast.error("Vui lòng nhập mật khẩu hiện tại");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Mật khẩu mới và xác nhận mật khẩu không trùng khớp");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("Mật khẩu mới phải có tối thiểu 8 ký tự");
      return;
    }

    setChangingPass(true);
    try {
      await api.put("/admin/settings/profile/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Đổi mật khẩu quản trị viên thành công!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi đổi mật khẩu");
    } finally {
      setChangingPass(false);
    }
  };

  const getTabLabel = (key: string) => {
    switch (key) {
      case "general": return "Cài đặt Chung";
      case "contact": return "Liên hệ & Hỗ trợ";
      case "booking": return "Quy tắc Đặt chuyến";
      case "payment": return "Tài khoản & Ngân hàng";
      case "notifications": return "Cấu hình Thông báo";
      case "security": return "Bảo mật & Phiên làm việc";
      case "profile": return "Hồ sơ Quản trị viên";
      default: return key;
    }
  };

  const navTabs = [
    { id: "general", label: "Chung", icon: Settings },
    { id: "contact", label: "Liên hệ", icon: Phone },
    { id: "booking", label: "Đặt chuyến", icon: Calendar },
    { id: "payment", label: "Ngân hàng & Thanh toán", icon: CreditCard },
    { id: "notifications", label: "Thông báo", icon: Bell },
    { id: "security", label: "Bảo mật", icon: Shield },
    { id: "profile", label: "Hồ sơ & Mật khẩu", icon: User },
  ];

  if (loading) {
    return (
      <div className="py-24 text-center">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-orange-500 mb-3" />
        <p className="text-slate-500 font-medium">Đang tải thông tin cấu hình hệ thống...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Sliders className="h-8 w-8 text-orange-600" />
            Cài đặt Hệ thống & Quản trị
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Quản lý thông tin doanh nghiệp, thông số thanh toán, quy tắc đặt xe và bảo mật tài khoản.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/settings/audit-logs">
            <Button variant="outline" className="flex items-center gap-2 bg-white text-slate-700 shadow-sm">
              <History className="h-4 w-4 text-orange-600" />
              Nhật ký hệ thống (Audit Logs)
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={fetchAllData}
            disabled={loading}
            className="flex items-center gap-2 bg-white text-slate-700 shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Main Layout: Tabs Left / Top and Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-1">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left whitespace-nowrap ${
                    isActive
                      ? "bg-orange-50 text-orange-700 border border-orange-200 font-semibold shadow-xs"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-orange-600" : "text-slate-400"}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content Panel */}
        <div className="lg:col-span-3">
          {/* TAB 1: GENERAL */}
          {activeTab === "general" && (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900">Cài đặt Thông tin Chung</CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-0.5">
                      Tên thương hiệu, khẩu hiệu marketing và trạng thái hoạt động của website.
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => handleSaveSection("general")}
                    disabled={saving}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-1.5" />
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">Tên hệ thống / Doanh nghiệp</label>
                  <Input
                    value={settings.general?.siteName || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, siteName: e.target.value },
                      })
                    }
                    placeholder="Minh Khoa – Car Rental & Travel"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">Khẩu hiệu (Tagline)</label>
                  <Input
                    value={settings.general?.tagline || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, tagline: e.target.value },
                      })
                    }
                    placeholder="Dịch vụ cho thuê xe tự lái..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">Logo URL</label>
                  <Input
                    value={settings.general?.logoUrl || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, logoUrl: e.target.value },
                      })
                    }
                    placeholder="https://minhkhoa.vn/logo.png"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">Mô tả ngắn (SEO / Footer)</label>
                  <textarea
                    rows={3}
                    value={settings.general?.description || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, description: e.target.value },
                      })
                    }
                    className="w-full text-sm p-3 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm text-slate-900">Chế độ Bảo trì (Maintenance Mode)</div>
                    <div className="text-xs text-slate-500">
                      Khi bật, chỉ tài khoản Admin mới có thể truy cập hệ thống; khách hàng sẽ thấy thông báo bảo trì.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.general?.maintenanceMode || false}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, maintenanceMode: e.target.checked },
                      })
                    }
                    className="h-5 w-5 text-orange-600 rounded border-slate-300 focus:ring-orange-500 cursor-pointer"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 2: CONTACT */}
          {activeTab === "contact" && (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900">Thông tin Liên hệ & Hỗ trợ</CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-0.5">
                      Đường dây nóng, email hỗ trợ và địa chỉ văn phòng hiển thị trên website.
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => handleSaveSection("contact")}
                    disabled={saving}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-1.5" />
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-orange-600" /> Hotline tiếp nhận
                    </label>
                    <Input
                      value={settings.contact?.hotline || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          contact: { ...settings.contact, hotline: e.target.value },
                        })
                      }
                      placeholder="0987 654 321"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-blue-600" /> Zalo tư vấn
                    </label>
                    <Input
                      value={settings.contact?.zalo || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          contact: { ...settings.contact, zalo: e.target.value },
                        })
                      }
                      placeholder="0987 654 321"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-500" /> Email hỗ trợ khách hàng
                  </label>
                  <Input
                    type="email"
                    value={settings.contact?.supportEmail || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        contact: { ...settings.contact, supportEmail: e.target.value },
                      })
                    }
                    placeholder="support@minhkhoa.vn"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-rose-500" /> Địa chỉ văn phòng / Bãi xe
                  </label>
                  <Input
                    value={settings.contact?.address || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        contact: { ...settings.contact, address: e.target.value },
                      })
                    }
                    placeholder="123 Đường 30 Tháng 4..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-amber-500" /> Khung giờ làm việc
                  </label>
                  <Input
                    value={settings.contact?.workingHours || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        contact: { ...settings.contact, workingHours: e.target.value },
                      })
                    }
                    placeholder="07:00 - 22:00 hàng ngày"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 3: BOOKING RULES */}
          {activeTab === "booking" && (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900">Quy tắc Đặt chuyến & Hủy phòng</CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-0.5">
                      Quy định thời gian thuê tối thiểu, tiền đặt cọc và chính sách hủy chuyến.
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => handleSaveSection("booking")}
                    disabled={saving}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-1.5" />
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700">
                      Thời gian thuê xe tối thiểu (giờ)
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={720}
                      value={settings.booking?.minRentalHours || 4}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          booking: { ...settings.booking, minRentalHours: Number(e.target.value) },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700">
                      Phải đặt trước tối thiểu (giờ)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={168}
                      value={settings.booking?.minAdvanceHours || 2}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          booking: { ...settings.booking, minAdvanceHours: Number(e.target.value) },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700">
                      Tỷ lệ đặt cọc bắt buộc (%)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={settings.booking?.depositPercentage || 30}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          booking: { ...settings.booking, depositPercentage: Number(e.target.value) },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700">
                      Phí hủy chuyến trễ (%)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={settings.booking?.cancellationFeePercentage || 10}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          booking: { ...settings.booking, cancellationFeePercentage: Number(e.target.value) },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Tự động hủy đơn chưa thanh toán sau (phút)
                  </label>
                  <Input
                    type="number"
                    min={15}
                    max={1440}
                    value={settings.booking?.autoCancelUnpaidMinutes || 60}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        booking: { ...settings.booking, autoCancelUnpaidMinutes: Number(e.target.value) },
                      })
                    }
                  />
                  <p className="text-[11px] text-slate-400">
                    Nếu quá thời gian này khách không chuyển khoản cọc, hệ thống tự động giải phóng xe cho khách khác.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm text-slate-900">Cho phép khách tự hủy chuyến</div>
                    <div className="text-xs text-slate-500">
                      Khách hàng có thể chủ động bấm Hủy trên tài khoản trước giờ khởi hành theo quy định.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.booking?.allowCustomerCancel ?? true}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        booking: { ...settings.booking, allowCustomerCancel: e.target.checked },
                      })
                    }
                    className="h-5 w-5 text-orange-600 rounded border-slate-300 focus:ring-orange-500 cursor-pointer"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 4: PAYMENT & BANK */}
          {activeTab === "payment" && (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900">Tài khoản Ngân hàng & Cổng thanh toán</CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-0.5">
                      Thông tin thụ hưởng hiển thị khi khách hàng chọn phương thức chuyển khoản hoặc QR code.
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => handleSaveSection("payment")}
                    disabled={saving}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-1.5" />
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">Tên ngân hàng</label>
                  <Input
                    value={settings.payment?.bankName || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        payment: { ...settings.payment, bankName: e.target.value },
                      })
                    }
                    placeholder="Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700">Số tài khoản thụ hưởng</label>
                    <Input
                      value={settings.payment?.bankAccount || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          payment: { ...settings.payment, bankAccount: e.target.value },
                        })
                      }
                      className="font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700">Tên chủ tài khoản (In hoa không dấu)</label>
                    <Input
                      value={settings.payment?.bankAccountName || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          payment: { ...settings.payment, bankAccountName: e.target.value.toUpperCase() },
                        })
                      }
                      className="font-mono uppercase font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700">Chi nhánh ngân hàng</label>
                    <Input
                      value={settings.payment?.bankBranch || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          payment: { ...settings.payment, bankBranch: e.target.value },
                        })
                      }
                      placeholder="Chi nhánh Cần Thơ"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700">Tiền tố cú pháp chuyển khoản (Prefix)</label>
                    <Input
                      value={settings.payment?.transferSyntaxPrefix || "MKRENT"}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          payment: { ...settings.payment, transferSyntaxPrefix: e.target.value.toUpperCase() },
                        })
                      }
                      className="font-mono uppercase font-semibold"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Các phương thức thanh toán được kích hoạt
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-slate-50">
                    <span className="text-sm font-medium text-slate-700">Thanh toán tiền mặt khi nhận xe</span>
                    <input
                      type="checkbox"
                      checked={settings.payment?.allowCash ?? true}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          payment: { ...settings.payment, allowCash: e.target.checked },
                        })
                      }
                      className="h-5 w-5 text-orange-600 rounded border-slate-300 focus:ring-orange-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-slate-50">
                    <span className="text-sm font-medium text-slate-700">Cổng thanh toán trực tuyến VNPAY</span>
                    <input
                      type="checkbox"
                      checked={settings.payment?.enableVnpay ?? true}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          payment: { ...settings.payment, enableVnpay: e.target.checked },
                        })
                      }
                      className="h-5 w-5 text-orange-600 rounded border-slate-300 focus:ring-orange-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium text-slate-700">Ví điện tử MoMo</span>
                    <input
                      type="checkbox"
                      checked={settings.payment?.enableMomo ?? true}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          payment: { ...settings.payment, enableMomo: e.target.checked },
                        })
                      }
                      className="h-5 w-5 text-orange-600 rounded border-slate-300 focus:ring-orange-500 cursor-pointer"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 5: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900">Cấu hình Thông báo Hệ thống</CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-0.5">
                      Cài đặt nhận email cảnh báo đặt chuyến và thanh toán cho ban quản lý.
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => handleSaveSection("notifications")}
                    disabled={saving}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-1.5" />
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Email nhận thông báo quản trị viên
                  </label>
                  <Input
                    type="email"
                    value={settings.notifications?.adminNotificationEmail || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, adminNotificationEmail: e.target.value },
                      })
                    }
                    placeholder="admin@minhkhoa.vn"
                  />
                </div>

                <div className="pt-2 space-y-3">
                  <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                    <div>
                      <div className="text-sm font-medium text-slate-800">Gửi email xác nhận khi duyệt đơn cho khách</div>
                      <div className="text-xs text-slate-500">Tự động gửi email biên nhận khi đơn được xác nhận</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications?.sendEmailBookingConfirmed ?? true}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, sendEmailBookingConfirmed: e.target.checked },
                        })
                      }
                      className="h-5 w-5 text-orange-600 rounded border-slate-300 focus:ring-orange-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                    <div>
                      <div className="text-sm font-medium text-slate-800">Thông báo khi khách báo chuyển khoản</div>
                      <div className="text-xs text-slate-500">Bắn chuông thông báo âm thanh và pop-up tức thì qua Socket.IO</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications?.notifyOnPaymentSubmitted ?? true}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, notifyOnPaymentSubmitted: e.target.checked },
                        })
                      }
                      className="h-5 w-5 text-orange-600 rounded border-slate-300 focus:ring-orange-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2.5">
                    <div>
                      <div className="text-sm font-medium text-slate-800">Thông báo có yêu cầu đặt chuyến mới</div>
                      <div className="text-xs text-slate-500">Hiển thị cảnh báo ngay khi có khách gửi đặt xe mới trên website</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications?.notifyOnNewBooking ?? true}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, notifyOnNewBooking: e.target.checked },
                        })
                      }
                      className="h-5 w-5 text-orange-600 rounded border-slate-300 focus:ring-orange-500 cursor-pointer"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 6: SECURITY */}
          {activeTab === "security" && (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900">Bảo mật & Phiên Đăng nhập</CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-0.5">
                      Quy định thời hạn phiên làm việc và chính sách chống tấn công brute-force.
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => handleSaveSection("security")}
                    disabled={saving}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-1.5" />
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700">
                      Thời hạn phiên đăng nhập (phút)
                    </label>
                    <Input
                      type="number"
                      min={15}
                      max={10080}
                      value={settings.security?.sessionTimeoutMinutes || 120}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          security: { ...settings.security, sessionTimeoutMinutes: Number(e.target.value) },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700">
                      Khóa tạm sau số lần sai mật khẩu
                    </label>
                    <Input
                      type="number"
                      min={3}
                      max={10}
                      value={settings.security?.maxFailedLogins || 5}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          security: { ...settings.security, maxFailedLogins: Number(e.target.value) },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="pt-2 space-y-3">
                  <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                    <div>
                      <div className="text-sm font-medium text-slate-800">Bắt buộc mật khẩu phức tạp</div>
                      <div className="text-xs text-slate-500">
                        Yêu cầu ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.security?.enforceStrongPassword ?? true}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          security: { ...settings.security, enforceStrongPassword: e.target.checked },
                        })
                      }
                      className="h-5 w-5 text-orange-600 rounded border-slate-300 focus:ring-orange-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2.5">
                    <div>
                      <div className="text-sm font-medium text-slate-800">Kích hoạt Audit Logging toàn hệ thống</div>
                      <div className="text-xs text-slate-500">
                        Ghi lại mọi thay đổi nhạy cảm (Cài đặt, Khách hàng, Hoàn tiền) vào sổ kiểm toán
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.security?.enableAuditLogging ?? true}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          security: { ...settings.security, enableAuditLogging: e.target.checked },
                        })
                      }
                      className="h-5 w-5 text-orange-600 rounded border-slate-300 focus:ring-orange-500 cursor-pointer"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 7: PROFILE & CHANGE PASSWORD */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* Profile Card */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <User className="h-5 w-5 text-orange-600" />
                    Hồ sơ Quản trị viên
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700">Họ và tên</label>
                        <Input
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          placeholder="Nguyễn Văn A"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700">Email (Không thể sửa)</label>
                        <Input value={profile.email} disabled className="bg-slate-50 text-slate-500" />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700">Số điện thoại</label>
                        <Input
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          placeholder="0912 345 678"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700">Vai trò quản trị</label>
                        <Input value={profile.role} disabled className="bg-slate-50 font-bold text-orange-600" />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        disabled={saving}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        <Save className="h-4 w-4 mr-1.5" />
                        {saving ? "Đang lưu..." : "Cập nhật hồ sơ"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Change Password Card */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <KeyRound className="h-5 w-5 text-orange-600" />
                    Đổi Mật khẩu Quản trị viên
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-0.5">
                    Mật khẩu mới yêu cầu tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                    {/* Current Password */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700">Mật khẩu hiện tại</label>
                      <div className="relative">
                        <Input
                          type={showCurrentPass ? "text" : "password"}
                          value={passwordForm.currentPassword}
                          onChange={(e) =>
                            setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                          }
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPass(!showCurrentPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700">Mật khẩu mới</label>
                      <div className="relative">
                        <Input
                          type={showNewPass ? "text" : "password"}
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                          }
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700">Xác nhận mật khẩu mới</label>
                      <Input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                        }
                        placeholder="••••••••"
                        required
                      />
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={changingPass}
                        className="bg-slate-900 hover:bg-slate-800 text-white"
                      >
                        <Lock className="h-4 w-4 mr-1.5" />
                        {changingPass ? "Đang đổi mật khẩu..." : "Xác nhận đổi mật khẩu"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
