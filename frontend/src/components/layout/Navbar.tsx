"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Menu, 
  Phone, 
  User as UserIcon, 
  LogOut, 
  Car, 
  Home, 
  Layers, 
  MapPin, 
  CalendarCheck, 
  ChevronRight, 
  PhoneCall, 
  ShieldCheck,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";

const navLinks = [
  { name: "Trang Chủ", href: "/", icon: Home, color: "text-blue-600", bg: "bg-blue-50" },
  { name: "Đội Xe Du Lịch", href: "/vehicles", icon: Car, color: "text-orange-600", bg: "bg-orange-50", badge: "HOT" },
  { name: "Dịch Vụ Cho Thuê", href: "/services", icon: Layers, color: "text-amber-600", bg: "bg-amber-50" },
  { name: "Về Chúng Tôi", href: "/about", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
  { name: "Liên Hệ & Hỗ Trợ", href: "/contact", icon: MapPin, color: "text-emerald-600", bg: "bg-emerald-50" },
];

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error(error);
    } finally {
      logout();
      setOpen(false);
      router.push("/login");
    }
  };

  const displayName = user ? (user.name || user.email).replace("Giờ Lập Trình", "Gió Lập Trình") : "";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        {/* Logo - Prominent & Premium */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 text-white flex items-center justify-center shadow-md shadow-orange-500/30 group-hover:scale-105 group-hover:shadow-orange-500/50 transition-all duration-300">
            <Car className="w-5 h-5 drop-shadow-sm" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-slate-900 leading-none">
                MINH<span className="text-orange-600">KHOA</span>
              </span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 leading-none mt-1">
              Car Rental & Travel
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-orange-600 text-slate-700"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth & CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a href="tel:0859354724">
            <Button variant="outline" className="gap-2 border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700 font-bold text-xs h-9">
              <Phone className="h-3.5 w-3.5" />
              0859 354 724
            </Button>
          </a>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              {/* Admin Portal Quick Link */}
              {(user.role === "ADMIN" || user.role === "STAFF") && (
                <Link href="/admin">
                  <Button className="h-9 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md flex items-center gap-1.5 border border-slate-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Quản Trị Hệ Thống</span>
                  </Button>
                </Link>
              )}

              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                <UserIcon className="h-3.5 w-3.5 text-orange-600" />
                <span>{displayName}</span>
              </div>

              <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:text-red-600" onClick={handleLogout} title="Đăng xuất">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button className="h-9 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-sm">
                Đăng nhập
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Nav Button */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl inline-flex items-center justify-center transition-colors">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Mở Menu</span>
          </SheetTrigger>
          
          <SheetContent 
            side="right" 
            className="w-[88vw] max-w-[350px] sm:max-w-[380px] p-0 border-l border-slate-200/80 bg-white shadow-2xl flex flex-col h-full overflow-hidden"
          >
            {/* Mobile Header with Brand Logo */}
            <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-orange-50/50 via-white to-amber-50/30">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-400 text-white flex items-center justify-center shadow-md shadow-orange-500/30">
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <SheetTitle className="text-base font-black tracking-tight text-slate-900 leading-tight">
                    MINH<span className="text-orange-600">KHOA</span>
                  </SheetTitle>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-orange-500 block leading-none mt-0.5">
                    Car Rental & Travel
                  </span>
                </div>
              </div>
            </div>

            {/* Scrollable Drawer Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* User Account Card */}
              {isAuthenticated && user ? (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 text-white shadow-md border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white font-black text-sm shadow-md ring-2 ring-orange-400/30">
                      {(displayName[0] || 'U').toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-sm text-white truncate block">
                        {displayName}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-300 mt-0.5">
                        {user.role === "ADMIN" ? "⚡ Quản trị viên cấp cao" : "⭐ Khách hàng VIP"}
                      </span>
                    </div>
                  </div>

                  {/* Admin Quick Action */}
                  {(user.role === "ADMIN" || user.role === "STAFF") && (
                    <Link href="/admin" onClick={() => setOpen(false)} className="mt-3 block">
                      <Button size="sm" className="w-full h-8 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                        <span>Quản Trị Hệ Thống</span>
                      </Button>
                    </Link>
                  )}

                  {/* Customer Quick Action */}
                  <Link href="/bookings" onClick={() => setOpen(false)} className="mt-2.5 block">
                    <Button size="sm" variant="outline" className="w-full h-8 rounded-xl bg-white/10 hover:bg-white/20 border-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5">
                      <CalendarCheck className="w-3.5 h-3.5 text-orange-400" />
                      <span>Chuyến đi của tôi</span>
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50/90 to-amber-50/60 border border-orange-200/80 text-center space-y-2.5">
                  <p className="text-xs font-bold text-slate-800">Dịch vụ thuê xe du lịch chất lượng cao</p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link href="/login" onClick={() => setOpen(false)}>
                      <Button size="sm" className="w-full h-9 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-sm">
                        Đăng nhập
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setOpen(false)}>
                      <Button size="sm" variant="outline" className="w-full h-9 rounded-xl border-orange-300 text-orange-600 hover:bg-orange-50 font-bold text-xs">
                        Đăng ký
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* Navigation Menu Links */}
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2 block mb-1">
                  Danh Mục Menu
                </span>
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between p-3 rounded-2xl text-slate-700 hover:text-orange-600 hover:bg-orange-50/80 active:bg-orange-100 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl ${link.bg} ${link.color} flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-sm text-slate-800 group-hover:text-orange-600 transition-colors">
                          {link.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {link.badge && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-orange-500 text-white shadow-xs">
                            {link.badge}
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </Link>
                  );
                })}

                {/* Additional Quick Link: Chuyến đi */}
                {isAuthenticated && (
                  <Link
                    href="/bookings"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between p-3 rounded-2xl text-slate-700 hover:text-orange-600 hover:bg-orange-50/80 active:bg-orange-100 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs">
                        <CalendarCheck className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm text-slate-800 group-hover:text-orange-600 transition-colors">
                        Quản Lý Chuyến Đi
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                )}
              </div>

              {/* Dedicated Hotline Card */}
              <div className="pt-1">
                <a
                  href="tel:0859354724"
                  className="block p-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-white shadow-md shadow-orange-500/25 hover:shadow-orange-500/40 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm group-hover:scale-110 transition-transform">
                        <PhoneCall className="w-4 h-4 animate-bounce" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-orange-100 block uppercase tracking-wider">Tổng đài hỗ trợ 24/7</span>
                        <span className="font-black text-sm tracking-wider text-white">0859 354 724</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold bg-white text-orange-600 px-2 py-1 rounded-lg shadow-sm group-hover:scale-105 transition-transform">
                      Gọi ngay
                    </span>
                  </div>
                </a>
              </div>

              {/* Logout Button */}
              {isAuthenticated && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full justify-center gap-2 h-10 rounded-xl text-xs font-bold text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Đăng xuất tài khoản</span>
                  </Button>
                </div>
              )}

              {/* Trust Badge */}
              <div className="p-2 text-center">
                <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Bảo mật SSL 256-bit • Vietcombank Napas</span>
                </div>
              </div>

            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
