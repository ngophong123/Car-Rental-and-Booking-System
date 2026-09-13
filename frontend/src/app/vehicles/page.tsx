"use client";

import { useEffect, useState, useMemo } from "react";
import { VehicleCard } from "@/components/shared/VehicleCard";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/axios";
import { Car, Search, SlidersHorizontal, Filter, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface Vehicle {
  id: string;
  name: string;
  type: string;
  seatCount: number;
  image: string | null;
  basePrice: number;
  brand?: string;
  model?: string;
}

const mapTypeToText = (type: string) => {
  const map: Record<string, string> = {
    SEAT_4: "Xe 4 chỗ",
    SEAT_7: "Xe 7 chỗ",
    SEAT_16: "Xe 16 chỗ",
    SEAT_29: "Xe 29 chỗ",
    SEAT_45: "Xe 45 chỗ",
  };
  return map[type] || "Xe ô tô";
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const CATEGORIES = [
  { id: "ALL", label: "Tất cả chỗ ngồi" },
  { id: "SEAT_4", label: "🚗 Xe 4 chỗ" },
  { id: "SEAT_7", label: "🚙 Xe 7 chỗ" },
  { id: "SEAT_16", label: "🚐 Xe 16 chỗ" },
  { id: "SEAT_29", label: "🚌 Xe 29 chỗ" },
  { id: "SEAT_45", label: "🚍 Xe 45 chỗ" },
];

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [priceSort, setPriceSort] = useState<string>("default");

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const res = await api.get("/vehicles");
        setVehicles(res.data.data.vehicles || []);
      } catch (error) {
        console.error("Failed to fetch vehicles", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVehicles();
  }, []);

  // Filter and sort logic
  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter((vehicle) => {
        const matchesCategory = activeFilter === "ALL" || vehicle.type === activeFilter;
        const matchesSearch =
          searchKeyword === "" ||
          vehicle.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          vehicle.brand?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          vehicle.model?.toLowerCase().includes(searchKeyword.toLowerCase());

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (priceSort === "asc") return a.basePrice - b.basePrice;
        if (priceSort === "desc") return b.basePrice - a.basePrice;
        return 0;
      });
  }, [vehicles, activeFilter, searchKeyword, priceSort]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 overflow-x-hidden font-sans">
      
      {/* 1. Page Header */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-600/20 via-transparent to-transparent opacity-70" />
        
        <div className="container relative z-10 px-4 sm:px-6 mx-auto text-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center bg-orange-500/20 border border-orange-500/30 text-orange-400 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold tracking-wide mb-4"
          >
            <span>Đầy Đủ Các Phân Khúc Từ 4 - 45 Chỗ</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight mb-4"
          >
            Đội Xe Cho Thuê <span className="text-orange-500">Minh Khoa</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-300 font-light leading-relaxed max-w-2xl mx-auto"
          >
            Tất cả xe đều được bảo dưỡng chính hãng định kỳ, kiểm tra kỹ thuật nghiêm ngặt, khử mùi sạch sẽ và giao xe tận nơi nhanh chóng.
          </motion.p>
        </div>
      </section>

      {/* 2. Filters & Search Controls (Floating Card) */}
      <section className="container mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-200/80 space-y-4"
        >
          {/* Top Row: Search input + Price sort */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm tên xe (Vios, Fortuner, Everest, VF8, Mercedes...)"
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 shrink-0">Sắp xếp giá:</span>
                <select
                  value={priceSort}
                  onChange={(e) => setPriceSort(e.target.value)}
                  className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 font-semibold text-slate-700 outline-none cursor-pointer bg-white"
                >
                  <option value="default">Mặc định</option>
                  <option value="asc">Giá: Thấp đến Cao</option>
                  <option value="desc">Giá: Cao đến Thấp</option>
                </select>
              </div>

              <span className="text-xs font-semibold text-slate-400">
                Tìm thấy <strong className="text-orange-600 font-black">{filteredVehicles.length}</strong> xe
              </span>
            </div>
          </div>

          {/* Bottom Row: Category Chips */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer ${
                  activeFilter === cat.id
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/25 scale-105"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 3. Vehicles Grid */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-3">
            <Car className="w-10 h-10 animate-spin text-orange-500" />
            <p className="text-slate-400 text-sm font-medium">Đang tải danh sách phương tiện...</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200"
          >
            <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700">Không tìm thấy xe phù hợp</h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">Vui lòng thử tìm với từ khoá hoặc điều kiện lọc khác.</p>
            <Button 
              onClick={() => { setActiveFilter("ALL"); setSearchKeyword(""); setPriceSort("default"); }} 
              variant="outline" 
              className="mt-4 border-orange-500 text-orange-600 font-bold"
            >
              Đặt lại bộ lọc
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredVehicles.map((vehicle, index) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 40, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: false, amount: 0.15 }}
                transition={{ 
                  duration: 0.5, 
                  delay: (index % 3) * 0.1,
                  ease: "easeOut" 
                }}
                className="w-full"
              >
                <VehicleCard
                  id={vehicle.id}
                  name={vehicle.name}
                  type={mapTypeToText(vehicle.type)}
                  passengers={vehicle.seatCount}
                  luggage={vehicle.seatCount > 16 ? 10 : vehicle.seatCount > 4 ? 4 : 2}
                  image={vehicle.image || "/images/cars/toyota-fortuner-black-fleet.jpg"}
                  pricePerDay={formatPrice(vehicle.basePrice)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
