"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ChevronLeft, 
  CreditCard, 
  User, 
  Car, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Copy, 
  Check, 
  RefreshCw,
  Printer,
  ShieldCheck,
  Building2,
  Wallet,
  AlertCircle,
  FileText,
  MapPin,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface RefundItem {
  id: string;
  amount: number;
  reason: string;
  createdAt: string;
  admin?: {
    id: string;
    name: string;
    email: string;
  };
}

interface PaymentDetail {
  id: string;
  amount: number;
  method: string;
  status: "PENDING" | "PAID" | "COMPLETED" | "FAILED" | "CANCELLED" | "REFUNDED" | "PARTIALLY_REFUNDED";
  transactionId?: string | null;
  idempotencyKey?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
  booking: {
    id: string;
    status: string;
    startDate: string;
    endDate: string;
    totalAmount: number;
    pickupLocation?: string;
    dropoffLocation?: string;
    notes?: string;
    customer: {
      id: string;
      name: string;
      email: string;
      phone: string;
      status: string;
    };
    vehicle: {
      id: string;
      name: string;
      type: string;
      licensePlate: string;
      pricePerDay: number;
      images?: string[];
    };
  };
  refunds: RefundItem[];
}

const statusBadgeConfig: Record<string, { label: string; bg: string; text: string; border: string; icon: any }> = {
  PENDING: { label: "Chờ thanh toán", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: Clock },
  PAID: { label: "Đã thanh toán (PAID)", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle2 },
  COMPLETED: { label: "Hoàn tất (COMPLETED)", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle2 },
  FAILED: { label: "Thất bại", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", icon: XCircle },
  CANCELLED: { label: "Đã hủy", bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200", icon: XCircle },
  REFUNDED: { label: "Đã hoàn tiền", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", icon: RotateCcw },
  PARTIALLY_REFUNDED: { label: "Hoàn một phần", bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", icon: RotateCcw },
};

const methodConfig: Record<string, { label: string; icon: any }> = {
  BANK_TRANSFER: { label: "Chuyển khoản ngân hàng", icon: Building2 },
  CASH: { label: "Tiền mặt trực tiếp", icon: Wallet },
  VNPAY: { label: "Cổng thanh toán VNPAY", icon: CreditCard },
  MOMO: { label: "Ví điện tử MoMo", icon: Wallet },
  CREDIT_CARD: { label: "Thẻ thanh toán quốc tế", icon: CreditCard },
};

export default function AdminPaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const paymentId = resolvedParams.id;
  const router = useRouter();

  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Refund Modal State
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState("");
  const [isRefunding, setIsRefunding] = useState(false);

  // Confirm Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const fetchPayment = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/payments/${paymentId}`);
      if (res.data.success) {
        setPayment(res.data.data.payment);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Không thể tải chi tiết giao dịch");
    } finally {
      setLoading(false);
    }
  }, [paymentId]);

  useEffect(() => {
    fetchPayment();
  }, [fetchPayment]);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`Đã sao chép ${fieldName}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmPayment = async () => {
    setIsConfirming(true);
    try {
      await api.patch(`/payments/${paymentId}/confirm`);
      toast.success("Xác nhận thanh toán thành công!");
      setShowConfirmModal(false);
      fetchPayment();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi xác nhận giao dịch");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleProcessRefund = async () => {
    if (!payment) return;
    if (refundAmount <= 0) {
      toast.error("Số tiền hoàn phải lớn hơn 0");
      return;
    }
    if (!refundReason.trim() || refundReason.trim().length < 5) {
      toast.error("Vui lòng nêu rõ lý do hoàn tiền (tối thiểu 5 ký tự)");
      return;
    }

    setIsRefunding(true);
    try {
      await api.post(`/payments/${paymentId}/refund`, {
        amount: refundAmount,
        reason: refundReason.trim(),
      });
      toast.success("Xử lý hoàn tiền thành công!");
      setShowRefundModal(false);
      fetchPayment();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi xử lý hoàn tiền");
    } finally {
      setIsRefunding(false);
    }
  };

  const formatVND = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val || 0);
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-orange-500 mb-3" />
        <p className="text-slate-500 font-medium">Đang tải thông tin chi tiết giao dịch...</p>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="py-24 text-center">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy giao dịch</h2>
        <p className="text-slate-500 mt-1 mb-6">Mã giao dịch có thể không tồn tại hoặc đã bị xóa.</p>
        <Link href="/admin/payments">
          <Button variant="outline">
            <ChevronLeft className="h-4 w-4 mr-1" /> Quay lại danh sách
          </Button>
        </Link>
      </div>
    );
  }

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

  const totalRefunded = payment.refunds?.reduce((s, r) => s + r.amount, 0) || 0;
  const maxRefundable = Math.max(0, payment.amount - totalRefunded);
  const canRefund =
    ["PAID", "COMPLETED", "PARTIALLY_REFUNDED"].includes(payment.status) && maxRefundable > 0;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/payments">
            <Button variant="outline" size="sm" className="h-9 px-3 text-slate-700 bg-white">
              <ChevronLeft className="h-4 w-4 mr-1" /> Danh sách thanh toán
            </Button>
          </Link>
          <div className="h-4 w-px bg-slate-300 hidden sm:block" />
          <span className="font-mono text-sm text-slate-500 hidden sm:inline">
            ID: #{payment.id}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="h-9 text-slate-700 bg-white"
          >
            <Printer className="h-4 w-4 mr-1.5" /> In phiếu thu
          </Button>

          {payment.status === "PENDING" && (
            <Button
              size="sm"
              onClick={() => setShowConfirmModal(true)}
              className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm"
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" /> Xác nhận đã nhận tiền
            </Button>
          )}

          {canRefund && (
            <Button
              size="sm"
              onClick={() => {
                setRefundAmount(maxRefundable);
                setRefundReason("");
                setShowRefundModal(true);
              }}
              className="h-9 bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-sm"
            >
              <RotateCcw className="h-4 w-4 mr-1.5" /> Hoàn tiền
            </Button>
          )}
        </div>
      </div>

      {/* Main Payment Header Card */}
      <Card className="border-slate-200/80 shadow-sm bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${statusConf.bg} ${statusConf.text} ${statusConf.border}`}
                >
                  <StatusIcon className="h-4 w-4" />
                  {statusConf.label}
                </span>
                <span className="text-xs bg-slate-700/80 text-slate-300 px-2.5 py-1 rounded-md font-mono flex items-center gap-1">
                  Mã GD: #{payment.id.slice(0, 10)}
                  <button
                    onClick={() => handleCopy(payment.id, "Mã GD")}
                    className="hover:text-white ml-1"
                  >
                    {copiedField === "Mã GD" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </span>
              </div>
              <div className="text-3xl md:text-4xl font-black tracking-tight text-white mt-3">
                {formatVND(payment.amount)}
              </div>
              {totalRefunded > 0 && (
                <p className="text-sm text-purple-300 mt-1">
                  (Đã hoàn: -{formatVND(totalRefunded)} • Thực thu: {formatVND(payment.amount - totalRefunded)})
                </p>
              )}
            </div>

            {/* Quick metadata right */}
            <div className="flex flex-col gap-2 text-sm text-slate-300 bg-slate-800/60 p-4 rounded-xl border border-slate-700 w-full md:w-auto">
              <div className="flex items-center justify-between gap-6">
                <span className="text-slate-400">Phương thức:</span>
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <MethodIcon className="h-4 w-4 text-orange-400" />
                  {methodConf.label}
                </span>
              </div>
              {payment.transactionId && (
                <div className="flex items-center justify-between gap-6">
                  <span className="text-slate-400">Mã FT / Đối soát:</span>
                  <span className="font-mono font-bold text-orange-400 flex items-center gap-1">
                    {payment.transactionId}
                    <button
                      onClick={() => handleCopy(payment.transactionId!, "Mã FT")}
                      className="hover:text-white"
                    >
                      {copiedField === "Mã FT" ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between gap-6">
                <span className="text-slate-400">Thời gian tạo:</span>
                <span className="font-medium text-white">
                  {format(new Date(payment.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: vi })}
                </span>
              </div>
              {payment.paidAt && (
                <div className="flex items-center justify-between gap-6">
                  <span className="text-slate-400">Thời gian thanh toán:</span>
                  <span className="font-medium text-emerald-400">
                    {format(new Date(payment.paidAt), "dd/MM/yyyy HH:mm:ss", { locale: vi })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid: 2 Columns for detailed breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Details & Refund History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Information */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-600" />
                  Thông tin Chuyến xe & Đặt chỗ
                </span>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  Mã: #{payment.booking?.id?.slice(0, 8)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 block text-xs uppercase font-semibold">Thời gian thuê</span>
                  <div className="mt-1 font-medium text-slate-800 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    {payment.booking?.startDate
                      ? format(new Date(payment.booking.startDate), "dd/MM/yyyy", { locale: vi })
                      : "—"}{" "}
                    đến{" "}
                    {payment.booking?.endDate
                      ? format(new Date(payment.booking.endDate), "dd/MM/yyyy", { locale: vi })
                      : "—"}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block text-xs uppercase font-semibold">Trạng thái chuyến</span>
                  <div className="mt-1">
                    <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-800 border">
                      {payment.booking?.status || "—"}
                    </span>
                  </div>
                </div>

                {payment.booking?.pickupLocation && (
                  <div>
                    <span className="text-slate-500 block text-xs uppercase font-semibold">Điểm đón</span>
                    <div className="mt-1 text-slate-800 flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                      {payment.booking.pickupLocation}
                    </div>
                  </div>
                )}

                {payment.booking?.dropoffLocation && (
                  <div>
                    <span className="text-slate-500 block text-xs uppercase font-semibold">Điểm trả</span>
                    <div className="mt-1 text-slate-800 flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                      {payment.booking.dropoffLocation}
                    </div>
                  </div>
                )}

                <div className="sm:col-span-2 pt-2 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-slate-500 text-sm">Tổng giá trị đơn đặt:</span>
                  <span className="text-base font-bold text-slate-900">
                    {formatVND(payment.booking?.totalAmount || 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Information */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Car className="h-5 w-5 text-orange-600" />
                Thông tin Phương tiện Thuê
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-slate-900">
                    {payment.booking?.vehicle?.name || "Không rõ thông tin xe"}
                  </h4>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <span className="font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-bold text-slate-800">
                      {payment.booking?.vehicle?.licensePlate || "Biển số chưa cập nhật"}
                    </span>
                    <span>Loại: {payment.booking?.vehicle?.type || "Xe du lịch"}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Đơn giá thuê</span>
                  <span className="text-base font-bold text-orange-600">
                    {formatVND(payment.booking?.vehicle?.pricePerDay || 0)} / ngày
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Refund History Timeline */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <RotateCcw className="h-5 w-5 text-purple-600" />
                  Lịch sử Hoàn tiền ({payment.refunds?.length || 0})
                </span>
                {totalRefunded > 0 && (
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
                    Tổng hoàn: {formatVND(totalRefunded)}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {!payment.refunds || payment.refunds.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">
                  Chưa có giao dịch hoàn tiền nào cho khoản thu này.
                </div>
              ) : (
                <div className="space-y-4">
                  {payment.refunds.map((refund, idx) => (
                    <div
                      key={refund.id}
                      className="p-4 rounded-lg bg-purple-50/50 border border-purple-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-purple-800 font-bold bg-purple-100 px-2 py-0.5 rounded">
                            Lần #{idx + 1}
                          </span>
                          <span className="text-xs text-slate-500">
                            {format(new Date(refund.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: vi })}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-800">
                          <span className="text-slate-500 font-normal">Lý do:</span> {refund.reason}
                        </p>
                        {refund.admin && (
                          <p className="text-xs text-slate-500">
                            Người duyệt: <strong className="text-slate-700">{refund.admin.name}</strong> ({refund.admin.email})
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-base font-bold text-purple-700 font-mono">
                          +{formatVND(refund.amount)}
                        </div>
                        <span className="text-[11px] text-purple-600 font-medium">Đã giải ngân hoàn</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 Col): Customer Card & Security audit */}
        <div className="space-y-6">
          {/* Customer Info Card */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <User className="h-5 w-5 text-orange-600" />
                  Khách hàng
                </span>
                {payment.booking?.customer?.id && (
                  <Link
                    href={`/admin/customers/${payment.booking.customer.id}`}
                    className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                  >
                    Xem hồ sơ <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <div className="text-lg font-bold text-slate-900">
                  {payment.booking?.customer?.name || "Khách vãng lai"}
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  ID: {payment.booking?.customer?.id}
                </div>
              </div>

              <div className="space-y-2.5 text-sm pt-2 border-t border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Số điện thoại:</span>
                  <span className="font-semibold text-slate-800">
                    {payment.booking?.customer?.phone || "Chưa cập nhật"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-semibold text-slate-800 break-all text-right">
                    {payment.booking?.customer?.email || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Trạng thái tài khoản:</span>
                  <span className="font-bold text-emerald-600">
                    {payment.booking?.customer?.status || "ACTIVE"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical & Audit Card */}
          <Card className="border-slate-200 shadow-sm bg-slate-50/50">
            <CardHeader className="border-b border-slate-200/60 pb-3">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-slate-600" />
                Thông số Kỹ thuật & Đối soát
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs text-slate-600">
              <div>
                <span className="text-slate-500 block">Idempotency Key (Chống lặp thanh toán):</span>
                <span className="font-mono text-slate-800 font-semibold break-all">
                  {payment.idempotencyKey || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Mã đối soát FT / GD:</span>
                <span className="font-mono text-orange-700 font-bold">
                  {payment.transactionId || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Lần cập nhật cuối:</span>
                <span className="text-slate-800">
                  {format(new Date(payment.updatedAt), "dd/MM/yyyy HH:mm:ss", { locale: vi })}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center gap-3 text-emerald-600">
              <div className="p-2 bg-emerald-50 rounded-full">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Xác nhận thu tiền</h3>
            </div>
            
            <p className="text-sm text-slate-600 leading-relaxed">
              Bạn xác nhận đã nhận đủ số tiền{" "}
              <strong className="text-slate-900 font-bold">{formatVND(payment.amount)}</strong> vào tài khoản ngân hàng?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                disabled={isConfirming}
              >
                Hủy
              </Button>
              <Button
                onClick={handleConfirmPayment}
                disabled={isConfirming}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isConfirming ? "Đang xử lý..." : "Xác nhận đã nhận"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-5 border border-slate-200">
            <div className="flex items-center gap-3 text-purple-600">
              <div className="p-2 bg-purple-50 rounded-full">
                <RotateCcw className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Xử lý hoàn tiền giao dịch</h3>
                <p className="text-xs text-slate-500">Mã GD: #{payment.id.slice(0, 10)}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg text-center border border-slate-200">
              <div>
                <div className="text-[11px] text-slate-500 uppercase">Đã thanh toán</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{formatVND(payment.amount)}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 uppercase">Đã hoàn trước</div>
                <div className="font-bold text-purple-600 text-sm mt-0.5">{formatVND(totalRefunded)}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 uppercase">Tối đa có thể hoàn</div>
                <div className="font-bold text-emerald-600 text-sm mt-0.5">{formatVND(maxRefundable)}</div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">
                Số tiền hoàn (VNĐ) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                min={1000}
                max={maxRefundable}
                value={refundAmount || ""}
                onChange={(e) => setRefundAmount(Number(e.target.value))}
                className="font-mono text-base font-bold"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRefundAmount(Math.floor(maxRefundable * 0.5))}
                  className="text-xs h-7"
                >
                  Hoàn 50%
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRefundAmount(maxRefundable)}
                  className="text-xs h-7"
                >
                  Hoàn tối đa (100%)
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">
                Lý do hoàn tiền <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Vui lòng nêu rõ lý do hoàn tiền..."
                className="w-full text-sm p-3 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowRefundModal(false)}
                disabled={isRefunding}
              >
                Hủy
              </Button>
              <Button
                onClick={handleProcessRefund}
                disabled={isRefunding}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isRefunding ? "Đang xử lý..." : "Xác nhận hoàn tiền"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
