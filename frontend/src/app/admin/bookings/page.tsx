"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  Car, 
  User, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  Phone, 
  MapPin, 
  DollarSign, 
  Sparkles,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Driver {
  id: string;
  fullName: string;
  phone?: string;
}

interface Booking {
  id: string;
  pickupLocation: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: string;
  totalAmount: number;
  vehicle: { 
    id?: string;
    name: string; 
    licensePlate: string;
    image?: string | null;
  };
  service: { name: string };
  customer: { 
    name: string; 
    email: string;
    phone?: string | null;
  };
  driver: { fullName: string; phone: string } | null;
  createdAt?: string;
}

const statusMap: Record<string, { label: string; color: string; badge: string }> = {
  PENDING: { label: "Chờ xác nhận", color: "text-amber-700 bg-amber-50 border-amber-200", badge: "bg-amber-500" },
  CONFIRMED: { label: "Đã xác nhận", color: "text-blue-700 bg-blue-50 border-blue-200", badge: "bg-blue-500" },
  ASSIGNED: { label: "Đã xếp xe", color: "text-indigo-700 bg-indigo-50 border-indigo-200", badge: "bg-indigo-500" },
  DRIVER_ACCEPTED: { label: "Tài xế đã nhận", color: "text-purple-700 bg-purple-50 border-purple-200", badge: "bg-purple-500" },
  IN_PROGRESS: { label: "Đang di chuyển", color: "text-green-700 bg-green-50 border-green-200", badge: "bg-green-500" },
  COMPLETED: { label: "Hoàn thành", color: "text-emerald-700 bg-emerald-50 border-emerald-200", badge: "bg-emerald-500" },
  CANCELLED: { label: "Đã huỷ", color: "text-rose-700 bg-rose-50 border-rose-200", badge: "bg-rose-500" },
  REJECTED: { label: "Bị từ chối", color: "text-slate-700 bg-slate-50 border-slate-200", badge: "bg-slate-400" },
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, driversRes] = await Promise.all([
        api.get("/bookings"),
        api.get("/drivers")
      ]);
      const list = bookingsRes.data.data.bookings || [];
      setBookings(list);
      setFilteredBookings(list);
      const driverList = driversRes.data.data.drivers || [];
      setAvailableDrivers(driverList.filter((d: any) => d.status === "AVAILABLE"));
    } catch (error) {
      console.error("Failed to fetch bookings data", error);
      toast.error("Không thể tải danh sách đặt xe!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter & Search Logic
  useEffect(() => {
    let result = bookings;
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      result = result.filter(
        (b) =>
          b.customer.name?.toLowerCase().includes(q) ||
          b.customer.email.toLowerCase().includes(q) ||
          b.vehicle.name.toLowerCase().includes(q) ||
          b.vehicle.licensePlate.toLowerCase().includes(q) ||
          b.pickupLocation.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "ALL") {
      result = result.filter((b) => b.status === statusFilter);
    }
    setFilteredBookings(result);
  }, [searchKeyword, statusFilter, bookings]);

  // Update Booking Status
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status: newStatus });
      setBookings(bookings.map((b) => (b.id === id ? { ...b, status: newStatus } : b)));
      toast.success(`Đã cập nhật trạng thái đơn thành: ${statusMap[newStatus]?.label || newStatus}`);
    } catch (error: any) {
      console.error("Update status failed", error);
      toast.error(error.response?.data?.message || "Cập nhật trạng thái thất bại!");
    }
  };

  // Assign Driver
  const handleAssignDriver = async (bookingId: string, driverId: string) => {
    if (!driverId) return;
    try {
      await api.patch(`/bookings/${bookingId}/assign-driver`, { driverId });
      const driver = availableDrivers.find((d) => d.id === driverId);
      setBookings(
        bookings.map((b) => {
          if (b.id === bookingId) {
            return {
              ...b,
              status: "ASSIGNED",
              driver: driver ? { fullName: driver.fullName, phone: driver.phone || "" } : null,
            };
          }
          return b;
        })
      );
      setAvailableDrivers(availableDrivers.filter((d) => d.id !== driverId));
      toast.success("Đã phân công tài xế thành công!");
    } catch (error: any) {
      console.error("Assign driver failed", error);
      toast.error(error.response?.data?.message || "Phân công tài xế thất bại!");
    }
  };

  // Statistics
  const totalBookings = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;
  const confirmedCount = bookings.filter((b) => b.status === "CONFIRMED" || b.status === "ASSIGNED").length;
  const completedCount = bookings.filter((b) => b.status === "COMPLETED").length;
  const totalRevenue = bookings
    .filter((b) => b.status === "COMPLETED")
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Calendar className="w-8 h-8 text-orange-500" />
          <span>Quản Lý Đặt Xe & Khách Hàng</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Theo dõi chi tiết xe nào đã được ai đặt, lịch trình di chuyển và trạng thái thực hiện chuyến đi.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase">Tổng lượt đặt xe</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{totalBookings}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Tất cả các chuyến</div>
        </div>

        <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 shadow-sm">
          <div className="text-xs font-bold text-amber-700 uppercase">Chờ xác nhận ngay</div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">{pendingCount}</div>
          <div className="text-[11px] text-amber-600/80 mt-0.5">Cần duyệt đơn</div>
        </div>

        <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/80 shadow-sm">
          <div className="text-xs font-bold text-blue-700 uppercase">Đã xác nhận / Xếp xe</div>
          <div className="text-2xl sm:text-3xl font-black text-blue-600 mt-1">{confirmedCount}</div>
          <div className="text-[11px] text-blue-600/80 mt-0.5">Sắp khởi hành</div>
        </div>

        <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 shadow-sm">
          <div className="text-xs font-bold text-emerald-700 uppercase">Doanh thu hoàn thành</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalRevenue)}
          </div>
          <div className="text-[11px] text-emerald-600/80 mt-0.5">{completedCount} chuyến hoàn tất</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <Card className="rounded-2xl border border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm theo tên khách, email, tên xe, biển số, mã đơn..."
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-500 shrink-0">Lọc trạng thái:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 font-semibold text-slate-700 outline-none cursor-pointer bg-white"
              >
                <option value="ALL">Tất cả ({bookings.length})</option>
                <option value="PENDING">Chờ xác nhận ({pendingCount})</option>
                <option value="CONFIRMED">Đã xác nhận</option>
                <option value="ASSIGNED">Đã xếp xe</option>
                <option value="IN_PROGRESS">Đang chạy</option>
                <option value="COMPLETED">Hoàn thành ({completedCount})</option>
                <option value="CANCELLED">Đã huỷ</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/70 border-b border-slate-100 py-4 px-6 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold text-slate-800">
            Danh sách đơn đặt ({filteredBookings.length} chuyến)
          </CardTitle>
          <Button variant="outline" size="sm" onClick={fetchData} className="text-xs rounded-xl h-8">
            Làm mới
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <Clock className="w-8 h-8 animate-spin mx-auto text-orange-500 mb-2" />
              Đang tải danh sách chuyến đi...
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              Không tìm thấy đơn đặt xe nào phù hợp.
            </div>
          ) : (
            <div className="relative w-full overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Mã đơn</th>
                    <th className="py-3.5 px-4">Khách hàng đặt xe</th>
                    <th className="py-3.5 px-4">Xe được đặt</th>
                    <th className="py-3.5 px-4">Lịch trình & Thời gian</th>
                    <th className="py-3.5 px-4">Tài xế phụ trách</th>
                    <th className="py-3.5 px-4 text-right">Tổng tiền</th>
                    <th className="py-3.5 px-4 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Booking ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        #{b.id.substring(0, 8)}
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {b.customer.name ? b.customer.name[0].toUpperCase() : "K"}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{b.customer.name || "Khách Hàng"}</div>
                            <div className="text-[11px] text-slate-400">{b.customer.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Vehicle Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Car className="w-4 h-4 text-orange-500 shrink-0" />
                          <span>{b.vehicle.name}</span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                          Biển số: <span className="font-bold text-slate-700">{b.vehicle.licensePlate}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                          Dịch vụ: {b.service.name}
                        </div>
                      </td>

                      {/* Schedule & Route */}
                      <td className="py-3.5 px-4 min-w-[200px]">
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                            <Calendar className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                            <span>
                              {new Date(b.startDate).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                              {" → "}
                              {new Date(b.endDate).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <div className="flex items-start gap-1.5 text-[11px] text-slate-500">
                            <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="truncate max-w-[180px]" title={b.pickupLocation}>
                              {b.pickupLocation}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Driver Assigned */}
                      <td className="py-3.5 px-4">
                        {b.driver ? (
                          <div>
                            <div className="font-bold text-slate-800 flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-indigo-500" />
                              <span>{b.driver.fullName}</span>
                            </div>
                            {b.driver.phone && (
                              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                <span>{b.driver.phone}</span>
                              </div>
                            )}
                          </div>
                        ) : b.status === "CONFIRMED" ? (
                          <select
                            defaultValue=""
                            onChange={(e) => handleAssignDriver(b.id, e.target.value)}
                            className="text-xs p-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 outline-none w-full"
                          >
                            <option value="" disabled>-- Gán tài xế --</option>
                            {availableDrivers.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.fullName}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Tự lái / Chưa gán</span>
                        )}
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 text-right font-black text-orange-600 whitespace-nowrap">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(b.totalAmount)}
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4 text-center">
                        <select
                          value={b.status}
                          onChange={(e) => handleUpdateStatus(b.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-full text-xs font-bold border cursor-pointer ${
                            statusMap[b.status]?.color || "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {Object.entries(statusMap).map(([key, { label }]) => (
                            <option key={key} value={key} className="bg-white text-slate-900">
                              {label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
