import Image from "next/image";
import { Users, Briefcase, Gauge, Fuel, Zap, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface VehicleCardProps {
  id?: string;
  name: string;
  type: string;
  passengers: number;
  luggage: number;
  transmission?: string;
  fuel?: string;
  image: string;
  pricePerDay: string;
}

export function VehicleCard({ 
  id,
  name, 
  type, 
  passengers, 
  luggage, 
  transmission = "Số tự động",
  fuel = "Xăng / Tiết kiệm",
  image, 
  pricePerDay 
}: VehicleCardProps) {
  return (
    <Card className="group overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white hover:border-orange-400/60 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
      {/* Top Image & Badges */}
      <div>
        <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-50 flex items-center justify-center p-4">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 text-sm">
              Không có ảnh
            </div>
          )}

          {/* Type Badge */}
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md text-[11px] font-bold px-2.5 py-1 rounded-full text-slate-800 shadow-sm border border-slate-100">
            {type}
          </div>

          {/* New / Eco Tag */}
          <div className="absolute top-3 right-3 bg-orange-500/90 backdrop-blur-md text-[11px] font-bold px-2 py-0.5 rounded-full text-white shadow-sm flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>Đời Mới</span>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-5">
          <div className="flex justify-between items-start mb-2 gap-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
              {name}
            </h3>
          </div>

          {/* Specifications row (Matches Screenshot 4) */}
          <div className="grid grid-cols-3 gap-2 py-3 my-2 border-y border-slate-100 text-xs text-slate-600">
            <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-slate-50 text-center">
              <Users className="w-4 h-4 text-orange-500 mb-1" />
              <span className="font-semibold text-slate-800 text-[11px]">{passengers} Chỗ</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-slate-50 text-center">
              <Gauge className="w-4 h-4 text-orange-500 mb-1" />
              <span className="font-semibold text-slate-800 text-[11px] truncate max-w-full">{transmission}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-slate-50 text-center">
              <Fuel className="w-4 h-4 text-orange-500 mb-1" />
              <span className="font-semibold text-slate-800 text-[11px] truncate max-w-full">Tiết kiệm</span>
            </div>
          </div>

          {/* Guarantee perk */}
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Bảo hiểm chuyến đi & Giao xe tận nơi</span>
          </div>
        </CardContent>
      </div>

      {/* Footer with Price and Action */}
      <CardFooter className="p-5 pt-0 flex items-center justify-between gap-3 border-t border-slate-100/80 mt-2">
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Giá chỉ từ</span>
          <div className="text-base sm:text-lg font-black text-orange-600 tracking-tight">
            {pricePerDay}
            <span className="text-xs font-normal text-slate-400 ml-0.5">/ngày</span>
          </div>
        </div>

        <Link href={id ? `/vehicles/${id}` : "/vehicles"} className="shrink-0">
          <Button className="h-10 px-4 sm:px-5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/25 transition-all hover:scale-105 active:scale-95">
            Đặt Xe Ngay
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
