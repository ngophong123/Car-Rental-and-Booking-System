"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Car, Users, Calendar, LayoutDashboard, Settings, Wallet } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { name: "Tổng quan", href: "/admin", icon: LayoutDashboard },
  { name: "Quản lý xe", href: "/admin/vehicles", icon: Car },
  { name: "Khách hàng", href: "/admin/customers", icon: Users },
  { name: "Đặt chuyến", href: "/admin/bookings", icon: Calendar },
  { name: "Thanh toán", href: "/admin/payments", icon: Wallet },
  { name: "Cài đặt", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (!isAuthenticated) {
      router.push("/login");
    } else if (user?.role !== "ADMIN" && user?.role !== "STAFF") {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  if (!mounted || !isAuthenticated || (user?.role !== "ADMIN" && user?.role !== "STAFF")) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex mt-16">
        <nav className="flex flex-col gap-4 px-2 py-4">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col sm:pl-64 pt-6">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
