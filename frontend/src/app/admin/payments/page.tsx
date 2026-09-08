"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { useSocket } from "@/components/providers/socket-provider";

interface Payment {
  id: string;
  amount: number;
  method: string;
  status: string;
  transactionId?: string | null;
  createdAt: string;
  booking: {
    id: string;
    customer: { name: string; phone: string };
    vehicle: { name: string; licensePlate: string };
  };
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const fetchPayments = async () => {
    try {
      const res = await api.get("/payments");
      setPayments(res.data.data.payments);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();

    if (socket) {
      socket.on("payment:created", (data: any) => {
        toast.info(`Khách hàng vừa báo chuyển khoản: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.amount)}`);
        fetchPayments();
      });

      return () => {
        socket.off("payment:created");
      };
    }
  }, [socket]);

  const handleConfirm = async (id: string) => {
    if (!confirm("Bạn xác nhận đã nhận được tiền cho giao dịch này?")) return;
    try {
      await api.patch(`/payments/${id}/confirm`);
      toast.success("Xác nhận thanh toán thành công!");
      fetchPayments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi xác nhận");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý Thanh toán</h1>
      </div>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : payments.length === 0 ? (
        <p className="text-muted-foreground">Chưa có giao dịch nào.</p>
      ) : (
        <div className="grid gap-4">
          {payments.map(payment => (
            <Card key={payment.id} className={payment.status === 'PENDING' ? 'border-amber-200 bg-amber-50/30' : ''}>
              <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg">Mã chuyến: {payment.booking.id.split('-')[0]}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      payment.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                      payment.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Khách hàng:</span> {payment.booking.customer.name} - {payment.booking.customer.phone}</p>
                    <p><span className="font-medium">Xe:</span> {payment.booking.vehicle.name} ({payment.booking.vehicle.licensePlate})</p>
                    <p className="text-muted-foreground">{format(new Date(payment.createdAt), 'HH:mm - dd/MM/yyyy', { locale: vi })}</p>
                    {payment.transactionId && (
                      <p className="text-xs pt-1">
                        <span className="font-semibold text-slate-500">Mã FT / GD đối soát: </span>
                        <code className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200 font-mono font-bold">
                          {payment.transactionId}
                        </code>
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600 mb-2">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(payment.amount)}
                  </p>
                  {payment.status === 'PENDING' && (
                    <Button onClick={() => handleConfirm(payment.id)} className="bg-amber-500 hover:bg-amber-600 text-white">
                      Duyệt (Xác nhận đã nhận tiền)
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
