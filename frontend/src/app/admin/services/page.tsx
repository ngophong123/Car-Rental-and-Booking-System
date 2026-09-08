"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Service {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  active: boolean;
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get("/services");
        setServices(res.data.data.services);
      } catch (error) {
        console.error("Failed to fetch services", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn ngừng hoạt động dịch vụ này?")) {
      try {
        await api.delete(`/services/${id}`);
        setServices(services.map((s) => s.id === id ? { ...s, active: false } : s));
      } catch (error) {
        console.error("Failed to delete service", error);
        alert("Xóa dịch vụ thất bại");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý Dịch vụ</h1>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm dịch vụ mới
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách dịch vụ</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Đang tải dữ liệu...</p>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Tên dịch vụ</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Slug</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Giá cơ bản</th>
                    <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">Trạng thái</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Hành động</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {services.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-muted-foreground">
                        Chưa có dịch vụ nào
                      </td>
                    </tr>
                  ) : (
                    services.map((service) => (
                      <tr key={service.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle font-medium">{service.name}</td>
                        <td className="p-4 align-middle">{service.slug}</td>
                        <td className="p-4 align-middle text-right">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(service.basePrice)}
                        </td>
                        <td className="p-4 align-middle text-center">
                          {service.active ? (
                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800">
                              Đang hoạt động
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-800">
                              Ngừng hoạt động
                            </span>
                          )}
                        </td>
                        <td className="p-4 align-middle text-right space-x-2">
                          <Button variant="outline" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          {service.active && (
                            <Button variant="destructive" size="icon" onClick={() => handleDelete(service.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
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
