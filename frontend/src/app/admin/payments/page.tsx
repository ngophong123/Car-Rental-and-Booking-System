"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  CreditCard, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  RotateCcw, 
  Download, 
  Copy, 
  Check, 
  RefreshCw,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Car,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
  Wallet
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useSocket } from "@/components/providers/socket-provider";

interface PaymentRefund {
  id: string;
  amount: number;
  reason: string;
  createdAt: string;
  admin?: {
    name: string;
    email: string;
  };
}

interface Payment {
  id: string;
  amount: number;
  method: string;
  status: "PENDING" | "PAID" | "COMPLETED" | "FAILED" | "CANCELLED" | "REFUNDED" | "PARTIALLY_REFUNDED";
  transactionId?: string | null;
  paidAt?: string | null;
  createdAt: string;
  booking: {
    id: string;
    status: string;
    startDate: string;
    endDate: string;
    customer: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
    vehicle: {
      id: string;
      name: string;
      licensePlate: string;
      pricePerDay: number;
    };
  };
  refunds?: PaymentRefund[];
}

interface PaymentMetrics {
  totalRevenue: number;
  revenueToday: number;
  revenueThisMonth: number;
  countPaid: number;
  countPending: number;
  countFailed: number;
  countRefunded: number;
  totalRefunded: number;
}

const statusBadgeConfig: Record<string, { label: string; bg: string; text: string; border: string; icon: any }> = {
  PENDING: { label: "Chờ thanh toán", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: Clock },
  PAID: { label: "Đã thanh toán", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle2 },
  COMPLETED: { label: "Hoàn tất", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle2 },
  FAILED: { label: "Thất bại", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", icon: XCircle },
  CANCELLED: { label: "Đã hủy", bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200", icon: XCircle },
  REFUNDED: { label: "Đã hoàn tiền", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", icon: RotateCcw },
  PARTIALLY_REFUNDED: { label: "Hoàn một phần", bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", icon: RotateCcw },
};

const methodConfig: Record<string, { label: string; icon: any }> = {
  BANK_TRANSFER: { label: "Chuyển khoản", icon: Building2 },
  CASH: { label: "Tiền mặt", icon: Wallet },
  VNPAY: { label: "VNPAY", icon: CreditCard },
  MOMO: { label: "MoMo", icon: Wallet },
  CREDIT_CARD: { label: "Thẻ quốc tế", icon: CreditCard },
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [metrics, setMetrics] = useState<PaymentMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Refund Modal State
  const [refundModalPayment, setRefundModalPayment] = useState<Payment | null>(null);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState("");
  const [isRefunding, setIsRefunding] = useState(false);

  // Confirm Payment Modal State
  const [confirmModalPayment, setConfirmModalPayment] = useState<Payment | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const { socket } = useSocket();

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit,
        sortBy,
        sortOrder,
      };
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      if (methodFilter) params.method = methodFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get("/payments", { params });
      if (res.data.success) {
        setPayments(res.data.data.payments || []);
        setTotalPages(res.data.data.pagination?.totalPages || 1);
        setTotalCount(res.data.data.pagination?.total || 0);
        if (res.data.data.metrics) {
          setMetrics(res.data.data.metrics);
        }
      }
    } catch (error: any) {
      console.error("Lỗi khi tải danh sách thanh toán:", error);
      toast.error(error.response?.data?.message || "Không thể tải danh sách thanh toán");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter, methodFilter, startDate, endDate, sortBy, sortOrder]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Socket.IO Realtime Updates
  useEffect(() => {
    if (!socket) return;

    const handleCreated = (data: any) => {
      toast.info(`🔔 Khách hàng vừa gửi thanh toán: ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(data.amount || 0)}`);
      fetchPayments();
    };

    const handleConfirmed = () => {
      toast.success("Đã xác nhận thanh toán thành công!");
      fetchPayments();
    };

    const handleRefunded = () => {
      toast.warning("Giao dịch đã được cập nhật hoàn tiền!");
      fetchPayments();
    };

    socket.on("payment:created", handleCreated);
    socket.on("payment:confirmed", handleConfirmed);
    socket.on("payment:refunded", handleRefunded);

    return () => {
      socket.off("payment:created", handleCreated);
      socket.off("payment:confirmed", handleConfirmed);
      socket.off("payment:refunded", handleRefunded);
    };
  }, [socket, fetchPayments]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Đã sao chép mã giao dịch");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get("/payments/export/csv", {
        params,
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data], { type: "text/csv;charset=utf-8;" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `bao-cao-thanh-toan-${format(new Date(), "yyyyMMdd-HHmmss")}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Xuất file CSV thành công!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi xuất file báo cáo");
    } finally {
      setExporting(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!confirmModalPayment) return;
    setIsConfirming(true);
    try {
      await api.patch(`/payments/${confirmModalPayment.id}/confirm`);
      toast.success("Xác nhận thanh toán thành công!");
      setConfirmModalPayment(null);
      fetchPayments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi duyệt thanh toán");
    } finally {
      setIsConfirming(false);
    }
  };

  const openRefundModal = (payment: Payment) => {
    const totalRefundedAlready = payment.refunds?.reduce((sum, r) => sum + r.amount, 0) || 0;
    const remaining = Math.max(0, payment.amount - totalRefundedAlready);
    setRefundModalPayment(payment);
    setRefundAmount(remaining);
    setRefundReason("");
  };

  const handleProcessRefund = async () => {
    if (!refundModalPayment) return;
    if (refundAmount <= 0) {
      toast.error("Số tiền hoàn phải lớn hơn 0");
      return;
    }
    if (!refundReason.trim() || refundReason.trim().length < 5) {
      toast.error("Vui lòng nhập lý do hoàn tiền cụ thể (tối thiểu 5 ký tự)");
      return;
    }

    setIsRefunding(true);
    try {
      await api.post(`/payments/${refundModalPayment.id}/refund`, {
        amount: refundAmount,
        reason: refundReason.trim(),
      });
      toast.success("Xử lý hoàn tiền thành công!");
      setRefundModalPayment(null);
      fetchPayments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi xử lý hoàn tiền");
    } finally {
      setIsRefunding(false);
    }
  };

  const formatVND = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val || 0);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-orange-600" />
            Quản lý Thanh toán & Doanh thu
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Theo dõi dòng tiền, đối soát giao dịch ngân hàng, xử lý xác nhận và hoàn tiền an toàn.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            variant="outline"
            onClick={fetchPayments}
            disabled={loading}
            className="flex items-center gap-2 text-slate-700 bg-white shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
          <Button
            onClick={handleExportCSV}
            disabled={exporting}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            <Download className="h-4 w-4" />
            {exporting ? "Đang xuất..." : "Xuất CSV"}
          </Button>
        </div>
      </div>

      {/* Metrics Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="border-slate-200/80 shadow-sm bg-gradient-to-br from-white to-emerald-50/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng doanh thu</span>
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900">
                {formatVND(metrics?.totalRevenue || 0)}
              </div>
              <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 inline" /> {metrics?.countPaid || 0} giao dịch thành công
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Today */}
        <Card className="border-slate-200/80 shadow-sm bg-gradient-to-br from-white to-blue-50/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hôm nay</span>
              <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900">
                {formatVND(metrics?.revenueToday || 0)}
              </div>
              <p className="text-xs text-blue-600 font-medium mt-1">
                Doanh thu phát sinh trong 24h qua
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card className="border-slate-200/80 shadow-sm bg-gradient-to-br from-white to-amber-50/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Chờ xác nhận</span>
              <div className="p-2 bg-amber-100 text-amber-700 rounded-lg relative">
                <Clock className="h-5 w-5" />
                {(metrics?.countPending || 0) > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                )}
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900">
                {metrics?.countPending || 0}
              </div>
              <p className="text-xs text-amber-600 font-medium mt-1">
                Giao dịch cần kế toán đối soát
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Refunds */}
        <Card className="border-slate-200/80 shadow-sm bg-gradient-to-br from-white to-purple-50/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đã hoàn tiền</span>
              <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                <RotateCcw className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900">
                {formatVND(metrics?.totalRefunded || 0)}
              </div>
              <p className="text-xs text-purple-600 font-medium mt-1">
                {metrics?.countRefunded || 0} lượt giao dịch đã hoàn
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search */}
            <div className="md:col-span-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Tìm mã GD, mã FT, mã xe, tên khách..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 bg-white"
              />
            </div>

            {/* Status Filter */}
            <div className="md:col-span-2">
              <select
                aria-label="Lọc theo trạng thái"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="PENDING">Chờ thanh toán</option>
                <option value="PAID">Đã thanh toán (PAID)</option>
                <option value="COMPLETED">Hoàn tất (COMPLETED)</option>
                <option value="FAILED">Thất bại</option>
                <option value="CANCELLED">Đã hủy</option>
                <option value="REFUNDED">Đã hoàn tiền</option>
                <option value="PARTIALLY_REFUNDED">Hoàn một phần</option>
              </select>
            </div>

            {/* Method Filter */}
            <div className="md:col-span-2">
              <select
                aria-label="Lọc theo phương thức"
                value={methodFilter}
                onChange={(e) => {
                  setMethodFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Tất cả phương thức</option>
                <option value="BANK_TRANSFER">Chuyển khoản</option>
                <option value="CASH">Tiền mặt</option>
                <option value="VNPAY">VNPAY</option>
                <option value="MOMO">Ví MoMo</option>
                <option value="CREDIT_CARD">Thẻ quốc tế</option>
              </select>
            </div>

            {/* Date Range Start */}
            <div className="md:col-span-2">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="bg-white text-sm"
                title="Từ ngày"
              />
            </div>

            {/* Date Range End */}
            <div className="md:col-span-2">
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="bg-white text-sm"
                title="Đến ngày"
              />
            </div>
          </div>

          {(search || statusFilter || methodFilter || startDate || endDate) && (
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Đang áp dụng bộ lọc</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("");
                  setMethodFilter("");
                  setStartDate("");
                  setEndDate("");
                  setPage(1);
                }}
                className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              >
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Payment Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4">Mã GD / FT</th>
                <th className="py-3.5 px-4">Khách hàng</th>
                <th className="py-3.5 px-4">Chuyến xe</th>
                <th className="py-3.5 px-4 text-right">Số tiền</th>
                <th className="py-3.5 px-4">Phương thức</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4">Thời gian</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-orange-500" />
                    Đang tải dữ liệu thanh toán...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <CreditCard className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                    Không tìm thấy giao dịch nào phù hợp.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => {
                  const statusConf = statusBadgeConfig[payment.status] || {
                    label: payment.status,
                    bg: "bg-slate-100",
                    text: "text-slate-700",
                    border: "border-slate-200",
                    icon: AlertCircle,
                  };
                  const StatusIcon = statusConf.icon;
                  const methodConf = methodConfig[payment.method] || { label: payment.method, icon: Wallet };
                  const MethodIcon = methodConf.icon;

                  const totalRefundedAlready = payment.refunds?.reduce((sum, r) => sum + r.amount, 0) || 0;
                  const canRefund =
                    ["PAID", "COMPLETED", "PARTIALLY_REFUNDED"].includes(payment.status) &&
                    payment.amount > totalRefundedAlready;

                  return (
                    <tr key={payment.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Mã GD & Transaction ID */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-semibold text-slate-900 flex items-center gap-1.5">
                          <span title={payment.id}>#{payment.id.slice(0, 8)}</span>
                          <button
                            onClick={() => handleCopy(payment.id, payment.id)}
                            className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                            title="Sao chép ID"
                          >
                            {copiedId === payment.id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                        {payment.transactionId && (
                          <div className="mt-1 flex items-center gap-1">
                            <span className="text-[11px] font-mono bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200 font-bold">
                              FT: {payment.transactionId}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Khách hàng */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900">
                          {payment.booking?.customer?.name || "Khách vãng lai"}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          {payment.booking?.customer?.phone || payment.booking?.customer?.email || "—"}
                        </div>
                      </td>

                      {/* Chuyến xe */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-900 font-medium flex items-center gap-1.5">
                          <Car className="h-3.5 w-3.5 text-slate-400" />
                          {payment.booking?.vehicle?.name || "Chuyến xe"}
                        </div>
                        <div className="text-xs text-slate-500">
                          Biển số: {payment.booking?.vehicle?.licensePlate || "—"}
                        </div>
                      </td>

                      {/* Số tiền */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-bold text-slate-900 text-base">
                          {formatVND(payment.amount)}
                        </span>
                        {totalRefundedAlready > 0 && (
                          <div className="text-[11px] text-purple-600 font-medium">
                            Đã hoàn: -{formatVND(totalRefundedAlready)}
                          </div>
                        )}
                      </td>

                      {/* Phương thức */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                          <MethodIcon className="h-3.5 w-3.5 text-slate-500" />
                          {methodConf.label}
                        </span>
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusConf.bg} ${statusConf.text} ${statusConf.border}`}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />
                          {statusConf.label}
                        </span>
                      </td>

                      {/* Thời gian */}
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        <div>Tạo: {format(new Date(payment.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}</div>
                        {payment.paidAt && (
                          <div className="text-emerald-600 font-medium">
                            Trả: {format(new Date(payment.paidAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                          </div>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/admin/payments/${payment.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-slate-600 hover:text-slate-900">
                              <Eye className="h-4 w-4 mr-1" />
                              Chi tiết
                            </Button>
                          </Link>

                          {payment.status === "PENDING" && (
                            <Button
                              size="sm"
                              onClick={() => setConfirmModalPayment(payment)}
                              className="h-8 px-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs shadow-sm"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                              Duyệt
                            </Button>
                          )}

                          {canRefund && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openRefundModal(payment)}
                              className="h-8 px-2.5 text-purple-600 border-purple-200 hover:bg-purple-50 text-xs"
                            >
                              <RotateCcw className="h-3.5 w-3.5 mr-1" />
                              Hoàn tiền
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <span>Hiển thị</span>
            <select
              aria-label="Số dòng mỗi trang"
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="h-8 px-2 rounded border border-slate-200 bg-white text-xs"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>trong tổng số <strong className="text-slate-900">{totalCount}</strong> giao dịch</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="h-8 px-2.5 text-xs"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Trước
            </Button>
            <span className="text-xs px-2 font-medium">
              Trang {page} / {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="h-8 px-2.5 text-xs"
            >
              Sau <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Confirm Payment Modal */}
      {confirmModalPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-2 bg-amber-50 rounded-full">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Xác nhận đã nhận tiền</h3>
            </div>
            
            <p className="text-sm text-slate-600 leading-relaxed">
              Bạn có chắc chắn đã kiểm tra sao kê ngân hàng và nhận đủ số tiền{" "}
              <strong className="text-slate-900 font-bold">
                {formatVND(confirmModalPayment.amount)}
              </strong>{" "}
              từ khách hàng{" "}
              <strong className="text-slate-900">
                {confirmModalPayment.booking?.customer?.name}
              </strong>
              ?
            </p>

            <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1 text-slate-600 border border-slate-200">
              <div>Mã GD: <span className="font-mono font-semibold">#{confirmModalPayment.id.slice(0, 8)}</span></div>
              {confirmModalPayment.transactionId && (
                <div>Mã đối soát FT: <span className="font-mono font-bold text-orange-600">{confirmModalPayment.transactionId}</span></div>
              )}
              <div>Phương thức: {confirmModalPayment.method}</div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setConfirmModalPayment(null)}
                disabled={isConfirming}
              >
                Hủy bỏ
              </Button>
              <Button
                onClick={handleConfirmPayment}
                disabled={isConfirming}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isConfirming ? "Đang xử lý..." : "Xác nhận đã nhận tiền"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {refundModalPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-purple-600">
              <div className="p-2 bg-purple-50 rounded-full">
                <RotateCcw className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Xử lý hoàn tiền giao dịch</h3>
                <p className="text-xs text-slate-500">Mã GD: #{refundModalPayment.id.slice(0, 8)}</p>
              </div>
            </div>

            {/* Financial Overview for Refund */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg text-center border border-slate-200">
              <div>
                <div className="text-[11px] text-slate-500 uppercase">Đã thanh toán</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">
                  {formatVND(refundModalPayment.amount)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 uppercase">Đã hoàn trước</div>
                <div className="font-bold text-purple-600 text-sm mt-0.5">
                  {formatVND(refundModalPayment.refunds?.reduce((s, r) => s + r.amount, 0) || 0)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 uppercase">Tối đa có thể hoàn</div>
                <div className="font-bold text-emerald-600 text-sm mt-0.5">
                  {formatVND(
                    refundModalPayment.amount - (refundModalPayment.refunds?.reduce((s, r) => s + r.amount, 0) || 0)
                  )}
                </div>
              </div>
            </div>

            {/* Refund Amount Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">
                Số tiền hoàn (VNĐ) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                min={1000}
                max={
                  refundModalPayment.amount - (refundModalPayment.refunds?.reduce((s, r) => s + r.amount, 0) || 0)
                }
                value={refundAmount || ""}
                onChange={(e) => setRefundAmount(Number(e.target.value))}
                placeholder="Nhập số tiền muốn hoàn..."
                className="font-mono text-base font-bold"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const max =
                      refundModalPayment.amount - (refundModalPayment.refunds?.reduce((s, r) => s + r.amount, 0) || 0);
                    setRefundAmount(Math.floor(max * 0.5));
                  }}
                  className="text-xs h-7"
                >
                  Hoàn 50%
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const max =
                      refundModalPayment.amount - (refundModalPayment.refunds?.reduce((s, r) => s + r.amount, 0) || 0);
                    setRefundAmount(max);
                  }}
                  className="text-xs h-7"
                >
                  Hoàn tối đa (100%)
                </Button>
              </div>
            </div>

            {/* Refund Reason Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">
                Lý do hoàn tiền <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Vui lòng nêu rõ lý do hoàn tiền (VD: Khách hủy chuyến trước 24h, lỗi thanh toán trùng...)"
                className="w-full text-sm p-3 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setRefundModalPayment(null)}
                disabled={isRefunding}
              >
                Hủy
              </Button>
              <Button
                onClick={handleProcessRefund}
                disabled={isRefunding}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isRefunding ? "Đang hoàn tiền..." : "Xác nhận hoàn tiền"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
