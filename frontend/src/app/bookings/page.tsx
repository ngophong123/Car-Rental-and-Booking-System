"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { PaymentModal } from "@/components/shared/PaymentModal";
import { QrCode } from "lucide-react";

interface Booking {
  id: string;
  pickupLocation: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: string;
  totalAmount: number;
  vehicle: { id: string; name: string; licensePlate: string };
  service: { name: string };
  payment: { id: string; status: string } | null;
  review: { id: string; rating: number } | null;
}

const statusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-800" },
  CONFIRMED: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-800" },
  ASSIGNED: { label: "Đã xếp xe", color: "bg-indigo-100 text-indigo-800" },
  DRIVER_ACCEPTED: { label: "Tài xế đã nhận", color: "bg-purple-100 text-purple-800" },
  IN_PROGRESS: { label: "Đang di chuyển", color: "bg-green-100 text-green-800" },
  COMPLETED: { label: "Hoàn thành", color: "bg-emerald-100 text-emerald-800" },
  CANCELLED: { label: "Đã huỷ", color: "bg-red-100 text-red-800" },
  REJECTED: { label: "Bị từ chối", color: "bg-gray-100 text-gray-800" },
};

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<any>(null);

  // Review states
  const [reviewBookingId, setReviewBookingId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/bookings");
      setBookings(res.data.data.bookings || []);
    } catch (error) {
      console.error("Failed to fetch bookings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn huỷ chuyến đi này?")) return;
    try {
      await api.post(`/bookings/${id}/cancel`);
      setBookings(bookings.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b));
      toast.success("Đã huỷ chuyến đi");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Huỷ thất bại");
    }
  };

  const handleOpenPayment = (booking: Booking) => {
    setSelectedBookingForPayment({
      id: booking.id,
      vehicleName: booking.vehicle.name,
      licensePlate: booking.vehicle.licensePlate,
      totalAmount: booking.totalAmount,
      pickupLocation: booking.pickupLocation,
      destination: booking.destination,
      startDate: booking.startDate,
      endDate: booking.endDate,
    });
    setPaymentModalOpen(true);
  };

  const handleSubmitReview = async () => {
    try {
      await api.post("/reviews", { bookingId: reviewBookingId, rating, comment });
      toast.success("Cảm ơn bạn đã đánh giá!");
      setIsReviewOpen(false);
      fetchBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi gửi đánh giá");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Chuyến đi của tôi</h1>
      
      {loading ? (
        <p className="text-center py-10">Đang tải dữ liệu...</p>
      ) : bookings.length === 0 ? (
        <Card className="text-center py-12 bg-slate-50">
          <p className="text-lg text-muted-foreground">Bạn chưa có chuyến đi nào.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden shadow-sm hover:shadow-md transition">
              <CardContent className="p-0 sm:flex">
                <div className="p-5 bg-slate-50 sm:w-1/3 border-b sm:border-b-0 sm:border-r border-slate-200">
                  <div className="mb-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusMap[booking.status]?.color || 'bg-gray-100'}`}>
                      {statusMap[booking.status]?.label || booking.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{booking.service.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">Mã: {booking.id.split('-')[0]}</p>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Xe: {booking.vehicle.name}</p>
                    <p className="text-xs text-muted-foreground">Biển số: {booking.vehicle.licensePlate}</p>
                  </div>
                </div>
                
                <div className="p-5 sm:w-2/3 flex flex-col justify-between">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Thời gian đón</p>
                      <p className="font-semibold">{format(new Date(booking.startDate), 'HH:mm - dd/MM/yyyy', { locale: vi })}</p>
                      <p className="text-sm mt-1">{booking.pickupLocation}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Thời gian trả</p>
                      <p className="font-semibold">{format(new Date(booking.endDate), 'HH:mm - dd/MM/yyyy', { locale: vi })}</p>
                      <p className="text-sm mt-1">{booking.destination}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap justify-between items-center border-t pt-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Tổng tiền</p>
                      <p className="font-bold text-blue-600 text-lg">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.totalAmount)}
                      </p>
                      {booking.payment && (
                        <p className={`text-xs mt-1 font-semibold ${booking.payment.status === 'COMPLETED' ? 'text-green-600' : 'text-amber-500'}`}>
                          {booking.payment.status === 'COMPLETED' ? '✓ Đã thanh toán' : '⏳ Đang chờ xác nhận thanh toán'}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {/* Cancel Button */}
                      {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && !booking.payment && (
                        <Button variant="outline" size="sm" onClick={() => handleCancel(booking.id)}>
                          Huỷ chuyến
                        </Button>
                      )}

                      {/* Pay / QR Code Button */}
                      {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                        (!booking.payment || booking.payment.status === 'PENDING') ? (
                          <Button 
                            variant="default" 
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2 font-medium" 
                            size="sm" 
                            onClick={() => handleOpenPayment(booking)}
                          >
                            <QrCode className="w-4 h-4 animate-pulse text-amber-300" />
                            <span>{booking.payment ? "Mở lại mã QR thanh toán" : "Thanh toán (Quét mã QR)"}</span>
                          </Button>
                        ) : null
                      )}

                      {/* Review Button */}
                      {booking.status === 'COMPLETED' && !booking.review && (
                        <Dialog open={isReviewOpen && reviewBookingId === booking.id} onOpenChange={(open) => {
                          setIsReviewOpen(open);
                          if(open) {
                            setReviewBookingId(booking.id);
                            setRating(5);
                            setComment("");
                          }
                        }}>
                          <DialogTrigger className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm inline-flex items-center">
                            Viết đánh giá
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Đánh giá chuyến đi</DialogTitle>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                              <div>
                                <label className="text-sm font-medium">Chất lượng dịch vụ (1-5 sao)</label>
                                <div className="flex gap-2 mt-2">
                                  {[1,2,3,4,5].map(star => (
                                    <button 
                                      key={star} 
                                      className={`text-2xl ${rating >= star ? 'text-amber-500' : 'text-slate-300'}`}
                                      onClick={() => setRating(star)}
                                    >
                                      ★
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Lời bình (tuỳ chọn)</label>
                                <Textarea 
                                  placeholder="Chia sẻ trải nghiệm của bạn..." 
                                  className="mt-2"
                                  value={comment}
                                  onChange={(e) => setComment(e.target.value)}
                                />
                              </div>
                              <Button className="w-full" onClick={handleSubmitReview}>Gửi đánh giá</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      {/* Reviewed Label */}
                      {booking.review && (
                        <span className="inline-flex items-center text-sm font-medium text-amber-500 bg-amber-50 px-3 py-1 rounded">
                          ★ Đã đánh giá ({booking.review.rating}/5)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Payment Modal with VietQR, MoMo, VNPAY, and Cash */}
      {selectedBookingForPayment && (
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          booking={selectedBookingForPayment}
          onPaymentSuccess={() => {
            fetchBookings();
          }}
        />
      )}
    </div>
  );
}
