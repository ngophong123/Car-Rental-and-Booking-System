"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  ArrowLeft, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  Ban, 
  Car, 
  Clock, 
  MapPin, 
  CreditCard,
  RefreshCw,
  ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface CustomerDetailData {
  customer: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    avatar: string | null;
    status: "ACTIVE" | "SUSPENDED" | "BLOCKED";
    isDeleted: boolean;
    createdAt: string;
    lastLoginAt: string | null;
  };
  statistics: {
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    totalSpending: number;
    averageBookingValue: number;
  };
  bookingHistory: Array<{
    id: string;
    vehicle: { id: string; name: string; licensePlate: string; image: string | null };
    service: { id: string; name: string };
    pickupLocation: string;
    destination: string;
    startDate: string;
    endDate: string;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
  }>;
  paymentHistory: Array<{
    id: string;
    bookingId: string;
    vehicleName: string;
    amount: number;
    method: string;
    status: string;
    transactionId: string | null;
    createdAt: string;
    paidAt: string | null;
  }>;
}

const statusBadgeStyles = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  SUSPENDED: "bg-amber-50 text-amber-700 border-amber-200",
  BLOCKED: "bg-red-50 text-red-700 border-red-200",
};

const statusLabels = {
  ACTIVE: "Đang hoạt động",
  SUSPENDED: "Tạm dừng",
  BLOCKED: "Bị khóa",
};

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const [data, setData] = useState<CustomerDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"bookings" | "payments">("bookings");

  const fetchCustomerDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/customers/${customerId}`);
      setData(res.data.data);
    } catch (error: any) {
      console.error("Error fetching customer", error);
      toast.error(error.response?.data?.message || "Không thể tải hồ sơ khách hàng");
      router.push("/admin/customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchCustomerDetail();
    }
  }, [customerId]);

  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
        <p className="text-slate-500 font-medium">Đang tải hồ sơ khách hàng...</p>
      </div>
    );
  }

  const { customer, statistics, bookingHistory, paymentHistory } = data;
  const initials = (customer.name || customer.email)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6">
      {/* 1. Back Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/customers">
            <Button variant="outline" size="sm" className="rounded-xl h-10 w-10 p-0 border-slate-200">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Chi tiết Hồ sơ Khách hàng
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Mã định danh: <span className="font-mono text-slate-600">{customer.id}</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. Customer Profile Card & Statistics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-5 rounded-3xl border border-slate-200/80 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 font-black text-xl flex items-center justify-center border border-orange-200 shadow-sm">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-black text-slate-900 truncate">
                  {customer.name || "Chưa đặt tên"}
                </h2>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusBadgeStyles[customer.status]}`}>
                    {statusLabels[customer.status]}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100 text-sm">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2 text-slate-400">
                  <Mail className="w-4 h-4 text-orange-500" /> Email:
                </span>
                <span className="font-medium text-slate-800">{customer.email}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2 text-slate-400">
                  <Phone className="w-4 h-4 text-orange-500" /> Số điện thoại:
                </span>
                <span className="font-mono font-medium text-slate-800">
                  {customer.phone || "Chưa cập nhật"}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-4 h-4 text-orange-500" /> Ngày tham gia:
                </span>
                <span className="font-medium text-slate-800">
                  {format(new Date(customer.createdAt), "dd/MM/yyyy HH:mm")}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-4 h-4 text-orange-500" /> Hoạt động gần nhất:
                </span>
                <span className="font-medium text-slate-800">
                  {customer.lastLoginAt ? format(new Date(customer.lastLoginAt), "dd/MM/yyyy HH:mm") : "Chưa ghi nhận"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 5 Statistics Cards */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white p-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng chuyến đặt</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{statistics.totalBookings}</h3>
            <span className="text-[11px] text-slate-400">Tất cả thời gian</span>
          </Card>

          <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white p-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hoàn thành</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{statistics.completedBookings}</h3>
            <span className="text-[11px] text-emerald-600 font-semibold">Chuyến trọn vẹn</span>
          </Card>

          <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white p-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đã hủy / Từ chối</p>
            <h3 className="text-2xl font-black text-red-600 mt-1">{statistics.cancelledBookings}</h3>
            <span className="text-[11px] text-slate-400">Chuyến không thực hiện</span>
          </Card>

          <Card className="col-span-2 sm:col-span-2 rounded-2xl border border-slate-200/80 shadow-sm bg-gradient-to-br from-orange-500 to-amber-600 text-white p-4">
            <p className="text-xs font-bold text-orange-100 uppercase tracking-wider">Tổng chi tiêu tích lũy</p>
            <h3 className="text-2xl sm:text-3xl font-black mt-1">{formatVND(statistics.totalSpending)}</h3>
            <span className="text-[11px] text-orange-100">Doanh thu đóng góp cho Minh Khoa</span>
          </Card>

          <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white p-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Giá trị TB / Chuyến</p>
            <h3 className="text-lg font-black text-slate-900 mt-1">{formatVND(statistics.averageBookingValue)}</h3>
            <span className="text-[11px] text-slate-400">Trung bình mỗi đơn</span>
          </Card>
        </div>
      </div>

      {/* 3. History Tabs (Bookings & Payments) */}
      <Card className="rounded-3xl border border-slate-200/80 shadow-sm bg-white overflow-hidden">
        <div className="border-b border-slate-100 px-6 pt-4 flex items-center gap-6">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`pb-4 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "bookings"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            <Car className="w-4 h-4" />
            Lịch sử đặt xe ({bookingHistory.length})
          </button>

          <button
            onClick={() => setActiveTab("payments")}
            className={`pb-4 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "payments"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Lịch sử giao dịch ({paymentHistory.length})
          </button>
        </div>

        {/* Tab 1: Bookings */}
        {activeTab === "bookings" && (
          <div className="overflow-x-auto">
            {bookingHistory.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Car className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
                <p className="font-semibold text-slate-600">Khách hàng chưa có chuyến đặt xe nào</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Mã chuyến</th>
                    <th className="py-3.5 px-4">Phương tiện</th>
                    <th className="py-3.5 px-4">Lộ trình di chuyển</th>
                    <th className="py-3.5 px-4">Thời gian thuê</th>
                    <th className="py-3.5 px-4">Tổng tiền</th>
                    <th className="py-3.5 px-4">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookingHistory.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {b.id.split("-")[0]}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{b.vehicle.name}</span>
                          <span className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-600">
                            {b.vehicle.licensePlate}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="text-slate-800 font-medium truncate max-w-xs">{b.pickupLocation}</div>
                          <div className="text-slate-400 text-xs truncate max-w-xs">➡️ {b.destination}</div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs">
                        {format(new Date(b.startDate), "dd/MM/yyyy")} - {format(new Date(b.endDate), "dd/MM/yyyy")}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatVND(b.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          b.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" :
                          b.status === "CONFIRMED" ? "bg-blue-100 text-blue-700" :
                          b.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: Payments */}
        {activeTab === "payments" && (
          <div className="overflow-x-auto">
            {paymentHistory.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
                <p className="font-semibold text-slate-600">Chưa có bản ghi thanh toán nào</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Mã giao dịch</th>
                    <th className="py-3.5 px-4">Xe thuê</th>
                    <th className="py-3.5 px-4">Số tiền</th>
                    <th className="py-3.5 px-4">Phương thức</th>
                    <th className="py-3.5 px-4">Trạng thái</th>
                    <th className="py-3.5 px-4">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paymentHistory.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {p.transactionId || p.id.split("-")[0]}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {p.vehicleName}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatVND(p.amount)}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-xs text-slate-600">
                        {p.method}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          p.status === "COMPLETED" || p.status === "PAID" ? "bg-emerald-100 text-emerald-700" :
                          p.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                          p.status === "REFUNDED" ? "bg-purple-100 text-purple-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-xs">
                        {format(new Date(p.createdAt), "dd/MM/yyyy HH:mm")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
