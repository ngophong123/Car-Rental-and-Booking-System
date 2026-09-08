"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useSocket } from "@/components/providers/socket-provider";
import { toast } from "sonner";
import { MapPin, Clock, Phone, CarFront, CheckCircle, Navigation } from "lucide-react";

interface Booking {
  id: string;
  pickupLocation: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: string;
  customer: { name: string; email: string; phone: string | null };
  vehicle: { name: string; licensePlate: string };
  service: { name: string };
}

export default function DriverDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isHydrated } = useAuthStore();
  const router = useRouter();
  const { socket } = useSocket();

  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings");
      setBookings(res.data.data.bookings);
    } catch (error) {
      console.error("Failed to fetch driver bookings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isHydrated && user?.role !== 'DRIVER') {
      router.push("/");
    } else if (isHydrated) {
      fetchBookings();
    }
  }, [user, isHydrated, router]);

  useEffect(() => {
    if (socket) {
      // Re-fetch when admin assigns a new trip to this driver
      socket.on("booking:assigned", () => {
        fetchBookings();
      });

      return () => {
        socket.off("booking:assigned");
      };
    }
  }, [socket]);

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      await api.patch(`/bookings/${bookingId}/driver-status`, { status: newStatus });
      toast.success("Đã cập nhật trạng thái chuyến đi");
      
      // Update locally
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Cập nhật thất bại");
    }
  };

  if (!isHydrated || loading) {
    return <div className="text-center py-10">Đang tải dữ liệu...</div>;
  }

  const assignedTrips = bookings.filter(b => b.status === 'ASSIGNED');
  const activeTrips = bookings.filter(b => b.status === 'DRIVER_ACCEPTED' || b.status === 'IN_PROGRESS');
  const completedTrips = bookings.filter(b => b.status === 'COMPLETED');

  const TripCard = ({ booking }: { booking: Booking }) => (
    <Card className="mb-4 overflow-hidden border-l-4 border-l-blue-600">
      <CardHeader className="bg-slate-50 py-3 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base font-bold">{booking.customer.name || 'Khách'}</CardTitle>
            <div className="flex items-center text-sm text-muted-foreground mt-1 gap-1">
              <Phone className="w-3 h-3" />
              <span>{booking.customer.phone || 'Chưa cung cấp SĐT'}</span>
            </div>
          </div>
          <div className="text-right text-sm font-medium text-blue-600">
            {booking.id.split('-')[0]}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4 text-sm">
        <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
          <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="font-semibold">{format(new Date(booking.startDate), 'HH:mm - dd/MM/yyyy', { locale: vi })}</p>
            <p className="text-muted-foreground text-xs">Thời gian dự kiến đón khách</p>
          </div>
        </div>

        <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
          <MapPin className="w-4 h-4 text-rose-500 mt-0.5" />
          <div>
            <p className="font-medium">Đón: {booking.pickupLocation}</p>
            <p className="font-medium mt-1">Trả: {booking.destination}</p>
          </div>
        </div>

        <div className="grid grid-cols-[20px_1fr] gap-2 items-center bg-slate-50 p-2 rounded">
          <CarFront className="w-4 h-4 text-indigo-500" />
          <p className="font-medium text-indigo-700">{booking.vehicle.name} - {booking.vehicle.licensePlate}</p>
        </div>

        {/* Action Buttons based on status */}
        <div className="pt-2">
          {booking.status === 'ASSIGNED' && (
            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => handleUpdateStatus(booking.id, 'DRIVER_ACCEPTED')}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Nhận Chuyến
            </Button>
          )}
          
          {booking.status === 'DRIVER_ACCEPTED' && (
            <Button className="w-full bg-amber-500 hover:bg-amber-600" onClick={() => handleUpdateStatus(booking.id, 'IN_PROGRESS')}>
              <Navigation className="w-4 h-4 mr-2" />
              Bắt Đầu Khởi Hành
            </Button>
          )}
          
          {booking.status === 'IN_PROGRESS' && (
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => handleUpdateStatus(booking.id, 'COMPLETED')}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Hoàn Thành Chuyến Đi
            </Button>
          )}
          
          {booking.status === 'COMPLETED' && (
            <div className="w-full py-2 bg-emerald-100 text-emerald-800 text-center rounded font-semibold text-sm">
              Đã Hoàn Thành
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Khu vực Tài Xế</h1>
        <p className="text-muted-foreground text-sm mt-1">Xin chào, {user?.name || 'Bác tài'}! Chúc bạn một ngày làm việc an toàn.</p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="new">Mới ({assignedTrips.length})</TabsTrigger>
          <TabsTrigger value="active">Đang Chạy ({activeTrips.length})</TabsTrigger>
          <TabsTrigger value="history">Lịch Sử</TabsTrigger>
        </TabsList>
        
        <TabsContent value="new" className="mt-4">
          {assignedTrips.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Chưa có cuốc xe mới nào được phân công.</p>
          ) : (
            assignedTrips.map(b => <TripCard key={b.id} booking={b} />)
          )}
        </TabsContent>
        
        <TabsContent value="active" className="mt-4">
          {activeTrips.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Bạn hiện không có cuốc xe nào đang chạy.</p>
          ) : (
            activeTrips.map(b => <TripCard key={b.id} booking={b} />)
          )}
        </TabsContent>
        
        <TabsContent value="history" className="mt-4">
          {completedTrips.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Lịch sử chuyến đi trống.</p>
          ) : (
            completedTrips.map(b => <TripCard key={b.id} booking={b} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
