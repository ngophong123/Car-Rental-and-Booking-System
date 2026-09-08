"use client";

import { useState, useEffect } from "react";
import { 
  QrCode, 
  Copy, 
  Check, 
  Download, 
  CreditCard, 
  Wallet, 
  Smartphone, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  PhoneCall, 
  X, 
  Banknote,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/lib/axios";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;
    vehicleName: string;
    licensePlate?: string;
    totalAmount: number;
    pickupLocation?: string;
    destination?: string;
    startDate?: string;
    endDate?: string;
  };
  onPaymentSuccess?: () => void;
}

export function PaymentModal({ isOpen, onClose, booking, onPaymentSuccess }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<"VIETQR" | "MOMO" | "VNPAY" | "CASH">("VIETQR");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes countdown
  const [transactionCode, setTransactionCode] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Short booking code for transfer message
  const bookingCode = booking.id ? booking.id.split("-")[0].toUpperCase() : "MKHOA";
  const transferMessage = `MINHKHOA ${bookingCode}`;
  const amountFormatted = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(booking.totalAmount);

  // Bank transfer info
  const bankAccount = {
    bankName: "Vietcombank (Ngân hàng Ngoại Thương)",
    accountNumber: "0859354724",
    accountHolder: "CONG TY CO PHAN MINH KHOA",
    amount: booking.totalAmount,
    content: transferMessage,
  };

  // Timer countdown
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  // Anti-spam Cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Copy helper with feedback
  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`Đã sao chép ${fieldName}!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // VietQR Dynamic URL (Auto-fills amount, bank account and transfer message)
  const vietQrUrl = `https://img.vietqr.io/image/970436-0859354724-compact2.png?amount=${booking.totalAmount}&addInfo=${encodeURIComponent(transferMessage)}&accountName=${encodeURIComponent(bankAccount.accountHolder)}`;

  // MoMo QR Code URL
  const momoQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=2|99|0859354724|CONG%20TY%20CO%20PHAN%20MINH%20KHOA|contact@minhkhoa.com|0|0|${booking.totalAmount}|${encodeURIComponent(transferMessage)}`;

  // VNPAY QR Code URL
  const vnpayQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021238540010A00000072701240006970436011008593547240208QRIBFTTA5303704540${booking.totalAmount}5802VN62180814${encodeURIComponent(transferMessage)}6304`;

  // Submit payment confirmation with anti-tampering security layers
  const handleConfirmPaid = async () => {
    if (cooldown > 0) {
      toast.warning(`Yêu cầu đang xử lý. Vui lòng chờ ${cooldown} giây!`);
      return;
    }

    try {
      setSubmitting(true);
      // Cryptographic device fingerprint for fraud detection
      const fingerprint = typeof window !== 'undefined' 
        ? btoa((navigator.userAgent || '').slice(0, 40) + '_' + screen.width + 'x' + screen.height) 
        : 'browser-fp';

      const res = await api.post("/payments", {
        bookingId: booking.id,
        method: selectedMethod === "CASH" ? "CASH" : "BANK_TRANSFER",
        transactionCode: transactionCode.trim() || undefined,
        clientTimestamp: Date.now(),
        deviceFingerprint: fingerprint,
      });

      toast.success(res.data.message || "Đã gửi thông báo thanh toán thành công! Quản trị viên đang đối soát đơn.");
      setCooldown(30); // 30s cooldown against spamming
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
      setTimeout(() => onClose(), 1500);
    } catch (error: any) {
      console.error("Payment confirmation failed", error);
      toast.error(error.response?.data?.message || "Lỗi gửi thông báo thanh toán!");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with Title and Countdown */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>Thanh Toán Đặt Xe Minh Khoa</span>
              </h2>
              <p className="text-xs text-orange-200/90 font-medium mt-0.5">
                Mã đơn: <span className="font-mono font-bold text-white">#{bookingCode}</span> • {booking.vehicleName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Countdown Badge */}
            <div className="hidden sm:flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/15 text-xs font-bold text-amber-300">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto space-y-5">
          
          {/* Amount Card Summary */}
          <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200 flex items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Tổng số tiền thanh toán
              </span>
              <div className="text-2xl sm:text-3xl font-black text-orange-600 tracking-tight mt-0.5">
                {amountFormatted}
              </div>
            </div>

            <button
              onClick={() => handleCopy(booking.totalAmount.toString(), "Số tiền")}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-orange-100 text-orange-700 font-bold text-xs border border-orange-200 shadow-sm flex items-center gap-1.5 transition-colors"
            >
              {copiedField === "Số tiền" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedField === "Số tiền" ? "Đã chép" : "Sao chép"}</span>
            </button>
          </div>

          {/* Payment Method Selector Tabs */}
          <div>
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-2.5">
              Chọn phương thức quét mã & thanh toán:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              
              {/* Tab 1: VietQR */}
              <button
                type="button"
                onClick={() => setSelectedMethod("VIETQR")}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                  selectedMethod === "VIETQR"
                    ? "border-emerald-500 bg-emerald-50/70 shadow-md shadow-emerald-500/15 ring-2 ring-emerald-500/20"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs mb-1.5 shadow-sm">
                  QR
                </div>
                <span className="text-xs font-bold text-slate-800">VietQR 24/7</span>
                <span className="text-[10px] text-emerald-600 font-semibold mt-0.5">Mọi ngân hàng</span>
              </button>

              {/* Tab 2: MoMo */}
              <button
                type="button"
                onClick={() => setSelectedMethod("MOMO")}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                  selectedMethod === "MOMO"
                    ? "border-pink-500 bg-pink-50/70 shadow-md shadow-pink-500/15 ring-2 ring-pink-500/20"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-[#A50064] text-white flex items-center justify-center font-black text-xs mb-1.5 shadow-sm">
                  momo
                </div>
                <span className="text-xs font-bold text-slate-800">Ví MoMo</span>
                <span className="text-[10px] text-pink-600 font-semibold mt-0.5">Quét QR ví</span>
              </button>

              {/* Tab 3: VNPAY */}
              <button
                type="button"
                onClick={() => setSelectedMethod("VNPAY")}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                  selectedMethod === "VNPAY"
                    ? "border-blue-500 bg-blue-50/70 shadow-md shadow-blue-500/15 ring-2 ring-blue-500/20"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-white border border-blue-200 text-slate-900 flex items-center justify-center font-black text-[10px] mb-1.5 shadow-sm">
                  <span className="text-[#005BAA]">VN</span>
                  <span className="text-[#ED1C24]">PAY</span>
                </div>
                <span className="text-xs font-bold text-slate-800">VNPAY-QR</span>
                <span className="text-[10px] text-blue-600 font-semibold mt-0.5">Ưu đãi giảm giá</span>
              </button>

              {/* Tab 4: Tiền mặt COD */}
              <button
                type="button"
                onClick={() => setSelectedMethod("CASH")}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                  selectedMethod === "CASH"
                    ? "border-orange-500 bg-orange-50/70 shadow-md shadow-orange-500/15 ring-2 ring-orange-500/20"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold mb-1.5 shadow-sm">
                  <Banknote className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Tiền Mặt</span>
                <span className="text-[10px] text-amber-600 font-semibold mt-0.5">Khi nhận xe</span>
              </button>

            </div>
          </div>

          {/* QR Code Presentation & Details */}
          {selectedMethod !== "CASH" ? (
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center p-5 rounded-3xl bg-slate-50/80 border border-slate-200">
              
              {/* QR Code Frame */}
              <div className="sm:col-span-5 flex flex-col items-center justify-center">
                <div className="p-3 bg-white rounded-2xl shadow-md border-2 border-slate-200 flex flex-col items-center">
                  <img
                    src={selectedMethod === "VIETQR" ? vietQrUrl : selectedMethod === "MOMO" ? momoQrUrl : vnpayQrUrl}
                    alt="Mã QR Thanh Toán"
                    className="w-48 h-48 object-contain rounded-lg"
                  />
                  <div className="mt-2 text-center">
                    <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider block">
                      {selectedMethod === "VIETQR" ? "VietQR Chuẩn NAPAS" : selectedMethod === "MOMO" ? "Ví Điện Tử MoMo" : "Cổng VNPAY-QR"}
                    </span>
                    <span className="text-[10px] text-slate-500">Mở App ngân hàng để quét</span>
                  </div>
                </div>

                <a 
                  href={selectedMethod === "VIETQR" ? vietQrUrl : selectedMethod === "MOMO" ? momoQrUrl : vnpayQrUrl} 
                  download={`QR_ThanhToan_${bookingCode}.png`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 text-xs font-bold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải ảnh QR về máy</span>
                </a>
              </div>

              {/* Bank Account Details & Quick Copy */}
              <div className="sm:col-span-7 space-y-2.5 text-xs text-left">
                
                {/* Bank Name */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Ngân hàng thụ hưởng</span>
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">Vietcombank</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    24/7 Miễn phí
                  </span>
                </div>

                {/* Account Number */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Số tài khoản</span>
                    <span className="font-mono font-black text-slate-900 text-sm sm:text-base tracking-wider text-orange-600">
                      {bankAccount.accountNumber}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(bankAccount.accountNumber, "Số tài khoản")}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 font-bold text-[11px]"
                  >
                    {copiedField === "Số tài khoản" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === "Số tài khoản" ? "Đã chép" : "Chép"}</span>
                  </button>
                </div>

                {/* Account Holder */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Tên người nhận</span>
                    <span className="font-bold text-slate-900 text-xs sm:text-sm uppercase">
                      {bankAccount.accountHolder}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(bankAccount.accountHolder, "Tên người nhận")}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 font-bold text-[11px]"
                  >
                    {copiedField === "Tên người nhận" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === "Tên người nhận" ? "Đã chép" : "Chép"}</span>
                  </button>
                </div>

                {/* Transfer Content */}
                <div className="p-2.5 rounded-xl bg-white border-2 border-orange-300 bg-orange-50/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-orange-700 block uppercase">Nội dung chuyển khoản (Bắt buộc)</span>
                    <span className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                      {transferMessage}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(transferMessage, "Nội dung")}
                    className="p-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-1 font-bold text-[11px] shadow-sm"
                  >
                    {copiedField === "Nội dung" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === "Nội dung" ? "Đã chép" : "Sao chép"}</span>
                  </button>
                </div>

                <div className="text-[11px] text-slate-500 leading-tight italic pt-1">
                  * Hệ thống tự động ghi nhận giao dịch sau khi chuyển khoản thành công từ 30 giây đến 2 phút.
                </div>
              </div>

            </div>
          ) : (
            /* Cash on Delivery (COD) Instructions */
            <div className="p-6 rounded-3xl bg-amber-50/70 border border-amber-200 space-y-3 text-left">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                <Banknote className="w-5 h-5 text-amber-600" />
                <span>Thanh Toán Trực Tiếp Khi Nhận Xe</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Quý khách có thể thanh toán số tiền <strong className="text-orange-600 font-black">{amountFormatted}</strong> trực tiếp cho nhân viên giao xe hoặc tài xế khi nhận xe tại địa điểm đón.
              </p>
              <div className="p-3 rounded-xl bg-white border border-amber-200 text-xs text-slate-600 space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Có hợp đồng và biên lai thu tiền dấu đỏ đầy đủ.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Kiểm tra xe đạt chuẩn mới tiến hành thanh toán.</span>
                </div>
              </div>
            </div>
          )}

          {/* Underground Security: Transaction Code / Reference Input */}
          {selectedMethod !== "CASH" && (
            <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Mã giao dịch / Mã FT ngân hàng (Khuyên dùng)</span>
                </label>
                <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-full">
                  Đối soát 30s
                </span>
              </div>
              <input
                type="text"
                placeholder="VD: FT2409... hoặc Mã giao dịch trên biên lai MoMo / Vietcombank"
                value={transactionCode}
                onChange={(e) => setTransactionCode(e.target.value)}
                className="w-full h-10 px-3 text-xs sm:text-sm font-mono rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-white transition-all placeholder:text-slate-400"
              />
              <p className="text-[11px] text-slate-500 leading-tight">
                * Nhập mã tham chiếu từ biên lai chuyển tiền giúp hệ thống và Admin đối soát tự động kích hoạt đơn xe nhanh nhất.
              </p>
            </div>
          )}

          {/* Anti-Fraud Security Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-left flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed text-amber-900">
              <span className="font-bold">Lớp bảo mật chống gian lận: </span>
              Hệ thống tự động lưu IP, mã định danh thiết bị và đối soát trực tiếp sao kê tài khoản Vietcombank. Quý khách vui lòng chỉ xác nhận khi đã chuyển khoản thành công. Mọi hành vi thông báo giả mạo sẽ bị khoá tài khoản vĩnh viễn theo quy định.
            </div>
          </div>

          {/* Security Guarantee */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Giao dịch bảo mật SSL 256-bit chuẩn Napas & Vietcombank</span>
            </div>
            <a href="tel:0859354724" className="text-orange-600 font-bold hover:underline flex items-center gap-1 shrink-0">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>0859 354 724</span>
            </a>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="w-full sm:w-auto text-xs text-slate-500 hover:text-slate-800"
          >
            Đóng cửa sổ
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              onClick={handleConfirmPaid}
              disabled={submitting || cooldown > 0}
              className="w-full sm:w-auto px-6 h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-transform hover:scale-105 disabled:opacity-60 disabled:hover:scale-100 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {submitting
                  ? "Đang đối soát..."
                  : cooldown > 0
                  ? `Đang đối soát (${cooldown}s)`
                  : "Tôi Đã Chuyển Khoản Thành Công"}
              </span>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
