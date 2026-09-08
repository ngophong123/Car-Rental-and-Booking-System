"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, Users, CalendarDays, Car, AlertCircle } from "lucide-react";

interface Vehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  licensePlate: string;
  seatCount: number;
  image: string | null;
  basePrice: number;
  description: string | null;
}

interface Service {
  id: string;
  name: string;
  basePrice: number;
}

export default function VehicleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { isAuthenticated, user } = useAuthStore();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Booking form state
  const [serviceId, setServiceId] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [passengerCount, setPassengerCount] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehicleRes, servicesRes, reviewsRes] = await Promise.all([
          api.get(`/vehicles/${id}`),
          api.get("/services"),
          api.get(`/reviews/vehicle/${id}`).catch(() => ({ data: { data: { reviews: [] } } }))
        ]);
        setVehicle(vehicleRes.data.data.vehicle);
        setServices(servicesRes.data.data.services);
        setReviews(reviewsRes.data.data.reviews || []);
        if (servicesRes.data.data.services.length > 0) {
          setServiceId(servicesRes.data.data.services[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push(`/login?redirect=/vehicles/${id}`);
      return;
    }
    
    setBookingLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await api.post("/bookings", {
        vehicleId: id,
        serviceId,
        pickupLocation,
        destination,
        passengerCount: Number(passengerCount),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        notes
      });
      setSuccess(true);
      // Optional: router.push("/bookings") after a delay
      setTimeout(() => router.push("/bookings"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Đặt xe thất bại. Vui lòng thử lại.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Đang tải thông tin xe...</div>;
  if (!vehicle) return <div className="p-8 text-center text-red-500">Không tìm thấy xe</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Vehicle Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl overflow-hidden bg-slate-100 h-[400px]">
            <img 
              src={vehicle.image || "https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=2036&auto=format&fit=crop"} 
              alt={vehicle.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{vehicle.name}</h1>
            <p className="text-muted-foreground text-lg">{vehicle.brand} {vehicle.model}</p>
          </div>
          
          <div className="flex gap-4 border-y py-4">
            <div className="flex items-center gap-2">
              <Users className="text-primary h-5 w-5" />
              <span>{vehicle.seatCount} chỗ</span>
            </div>
            <div className="flex items-center gap-2">
              <Car className="text-primary h-5 w-5" />
              <span>Biển số: {vehicle.licensePlate}</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">Mô tả chi tiết</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {vehicle.description || "Xe đời mới, trang bị đầy đủ tiện nghi, phù hợp cho mọi chuyến đi."}
            </p>
          </div>
          
          {/* Reviews Section */}
          <div className="mt-8 pt-8 border-t">
            <h3 className="text-xl font-semibold mb-6">Đánh giá từ khách hàng ({reviews.length})</h3>
            {reviews.length === 0 ? (
              <p className="text-muted-foreground italic">Chưa có đánh giá nào cho xe này.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="font-semibold">{review.customer.name}</div>
                      <div className="flex text-amber-500 text-sm">
                        {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                      </div>
                    </div>
                    {review.comment && <p className="text-muted-foreground text-sm">{review.comment}</p>}
                    <p className="text-xs text-slate-400 mt-2">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Booking Form */}
        <div>
          <Card className="sticky top-24 shadow-lg border-primary/20">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle>Đặt Xe Này</CardTitle>
              <CardDescription>
                Giá thuê tham khảo: <strong className="text-primary text-lg">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(vehicle.basePrice)}/ngày</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {success ? (
                <div className="bg-green-50 text-green-700 p-4 rounded-md text-center">
                  <h3 className="font-bold text-lg mb-2">Đặt xe thành công!</h3>
                  <p>Chúng tôi đang chuyển hướng bạn đến trang Quản lý chuyến đi...</p>
                </div>
              ) : (
                <form onSubmit={handleBooking} className="space-y-4">
                  {error && (
                    <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Loại dịch vụ</label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={serviceId}
                      onChange={(e) => setServiceId(e.target.value)}
                      required
                    >
                      {services.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Điểm đón</label>
                    <div className="relative">
                      <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input 
                        type="text" 
                        required
                        placeholder="Nhập địa chỉ đón"
                        className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Điểm đến</label>
                    <div className="relative">
                      <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input 
                        type="text" 
                        required
                        placeholder="Nhập địa chỉ đến"
                        className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">TG Nhận xe</label>
                      <input 
                        type="datetime-local" 
                        required
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">TG Trả xe</label>
                      <input 
                        type="datetime-local" 
                        required
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Số hành khách</label>
                    <input 
                      type="number" 
                      min="1"
                      max={vehicle.seatCount}
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={passengerCount}
                      onChange={(e) => setPassengerCount(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ghi chú thêm</label>
                    <textarea 
                      placeholder="Yêu cầu riêng của bạn..."
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <Button type="submit" className="w-full text-base h-12" disabled={bookingLoading}>
                    {bookingLoading ? "Đang xử lý..." : "Xác nhận đặt xe"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
