"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  ShieldAlert, 
  CheckCircle2, 
  Ban, 
  Trash2, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  X,
  AlertTriangle,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface Customer {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  avatar: string | null;
  status: "ACTIVE" | "SUSPENDED" | "BLOCKED";
  isDeleted: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  totalBookings: number;
  completedBookings: number;
  totalSpent: number;
}

interface SummaryMetrics {
  totalCustomers: number;
  activeCount: number;
  suspendedCount: number;
  blockedCount: number;
  newThisMonthCount: number;
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

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [summary, setSummary] = useState<SummaryMetrics>({
    totalCustomers: 0,
    activeCount: 0,
    suspendedCount: 0,
    blockedCount: 0,
    newThisMonthCount: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters & Pagination State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Action Modals State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", status: "ACTIVE" as any });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"SUSPEND" | "ACTIVATE" | "BLOCK" | "DELETE" | null>(null);
  const [actionReason, setActionReason] = useState("");

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/customers", {
        params: {
          page,
          limit,
          search: search.trim() || undefined,
          status: statusFilter,
          sortBy,
        },
      });

      const { customers, pagination, summary } = res.data.data;
      setCustomers(customers || []);
      setTotalPages(pagination.totalPages || 1);
      setTotalRecords(pagination.total || 0);
      if (summary) setSummary(summary);
    } catch (error: any) {
      console.error("Failed to load customers", error);
      toast.error(error.response?.data?.message || "Không thể tải danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter, sortBy]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchCustomers]);

  // Open Edit Modal
  const handleOpenEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditForm({
      name: customer.name || "",
      email: customer.email,
      phone: customer.phone || "",
      status: customer.status,
    });
    setEditModalOpen(true);
  };

  // Submit Edit Form
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    try {
      setIsSubmitting(true);
      await api.patch(`/admin/customers/${selectedCustomer.id}`, editForm);
      toast.success("Cập nhật thông tin khách hàng thành công!");
      setEditModalOpen(false);
      fetchCustomers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi cập nhật khách hàng");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Status Confirmation Modal
  const handleOpenConfirm = (customer: Customer, action: "SUSPEND" | "ACTIVATE" | "BLOCK" | "DELETE") => {
    setSelectedCustomer(customer);
    setConfirmAction(action);
    setActionReason("");
    setConfirmModalOpen(true);
  };

  // Execute Status / Delete Action
  const handleExecuteAction = async () => {
    if (!selectedCustomer || !confirmAction) return;
    try {
      setIsSubmitting(true);
      if (confirmAction === "DELETE") {
        await api.delete(`/admin/customers/${selectedCustomer.id}`);
        toast.success("Đã vô hiệu hóa tài khoản và bảo lưu lịch sử thành công!");
      } else {
        const targetStatus = confirmAction === "ACTIVATE" ? "ACTIVE" : confirmAction === "SUSPEND" ? "SUSPENDED" : "BLOCKED";
        await api.post(`/admin/customers/${selectedCustomer.id}/status`, {
          status: targetStatus,
          reason: actionReason,
        });
        toast.success(`Đã cập nhật trạng thái khách hàng thành ${statusLabels[targetStatus]}!`);
      }
      setConfirmModalOpen(false);
      fetchCustomers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi thực hiện thao tác");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Summary Cards */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Quản lý Khách hàng
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Theo dõi danh sách khách hàng, lịch sử thuê xe và kiểm soát tài khoản hệ thống
            </p>
          </div>
          <Button
            variant="outline"
            onClick={fetchCustomers}
            disabled={loading}
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 self-start sm:self-auto"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin text-orange-500" : ""}`} />
            Làm mới
          </Button>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng khách hàng</p>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{summary.totalCustomers}</h3>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                  +{summary.newThisMonthCount} khách mới tháng này
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Đang hoạt động</p>
                <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{summary.activeCount}</h3>
                <span className="text-[11px] text-slate-400 mt-1">Tài khoản hợp lệ</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tạm dừng</p>
                <h3 className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">{summary.suspendedCount}</h3>
                <span className="text-[11px] text-slate-400 mt-1">Chờ đối soát</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Đã khóa</p>
                <h3 className="text-2xl sm:text-3xl font-black text-red-600 mt-1">{summary.blockedCount}</h3>
                <span className="text-[11px] text-slate-400 mt-1">Vi phạm chính sách</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Ban className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Tìm kiếm theo họ tên, email, số điện thoại..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-xs sm:text-sm outline-none bg-slate-50/50"
              />
              {search && (
                <button
                  onClick={() => { setSearch(""); setPage(1); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="md:col-span-3">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 text-xs sm:text-sm outline-none bg-white font-medium text-slate-700"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="SUSPENDED">Tạm dừng</option>
                <option value="BLOCKED">Bị khóa</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div className="md:col-span-3">
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 text-xs sm:text-sm outline-none bg-white font-medium text-slate-700"
              >
                <option value="newest">Ngày đăng ký: Mới nhất</option>
                <option value="oldest">Ngày đăng ký: Cũ nhất</option>
                <option value="most_bookings">Nhiều chuyến đi nhất</option>
                <option value="highest_spending">Chi tiêu nhiều nhất</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Customers Table */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Khách hàng</th>
                <th className="py-3.5 px-4">Số điện thoại</th>
                <th className="py-3.5 px-4 text-center">Số chuyến</th>
                <th className="py-3.5 px-4">Tổng chi tiêu</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4">Ngày đăng ký</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-12 mx-auto"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    <td className="py-4 px-4"><div className="h-6 bg-slate-200 rounded-full w-20"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    <td className="py-4 px-4"><div className="h-8 bg-slate-200 rounded w-16 ml-auto"></div></td>
                  </tr>
                ))
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="font-semibold text-slate-600">Không tìm thấy khách hàng nào</p>
                    <p className="text-xs text-slate-400 mt-1">Thử thay đổi từ khóa tìm kiếm hoặc bỏ bộ lọc</p>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => {
                  const initials = (customer.name || customer.email)
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <tr key={customer.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center shrink-0 border border-orange-200 text-xs">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/customers/${customer.id}`}
                              className="font-bold text-slate-900 hover:text-orange-600 transition-colors truncate block"
                            >
                              {customer.name || "Chưa cập nhật tên"}
                            </Link>
                            <span className="text-xs text-slate-400 flex items-center gap-1 truncate">
                              <Mail className="w-3 h-3" /> {customer.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {customer.phone ? (
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {customer.phone}
                          </span>
                        ) : (
                          <span className="text-slate-300 italic">Chưa có SĐT</span>
                        )}
                      </td>

                      {/* Bookings Count */}
                      <td className="py-3.5 px-4 text-center font-bold">
                        <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-full text-xs">
                          {customer.totalBookings} chuyến
                        </span>
                      </td>

                      {/* Total Spent */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatVND(customer.totalSpent)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusBadgeStyles[customer.status]}`}>
                          {statusLabels[customer.status]}
                        </span>
                      </td>

                      {/* Registered Date */}
                      <td className="py-3.5 px-4 text-slate-500 text-xs">
                        {format(new Date(customer.createdAt), "dd/MM/yyyy")}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/customers/${customer.id}`}>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-600 hover:text-orange-600" title="Xem hồ sơ">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>

                          <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(customer)} className="h-8 w-8 p-0 text-slate-600 hover:text-blue-600" title="Chỉnh sửa">
                            <Edit className="w-4 h-4" />
                          </Button>

                          {customer.status === "ACTIVE" ? (
                            <Button size="sm" variant="ghost" onClick={() => handleOpenConfirm(customer, "SUSPEND")} className="h-8 w-8 p-0 text-amber-500 hover:text-amber-700 hover:bg-amber-50" title="Tạm dừng">
                              <AlertTriangle className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => handleOpenConfirm(customer, "ACTIVATE")} className="h-8 w-8 p-0 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50" title="Kích hoạt">
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                          )}

                          <Button size="sm" variant="ghost" onClick={() => handleOpenConfirm(customer, "BLOCK")} className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" title="Khóa tài khoản">
                            <Ban className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Hiển thị <span className="font-bold text-slate-800">{customers.length}</span> trên tổng số <span className="font-bold text-slate-800">{totalRecords}</span> khách hàng
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 mr-2">
              <span>Số dòng:</span>
              <select
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                className="border border-slate-200 rounded-lg px-2 py-1 bg-white text-xs outline-none"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="h-8 px-2.5 rounded-lg"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Trước
            </Button>

            <span className="font-bold text-slate-800 px-2">
              Trang {page} / {totalPages}
            </span>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="h-8 px-2.5 rounded-lg"
            >
              Sau <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      {/* 5. Edit Customer Modal */}
      {editModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-orange-500" />
                Chỉnh sửa thông tin khách hàng
              </h3>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Họ và tên</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 text-xs sm:text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 text-xs sm:text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Số điện thoại</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="VD: 0912345678"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 text-xs sm:text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Trạng thái tài khoản</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 text-xs sm:text-sm outline-none bg-white font-semibold"
                >
                  <option value="ACTIVE">Đang hoạt động (Active)</option>
                  <option value="SUSPENDED">Tạm dừng (Suspended)</option>
                  <option value="BLOCKED">Khóa tài khoản (Blocked)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)} className="rounded-xl">
                  Hủy bỏ
                </Button>
                <Button type="submit" disabled={isSubmitting} className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold">
                  {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Confirmation Modal (Suspend / Activate / Block / Delete) */}
      {confirmModalOpen && selectedCustomer && confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center bg-orange-100 text-orange-600">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="font-black text-lg text-slate-900">
                {confirmAction === "ACTIVATE" ? "Xác nhận kích hoạt tài khoản" :
                 confirmAction === "SUSPEND" ? "Xác nhận tạm dừng tài khoản" :
                 confirmAction === "BLOCK" ? "Xác nhận khóa tài khoản" : "Vô hiệu hóa khách hàng"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                Bạn có chắc chắn muốn thực hiện thao tác này đối với khách hàng{" "}
                <span className="font-bold text-slate-800">{selectedCustomer.name || selectedCustomer.email}</span>?
              </p>
            </div>

            {confirmAction !== "ACTIVATE" && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Lý do ghi nhận (Audit Log)</label>
                <textarea
                  rows={2}
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Nhập lý do thực hiện để lưu vết kiểm toán..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-orange-500"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setConfirmModalOpen(false)} className="rounded-xl w-full">
                Hủy bỏ
              </Button>
              <Button
                onClick={handleExecuteAction}
                disabled={isSubmitting}
                className={`rounded-xl w-full text-white font-bold ${
                  confirmAction === "ACTIVATE" ? "bg-emerald-600 hover:bg-emerald-700" :
                  confirmAction === "SUSPEND" ? "bg-amber-600 hover:bg-amber-700" :
                  "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
