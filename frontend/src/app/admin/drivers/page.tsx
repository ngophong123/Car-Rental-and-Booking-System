"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Driver {
  id: string;
  fullName: string;
  phone: string;
  licenseNumber: string;
  licenseType: string;
  status: string;
  active: boolean;
  user: { email: string };
}

const statusMap: Record<string, { label: string; color: string }> = {
  AVAILABLE: { label: "Sẵn sàng", color: "bg-green-100 text-green-800" },
  ASSIGNED: { label: "Đã phân công", color: "bg-blue-100 text-blue-800" },
  ON_TRIP: { label: "Đang chạy", color: "bg-purple-100 text-purple-800" },
  OFF_DUTY: { label: "Nghỉ phép", color: "bg-gray-100 text-gray-800" }
};

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await api.get("/drivers");
        setDrivers(res.data.data.drivers);
      } catch (error) {
        console.error("Failed to fetch drivers", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDrivers();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/drivers/${id}/status`, { status: newStatus });
      setDrivers(drivers.map(d => d.id === id ? { ...d, status: newStatus } : d));
    } catch (error: any) {
      alert(error.response?.data?.message || "Cập nhật thất bại");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý Tài xế</h1>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm tài xế mới
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách tài xế</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Đang tải dữ liệu...</p>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b bg-slate-50">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left font-medium text-muted-foreground">Tài xế</th>
                    <th className="h-12 px-4 text-left font-medium text-muted-foreground">Liên hệ</th>
                    <th className="h-12 px-4 text-left font-medium text-muted-foreground">Bằng lái</th>
                    <th className="h-12 px-4 text-center font-medium text-muted-foreground">Trạng thái</th>
                    <th className="h-12 px-4 text-right font-medium text-muted-foreground">Hành động</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {drivers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        Chưa có tài xế nào
                      </td>
                    </tr>
                  ) : (
                    drivers.map((driver) => (
                      <tr key={driver.id} className="border-b transition-colors hover:bg-slate-50/50">
                        <td className="p-4 align-top">
                          <p className="font-medium">{driver.fullName}</p>
                          <p className="text-xs text-muted-foreground">Tài khoản: {driver.user.email}</p>
                        </td>
                        <td className="p-4 align-top">
                          {driver.phone}
                        </td>
                        <td className="p-4 align-top">
                          <p className="font-medium">Hạng {driver.licenseType}</p>
                          <p className="text-xs text-muted-foreground">Số: {driver.licenseNumber}</p>
                        </td>
                        <td className="p-4 align-top text-center">
                          <select
                            className={`px-2 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer ${statusMap[driver.status]?.color || 'bg-gray-100'}`}
                            value={driver.status}
                            onChange={(e) => handleUpdateStatus(driver.id, e.target.value)}
                          >
                            {Object.entries(statusMap).map(([key, { label }]) => (
                              <option key={key} value={key} className="bg-white text-black">{label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-4 align-top text-right space-x-2">
                          <Button variant="outline" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
