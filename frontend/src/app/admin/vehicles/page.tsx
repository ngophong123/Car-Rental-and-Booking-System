"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Car, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  X, 
  Save, 
  Sparkles,
  Gauge,
  Users,
  DollarSign,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  FolderOpen,
  Camera,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

interface Vehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  licensePlate: string;
  seatCount: number;
  status: string;
  type: string;
  basePrice: number;
  image?: string | null;
  description?: string | null;
  year?: number;
}

const emptyVehicleForm = {
  name: "",
  brand: "",
  model: "",
  licensePlate: "",
  seatCount: 4,
  type: "SEAT_4",
  basePrice: 800000,
  status: "AVAILABLE",
  image: "",
  description: "",
  year: 2024,
};

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyVehicleForm);
  const [submitting, setSubmitting] = useState(false);

  // Image Selection & Upload State
  const [imageTab, setImageTab] = useState<"upload" | "presets" | "url">("upload");
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PRESET_FLEET_IMAGES = [
    { name: "Kia Carnival VIP 7 Chỗ (Đen)", url: "/images/cars/kia-carnival-black.jpg" },
    { name: "Toyota Innova 7 Chỗ", url: "/images/cars/toyota-innova-7seat.jpg" },
    { name: "Toyota Fortuner Đội Xe VIP", url: "/images/cars/toyota-fortuner-black-fleet.jpg" },
    { name: "Ford Transit 16 Chỗ (Đen Resort)", url: "/images/cars/ford-transit-black.jpg" },
    { name: "Ford Transit 16 Chỗ (Bạc Showroom)", url: "/images/cars/ford-transit-silver-showroom.jpg" },
    { name: "Ford Transit 16 Chỗ (Xe Hợp Đồng)", url: "/images/cars/ford-transit-silver-front.jpg" },
  ];

  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh (JPG, PNG, WebP)!");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error("Kích thước file ảnh không được vượt quá 15MB!");
      return;
    }

    setIsProcessingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDimension = 1280;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setFormData((prev) => ({ ...prev, image: compressedDataUrl }));
          toast.success("Đã chọn và tối ưu ảnh từ thiết bị thành công!");
        }
        setIsProcessingImage(false);
      };
      img.onerror = () => {
        toast.error("Không thể đọc định dạng ảnh này!");
        setIsProcessingImage(false);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      toast.error("Lỗi khi đọc file ảnh từ thiết bị!");
      setIsProcessingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    if (e.target) e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.get("/vehicles");
      const list = res.data.data.vehicles || [];
      setVehicles(list);
      setFilteredVehicles(list);
    } catch (error) {
      console.error("Failed to fetch vehicles", error);
      toast.error("Không thể tải danh sách xe");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Filter and Search logic
  useEffect(() => {
    let result = vehicles;
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      result = result.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.licensePlate.toLowerCase().includes(q) ||
          v.brand?.toLowerCase().includes(q) ||
          v.model?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "ALL") {
      result = result.filter((v) => v.status === statusFilter);
    }
    setFilteredVehicles(result);
  }, [searchKeyword, statusFilter, vehicles]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormData(emptyVehicleForm);
    setIsEditing(false);
    setEditingId(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (vehicle: Vehicle) => {
    setFormData({
      name: vehicle.name || "",
      brand: vehicle.brand || "",
      model: vehicle.model || "",
      licensePlate: vehicle.licensePlate || "",
      seatCount: vehicle.seatCount || 4,
      type: vehicle.type || "SEAT_4",
      basePrice: vehicle.basePrice || 800000,
      status: vehicle.status || "AVAILABLE",
      image: vehicle.image || "",
      description: vehicle.description || "",
      year: vehicle.year || 2024,
    });
    setIsEditing(true);
    setEditingId(vehicle.id);
    setImageTab(vehicle.image?.startsWith("http") ? "url" : vehicle.image?.startsWith("/images/") ? "presets" : "upload");
    setIsModalOpen(true);
  };

  // Handle Submit (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.licensePlate) {
      toast.error("Vui lòng điền tên xe và biển số xe!");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name,
        brand: formData.brand || formData.name.split(" ")[0],
        model: formData.model || formData.name,
        licensePlate: formData.licensePlate.toUpperCase(),
        seatCount: Number(formData.seatCount),
        type: formData.type,
        basePrice: Number(formData.basePrice),
        status: formData.status,
        image: formData.image || "/images/cars/toyota-fortuner-black-fleet.jpg",
        description: formData.description || `Xe đời mới chất lượng cao, trang bị tiện nghi hiện đại.`,
        year: Number(formData.year) || 2024,
      };

      if (isEditing && editingId) {
        await api.patch(`/vehicles/${editingId}`, payload);
        toast.success(`Đã cập nhật thông tin xe ${formData.name} thành công!`);
      } else {
        await api.post("/vehicles", payload);
        toast.success(`Đã thêm xe ${formData.name} vào hệ thống!`);
      }

      setIsModalOpen(false);
      await fetchVehicles();
    } catch (error: any) {
      console.error("Save vehicle failed", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi lưu xe!");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xoá xe "${name}" khỏi hệ thống?`)) return;
    try {
      await api.delete(`/vehicles/${id}`);
      setVehicles(vehicles.filter((v) => v.id !== id));
      toast.success(`Đã xoá xe ${name} thành công!`);
    } catch (error: any) {
      console.error("Failed to delete vehicle", error);
      toast.error(error.response?.data?.message || "Không thể xoá xe này do có chuyến đi liên kết!");
    }
  };

  // Summary counts
  const countAvailable = vehicles.filter((v) => v.status === "AVAILABLE").length;
  const countRented = vehicles.filter((v) => v.status === "RENTED").length;
  const countMaintenance = vehicles.filter((v) => v.status === "MAINTENANCE").length;

  return (
    <div className="space-y-6">
      {/* Top Header & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Car className="w-8 h-8 text-orange-500" />
            <span>Quản Lý Đội Xe Minh Khoa</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quản trị danh sách xe, cập nhật thông tin, bảng giá và phân loại xe cho thuê.
          </p>
        </div>

        <Button 
          onClick={handleOpenCreate}
          className="h-11 px-5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-md shadow-orange-500/30 gap-2 transition-transform hover:scale-105"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm Xe Mới</span>
        </Button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase">Tổng số xe</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{vehicles.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Xe trong hệ thống</div>
        </div>

        <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 shadow-sm">
          <div className="text-xs font-bold text-emerald-700 uppercase">Sẵn sàng nhận khách</div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{countAvailable}</div>
          <div className="text-[11px] text-emerald-600/80 mt-0.5">Xe đang trống</div>
        </div>

        <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/80 shadow-sm">
          <div className="text-xs font-bold text-blue-700 uppercase">Đang cho thuê</div>
          <div className="text-2xl sm:text-3xl font-black text-blue-600 mt-1">{countRented}</div>
          <div className="text-[11px] text-blue-600/80 mt-0.5">Khách đang sử dụng</div>
        </div>

        <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-200/80 shadow-sm">
          <div className="text-xs font-bold text-rose-700 uppercase">Bảo dưỡng định kỳ</div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 mt-1">{countMaintenance}</div>
          <div className="text-[11px] text-rose-600/80 mt-0.5">Tạm dừng nhận khách</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <Card className="rounded-2xl border border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm tên xe, biển số, hãng..."
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-500 shrink-0">Trạng thái:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 font-semibold text-slate-700 outline-none cursor-pointer bg-white"
              >
                <option value="ALL">Tất cả ({vehicles.length})</option>
                <option value="AVAILABLE">Sẵn sàng ({countAvailable})</option>
                <option value="RENTED">Đang thuê ({countRented})</option>
                <option value="MAINTENANCE">Bảo dưỡng ({countMaintenance})</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicles Table */}
      <Card className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/70 border-b border-slate-100 py-4 px-6">
          <CardTitle className="text-base font-bold text-slate-800">
            Danh sách phương tiện ({filteredVehicles.length} xe)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <Car className="w-8 h-8 animate-spin mx-auto text-orange-500 mb-2" />
              Đang tải danh sách xe...
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              Không tìm thấy xe nào phù hợp.
            </div>
          ) : (
            <div className="relative w-full overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Ảnh & Tên xe</th>
                    <th className="py-3.5 px-4">Biển số</th>
                    <th className="py-3.5 px-4">Phân loại</th>
                    <th className="py-3.5 px-4">Số chỗ</th>
                    <th className="py-3.5 px-4">Giá thuê / ngày</th>
                    <th className="py-3.5 px-4">Trạng thái</th>
                    <th className="py-3.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-medium">
                        <div className="flex items-center gap-3">
                          <img
                            src={vehicle.image || "/images/cars/toyota-fortuner-black-fleet.jpg"}
                            alt={vehicle.name}
                            className="w-14 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{vehicle.name}</div>
                            <div className="text-[11px] text-slate-400">{vehicle.brand} • {vehicle.year || 2024}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                          {vehicle.licensePlate}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {vehicle.type}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {vehicle.seatCount} Chỗ
                      </td>
                      <td className="py-3.5 px-4 font-bold text-orange-600">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(vehicle.basePrice)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            vehicle.status === "AVAILABLE"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : vehicle.status === "RENTED"
                              ? "bg-blue-100 text-blue-800 border border-blue-300"
                              : "bg-rose-100 text-rose-800 border border-rose-300"
                          }`}
                        >
                          {vehicle.status === "AVAILABLE"
                            ? "Sẵn sàng"
                            : vehicle.status === "RENTED"
                            ? "Đang thuê"
                            : "Bảo dưỡng"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(vehicle)}
                          className="h-8 px-2.5 text-xs text-slate-700 hover:text-orange-600 hover:border-orange-400 rounded-lg gap-1"
                          title="Sửa xe"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Sửa</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(vehicle.id, vehicle.name)}
                          className="h-8 px-2.5 text-xs rounded-lg gap-1"
                          title="Xoá xe"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Xoá</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CREATE & EDIT MODAL (Overlaid Dialog) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold shadow-md">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {isEditing ? "Chỉnh Sửa Thông Tin Xe" : "Thêm Phương Tiện Mới"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isEditing ? "Cập nhật giá, hình ảnh và trạng thái" : "Nhập đầy đủ thông số kỹ thuật và biển số xe"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Tên xe <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="VD: VinFast VF8 Plus 2024"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-xs sm:text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Biển số xe <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.licensePlate}
                    onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                    placeholder="VD: 30K-888.99"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-xs sm:text-sm outline-none font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Hãng xe (Brand)
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="VD: VinFast, Toyota, Ford"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-xs sm:text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Số chỗ ngồi
                  </label>
                  <select
                    value={formData.seatCount}
                    onChange={(e) => {
                      const count = Number(e.target.value);
                      let type = "SEAT_4";
                      if (count === 7) type = "SEAT_7";
                      else if (count === 16) type = "SEAT_16";
                      else if (count === 29) type = "SEAT_29";
                      else if (count >= 45) type = "SEAT_45";
                      setFormData({ ...formData, seatCount: count, type });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-xs sm:text-sm outline-none bg-white font-semibold"
                  >
                    <option value={4}>4 Chỗ</option>
                    <option value={7}>7 Chỗ</option>
                    <option value={16}>16 Chỗ</option>
                    <option value={29}>29 Chỗ</option>
                    <option value={45}>45 Chỗ</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Năm sản xuất
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-xs sm:text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Giá thuê cơ bản / ngày (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="50000"
                    required
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                    placeholder="VD: 1000000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-xs sm:text-sm outline-none font-bold text-orange-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Trạng thái hoạt động
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-xs sm:text-sm outline-none bg-white font-semibold"
                  >
                    <option value="AVAILABLE">Sẵn sàng (Available)</option>
                    <option value="RENTED">Đang thuê (Rented)</option>
                    <option value="MAINTENANCE">Bảo dưỡng (Maintenance)</option>
                  </select>
                </div>
              </div>

              {/* Vehicle Image Upload & Selection Section */}
              <div className="space-y-2.5 bg-slate-50/80 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-orange-500" />
                    <span>Hình ảnh xe</span>
                  </label>
                  
                  {/* Mode Tabs */}
                  <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setImageTab("upload")}
                      className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                        imageTab === "upload" 
                          ? "bg-white text-orange-600 shadow-sm" 
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Upload className="w-3 h-3" />
                      <span>Từ máy / ĐT</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageTab("presets")}
                      className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                        imageTab === "presets" 
                          ? "bg-white text-orange-600 shadow-sm" 
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <FolderOpen className="w-3 h-3" />
                      <span>Đội xe mẫu</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageTab("url")}
                      className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                        imageTab === "url" 
                          ? "bg-white text-orange-600 shadow-sm" 
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>URL</span>
                    </button>
                  </div>
                </div>

                {/* Hidden File Input for Device/Phone Gallery */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {/* Tab 1: Upload from Phone / Computer */}
                {imageTab === "upload" && (
                  <div className="space-y-3">
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                        isDragging
                          ? "border-orange-500 bg-orange-50 scale-[1.01]"
                          : "border-slate-300 hover:border-orange-500 bg-white hover:bg-orange-50/40"
                      }`}
                    >
                      <div className="w-11 h-11 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                        {isProcessingImage ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <Upload className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-800">
                          {isProcessingImage ? "Đang xử lý và tối ưu ảnh..." : "Bấm để chọn ảnh từ thư viện điện thoại / máy tính"}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Hỗ trợ chụp ảnh trực tiếp hoặc chọn ảnh từ máy (JPG, PNG, WebP)
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="mt-1 rounded-lg border-orange-200 text-orange-600 hover:bg-orange-100 text-xs font-bold pointer-events-none"
                      >
                        <Camera className="w-3.5 h-3.5 mr-1" /> Mở thư viện ảnh
                      </Button>
                    </div>
                  </div>
                )}

                {/* Tab 2: Preset Fleet Gallery */}
                {imageTab === "presets" && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-500 font-medium">
                      Bấm vào ảnh thực tế bên dưới để gán nhanh cho xe:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                      {PRESET_FLEET_IMAGES.map((preset) => (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() => setFormData({ ...formData, image: preset.url })}
                          className={`relative rounded-xl overflow-hidden border-2 text-left p-1 transition-all cursor-pointer group bg-white ${
                            formData.image === preset.url
                              ? "border-orange-500 shadow-md ring-2 ring-orange-400/30"
                              : "border-slate-200 hover:border-orange-300"
                          }`}
                        >
                          <div className="w-full h-14 rounded-lg overflow-hidden relative">
                            <img src={preset.url} alt={preset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            {formData.image === preset.url && (
                              <div className="absolute top-1 right-1 bg-orange-500 text-white rounded-full p-0.5">
                                <CheckCircle2 className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                          <div className="text-[10px] font-bold text-slate-800 truncate mt-1 px-1">
                            {preset.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab 3: URL Direct Input */}
                {imageTab === "url" && (
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://images.unsplash.com/... hoặc /images/cars/..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-xs sm:text-sm outline-none bg-white"
                    />
                    <p className="text-[11px] text-slate-400">
                      Dán link ảnh từ Unsplash, website khác hoặc đường dẫn nội bộ.
                    </p>
                  </div>
                )}

                {/* Live Preview Card */}
                {formData.image && (
                  <div className="relative mt-2 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm flex items-center gap-3 p-2.5">
                    <div className="w-20 h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                      <img src={formData.image} alt="Xem trước ảnh xe" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Ảnh xe đã được nạp</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                        {formData.image.startsWith("data:") ? "Ảnh tải lên từ thiết bị (Đã nén tối ưu)" : formData.image}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 h-8 px-2"
                      >
                        Đổi ảnh
                      </Button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: "" })}
                        className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                        title="Xoá ảnh này"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Mô tả chi tiết tiện nghi & dịch vụ
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="VD: Xe có sẵn camera 360, cảm biến an toàn, nội thất da cao cấp, sạc nhanh..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-xs sm:text-sm outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-5"
                >
                  Huỷ bỏ
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold gap-1.5 shadow-md shadow-orange-500/20"
                >
                  <Save className="w-4 h-4" />
                  <span>{submitting ? "Đang lưu..." : isEditing ? "Lưu Thay Đổi" : "Tạo Xe Mới"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
