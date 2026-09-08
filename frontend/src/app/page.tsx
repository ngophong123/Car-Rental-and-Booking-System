"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  MapPin, 
  Calendar, 
  Car, 
  Star, 
  Shield, 
  Clock, 
  ArrowRight, 
  Sparkles,
  Users,
  CheckCircle2,
  PhoneCall,
  Zap,
  Gauge,
  ShieldCheck,
  Send,
  MessageSquare,
  Award,
  Headphones
} from "lucide-react";
import { VehicleCard } from "@/components/shared/VehicleCard";
import { api } from "@/lib/axios";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface Vehicle {
  id: string;
  name: string;
  type: string;
  seatCount: number;
  image: string | null;
  basePrice: number;
  status: string;
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

// Customer quick-need filter categories
const NEED_TAGS = [
  { id: 'all', label: 'Tất cả xe' },
  { id: '4seat', label: '🚗 Xe 4 chỗ đô thị' },
  { id: '7seat', label: '👨‍👩‍👧‍👦 Xe 7 chỗ gia đình' },
  { id: 'electric', label: '⚡ Xe điện thông minh' },
  { id: 'suv', label: '🚙 SUV gầm cao' },
  { id: 'luxury', label: '✨ Xe sang đối tác' },
  { id: 'budget', label: '💰 Giá rẻ dưới 1 triệu' },
];

const REVIEWS_DATA = [
  {
    name: "Nguyễn Hải Yến",
    location: "Hà Nội",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    date: "07/09/2026",
    rating: 5,
    car: "Mazda 3 Luxury",
    comment: "Nhà xe Minh Khoa nhiệt tình cực kỳ, xe sạch bóng như mới, thơm tho chạy rất bốc. Đặt xe giao tận sảnh chung cư chỉ sau 25 phút!"
  },
  {
    name: "Ngô Vĩ Thịnh",
    location: "TP. Hồ Chí Minh",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    date: "07/09/2026",
    rating: 5,
    car: "Ford Everest Titanium",
    comment: "Anh chủ xe rất thân thiện và chu đáo, trong xe có sẵn tẩu sạc nhanh, bơm lốp dự phòng và nước uống miễn phí. Chắc chắn sẽ tiếp tục ủng hộ."
  },
  {
    name: "Nguyễn Thích",
    location: "Đà Nẵng",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    date: "06/09/2026",
    rating: 5,
    car: "VinFast VF8 Plus",
    comment: "Trải nghiệm xe điện VinFast cực kỳ êm ái và hiện đại. Giá thuê minh bạch không phát sinh thêm bất cứ khoản nào. 10 điểm cho Minh Khoa!"
  },
  {
    name: "Trần Minh Anh",
    location: "Hà Nội",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    date: "05/09/2026",
    rating: 5,
    car: "Toyota Fortuner Legender",
    comment: "Giao xe đúng giờ tận ga đến sân bay Nội Bài, tài xế hướng dẫn rất cặn kẽ. Xe 7 chỗ chạy đường đèo Tây Bắc cực đầm và chắc chắn."
  }
];

export default function Home() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [activeNeed, setActiveNeed] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Search Bar state
  const [selectedCity, setSelectedCity] = useState("Hà Nội");
  const [pickupDate, setPickupDate] = useState("2026-09-08T08:00");
  const [returnDate, setReturnDate] = useState("2026-09-09T20:00");

  // Contact form state
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubmitted, setContactSubmitted] = useState(false);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await api.get("/vehicles");
        const list = res.data.data.vehicles || [];
        setVehicles(list);
        setFilteredVehicles(list);
      } catch (error) {
        console.error("Failed to fetch vehicles", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  // Filter vehicles by customer needs
  const handleFilterNeed = (tagId: string) => {
    setActiveNeed(tagId);
    if (tagId === 'all') {
      setFilteredVehicles(vehicles);
    } else if (tagId === '4seat') {
      setFilteredVehicles(vehicles.filter(v => v.seatCount === 4));
    } else if (tagId === '7seat') {
      setFilteredVehicles(vehicles.filter(v => v.seatCount === 7));
    } else if (tagId === 'electric') {
      setFilteredVehicles(vehicles.filter(v => 
        v.name.toLowerCase().includes('vf') || 
        v.name.toLowerCase().includes('vinfast') || 
        v.name.toLowerCase().includes('tesla') ||
        v.name.toLowerCase().includes('ioniq')
      ));
    } else if (tagId === 'suv') {
      setFilteredVehicles(vehicles.filter(v => v.seatCount >= 7 || v.type === 'SEAT_7' || v.name.toLowerCase().includes('everest') || v.name.toLowerCase().includes('fortuner')));
    } else if (tagId === 'luxury') {
      setFilteredVehicles(vehicles.filter(v => v.basePrice >= 2000000 || v.name.toLowerCase().includes('mercedes') || v.name.toLowerCase().includes('bmw')));
    } else if (tagId === 'budget') {
      setFilteredVehicles(vehicles.filter(v => v.basePrice <= 1000000));
    }
  };

  const handleSearch = () => {
    router.push(`/vehicles?city=${encodeURIComponent(selectedCity)}`);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactPhone.trim()) {
      toast.error("Vui lòng nhập số điện thoại để chúng tôi liên hệ!");
      return;
    }
    setContactSubmitted(true);
    toast.success("Cảm ơn bạn! Minh Khoa sẽ liên hệ tư vấn ngay trong 5 phút.");
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 overflow-x-hidden font-sans">
      
      {/* 1. HERO SECTION - INSPIRED BY CODEARRY CAR RENTAL (SCREENSHOT 3) */}
      <section className="relative overflow-hidden pt-6 sm:pt-10 pb-16 sm:pb-24 bg-gradient-to-b from-orange-50/70 via-white to-slate-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Hero Text & Call to Action */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="lg:col-span-6 space-y-5 text-left"
            >
              <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-600 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold tracking-wide">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span>Hệ thống cho thuê xe ô tô công nghệ số 1</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Rent the Car You Need, <span className="text-orange-500">When You Need It.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-xl">
                Khám phá dịch vụ thuê xe tự lái và có tài xế tại <span className="font-bold text-slate-900">{selectedCity}</span>. Xe đời mới 100%, thủ tục nhanh gọn chỉ với CCCD, giao xe tận nơi chỉ sau 30 phút.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a 
                  href="tel:0859354724" 
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-orange-500/30 transition-all hover:scale-105 active:scale-95 text-sm sm:text-base"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Hotline: 0859 354 724</span>
                </a>
                <Link 
                  href="/vehicles"
                  className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-800 font-bold px-6 py-3.5 rounded-xl border border-slate-200 shadow-sm transition-all hover:scale-105 text-sm sm:text-base"
                >
                  <span>Khám phá đội xe</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200/80">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900">100+</div>
                  <div className="text-xs text-slate-500 font-medium">Xe đời mới 2023 - 2026</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900">10.000+</div>
                  <div className="text-xs text-slate-500 font-medium">Chuyến đi hài lòng</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-orange-500">4.9 ★</div>
                  <div className="text-xs text-slate-500 font-medium">Đánh giá 5 sao</div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Sleek Car Showcase (Inspired by Screenshot 3) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, x: 30 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="lg:col-span-6 relative w-full flex items-center justify-center"
            >
              {/* Decorative modern backdrop shape */}
              <div className="absolute w-[90%] h-[90%] rounded-full bg-gradient-to-tr from-orange-400/20 via-amber-300/15 to-transparent blur-3xl -z-10" />

              <div className="relative w-full max-w-lg mx-auto">
                <img
                  src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80"
                  alt="Minh Khoa Car Rental Modern Car"
                  className="w-full h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                />

                {/* Floating pill badge on car */}
                <div className="absolute -bottom-2 left-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Bảo hiểm 2 chiều trọn gói</div>
                    <div className="text-[11px] text-slate-500">Giao xe tận nơi miễn phí</div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 2. FLOATING SEARCH BAR - OVERLAPPING HERO (SCREENSHOT 3) */}
      <section className="container mx-auto px-4 sm:px-6 -mt-8 sm:-mt-12 relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 p-4 sm:p-6"
        >
          {/* Strictly 1-column layout on mobile, grid on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
            
            {/* Field 1: Location */}
            <div className="md:col-span-4 p-3.5 rounded-2xl border border-slate-200/80 hover:border-orange-500 transition-colors flex items-center gap-3 bg-slate-50/50">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Địa điểm nhận xe
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-transparent font-bold text-slate-800 text-sm sm:text-base outline-none cursor-pointer"
                >
                  <option value="Hà Nội">Hà Nội (Nội thành & Sân bay Nội Bài)</option>
                  <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh & Tân Sơn Nhất</option>
                  <option value="Đà Nẵng">Đà Nẵng & Hội An</option>
                  <option value="Hải Phòng">Hải Phòng & Cát Bà</option>
                  <option value="Cần Thơ">Cần Thơ & Miền Tây</option>
                </select>
              </div>
            </div>

            {/* Field 2: Pickup Date */}
            <div className="md:col-span-3 p-3.5 rounded-2xl border border-slate-200/80 hover:border-orange-500 transition-colors flex items-center gap-3 bg-slate-50/50">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Ngày nhận xe
                </label>
                <input
                  type="datetime-local"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full bg-transparent font-bold text-slate-800 text-xs sm:text-sm outline-none"
                />
              </div>
            </div>

            {/* Field 3: Return Date */}
            <div className="md:col-span-3 p-3.5 rounded-2xl border border-slate-200/80 hover:border-orange-500 transition-colors flex items-center gap-3 bg-slate-50/50">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Ngày trả xe
                </label>
                <input
                  type="datetime-local"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full bg-transparent font-bold text-slate-800 text-xs sm:text-sm outline-none"
                />
              </div>
            </div>

            {/* Field 4: Search Action Button */}
            <div className="md:col-span-2 w-full">
              <Button 
                onClick={handleSearch}
                className="w-full h-12 sm:h-14 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-base shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Search className="w-5 h-5" />
                <span>Tìm Xe</span>
              </Button>
            </div>
          </div>

          {/* Customer Needs Filter Chips */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-2.5">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Tìm xe nhanh theo nhu cầu của bạn:
              </span>
            </div>
            {/* Wrap neatly on mobile, strict single column page flow */}
            <div className="flex flex-wrap gap-2">
              {NEED_TAGS.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleFilterNeed(tag.id)}
                  className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                    activeNeed === tag.id
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/25 scale-105 font-bold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60"
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. LATEST INVENTORY / ĐỘI XE MỚI NHẤT (SCREENSHOT 4) */}
      <section className="container mx-auto px-4 sm:px-6 py-14 sm:py-20">
        
        {/* Section Header with Scroll Reveal */}
        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-10 sm:mb-12"
        >
          <span className="text-xs font-black tracking-widest text-orange-500 uppercase">
            Latest Inventory
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-1">
            Đội Xe Mới Nhất & Nổi Bật
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-2">
            Hơn {vehicles.length} dòng xe sẵn sàng giao ngay tại {selectedCity}, trang bị đầy đủ tiện nghi, sạch sẽ & thơm tho.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <p className="text-slate-400 flex items-center gap-2">
              <Car className="animate-spin text-orange-500" /> Đang tải danh sách xe...
            </p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false }}
            className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200"
          >
            <p className="text-slate-500 font-medium">Không tìm thấy xe phù hợp với phân loại này.</p>
            <Button onClick={() => handleFilterNeed('all')} variant="outline" className="mt-4 border-orange-500 text-orange-600">
              Xem tất cả xe
            </Button>
          </motion.div>
        ) : (
          /* Strictly 1 column on mobile, 2 on tablet, 3 on desktop */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredVehicles.map((vehicle, index) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 45, scale: 0.96 }}
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
                  image={vehicle.image || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80"}
                  pricePerDay={formatPrice(vehicle.basePrice)}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* View all button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.4 }}
          className="text-center mt-10"
        >
          <Link href="/vehicles">
            <Button variant="outline" className="h-12 px-8 rounded-2xl border-slate-300 text-slate-800 hover:bg-orange-500 hover:text-white hover:border-orange-500 font-bold transition-all shadow-sm">
              Xem toàn bộ danh sách xe ({vehicles.length} xe)
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* 4. WHY CHOOSE US? SECTION (SCREENSHOT 1) */}
      <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative w-full rounded-3xl sm:rounded-[36px] bg-gradient-to-r from-[#ea580c] via-[#f97316] to-[#fb923c] text-white p-6 sm:p-10 md:p-14 overflow-hidden shadow-2xl"
        >
          {/* Subtle background ambient overlay */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-950/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left: Car Image (Matching Screenshot 1) */}
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-5 flex items-center justify-center order-2 lg:order-1"
            >
              <div className="relative w-full max-w-md">
                <img
                  src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1000&q=80"
                  alt="Minh Khoa Car Fleet White Sports Car"
                  className="w-full h-auto object-contain drop-shadow-2xl rounded-2xl hover:scale-105 transition-transform duration-500 border border-white/20"
                />
                <div className="absolute -bottom-3 right-4 bg-slate-950/90 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg border border-white/10">
                  ⚡ 100% Xe Đời Mới
                </div>
              </div>
            </motion.div>

            {/* Right: Why Choose Us Content & 4 Key Value Props */}
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-7 space-y-6 order-1 lg:order-2 text-left"
            >
              <div>
                <span className="text-xs font-black tracking-widest uppercase bg-white/20 px-3.5 py-1 rounded-full text-white inline-block mb-2">
                  Dịch Vụ Hàng Đầu
                </span>
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                  Why Choose Us?
                </h2>
                <p className="text-orange-100 text-sm sm:text-base mt-2 font-light max-w-xl">
                  Minh Khoa cam kết mang đến trải nghiệm thuê xe tự lái và có tài xế an toàn, tiện lợi và tiết kiệm nhất cho khách hàng.
                </p>
              </div>

              {/* 4 Feature Points with Clean Icons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                
                {/* Feature 1 */}
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1 hover:bg-white/15 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white text-orange-600 flex items-center justify-center font-bold">
                      <Car className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-sm sm:text-base text-white">Đa Dạng Dòng Xe</h4>
                  </div>
                  <p className="text-xs text-orange-100 leading-relaxed pl-10">
                    Từ 4 chỗ đô thị, 7 chỗ gia đình đến 45 chỗ du lịch, bảo dưỡng định kỳ sạch sẽ.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1 hover:bg-white/15 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white text-orange-600 flex items-center justify-center font-bold">
                      <Award className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-sm sm:text-base text-white">Giá Thuê Minh Bạch</h4>
                  </div>
                  <p className="text-xs text-orange-100 leading-relaxed pl-10">
                    Báo giá trọn gói niêm yết rõ ràng, tuyệt đối không có chi phí ẩn phát sinh.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1 hover:bg-white/15 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white text-orange-600 flex items-center justify-center font-bold">
                      <Headphones className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-sm sm:text-base text-white">Cứu Hộ 24/7 Toàn Quốc</h4>
                  </div>
                  <p className="text-xs text-orange-100 leading-relaxed pl-10">
                    Đội ngũ hỗ trợ kỹ thuật và cứu hộ túc trực 24/7, luôn đồng hành cùng bạn.
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1 hover:bg-white/15 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white text-orange-600 flex items-center justify-center font-bold">
                      <Clock className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-sm sm:text-base text-white">Giao Xe Nhanh 30 Phút</h4>
                  </div>
                  <p className="text-xs text-orange-100 leading-relaxed pl-10">
                    Giao xe tận nhà hoặc sân bay chỉ sau 30 phút, thủ tục đơn giản chỉ với CCCD.
                  </p>
                </div>

              </div>

              <div className="pt-2">
                <a 
                  href="tel:0859354724" 
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-950 text-white font-bold px-7 py-3 rounded-xl shadow-lg transition-transform hover:scale-105 text-sm"
                >
                  <PhoneCall className="w-4 h-4 text-orange-400" />
                  <span>Gọi Tư Vấn Ngay: 0859 354 724</span>
                </a>
              </div>
            </motion.div>

          </div>
        </motion.div>
      </section>

      {/* 5. WHAT OUR CUSTOMERS SAY (SCREENSHOT 5) */}
      <section className="py-14 sm:py-20 bg-white border-y border-slate-100">
        <div className="container mx-auto px-4 sm:px-6">
          
          {/* Section Header with Scroll Reveal */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto mb-10 sm:mb-14"
          >
            <span className="text-xs font-black tracking-widest text-orange-500 uppercase">
              What Our Customers Say
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-1">
              Khách Hàng Nói Gì Về Minh Khoa?
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-2">
              Hơn 10.000 khách hàng đã đồng hành cùng chúng tôi và để lại những phản hồi chân thật nhất.
            </p>
          </motion.div>

          {/* Strictly 1 column on mobile, 2 on tablet, 4 on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {REVIEWS_DATA.map((rev, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ 
                  duration: 0.5, 
                  delay: idx * 0.1,
                  ease: "easeOut" 
                }}
                className="w-full bg-slate-50/80 border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between hover:shadow-xl hover:border-orange-300 transition-all"
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-3">
                    <img
                      src={rev.avatar}
                      alt={rev.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-orange-400"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{rev.name}</h4>
                      <div className="text-[11px] text-slate-400 font-medium">{rev.location} • {rev.car}</div>
                      <div className="flex items-center gap-1 text-amber-400 mt-1">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic mt-2">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-200/60">
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Đã xác thực
                  </span>
                  <span>{rev.date}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CONTACT US SECTION (SCREENSHOT 2) */}
      <section className="py-14 sm:py-20 bg-slate-50 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto bg-white rounded-3xl sm:rounded-[36px] border border-slate-200 shadow-xl overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-12">
              
              {/* Left Column: Contact Information (Warm Orange Accent) */}
              <div className="md:col-span-5 bg-gradient-to-br from-orange-600 to-amber-600 p-8 sm:p-10 text-white flex flex-col justify-between space-y-6">
                <div>
                  <span className="text-xs font-bold tracking-widest uppercase bg-white/20 px-3 py-1 rounded-full text-white inline-block mb-3">
                    Contact Us
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                    Liên Hệ Minh Khoa
                  </h3>
                  <p className="text-orange-100 text-xs sm:text-sm mt-2 leading-relaxed">
                    Bạn cần tư vấn dòng xe phù hợp, hỗ trợ lịch trình hay báo giá đoàn du lịch? Hãy để lại tin nhắn hoặc gọi ngay cho chúng tôi!
                  </p>
                </div>

                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-orange-200 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-white">Văn phòng Hà Nội & TP.HCM</div>
                      <div className="text-orange-100 text-xs">Cầu Giấy, HN • Bình Thạnh, HCM</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <PhoneCall className="w-5 h-5 text-orange-200 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-white">Hotline Trực Tuyến 24/7</div>
                      <a href="tel:0859354724" className="text-white hover:underline font-extrabold text-sm">
                        0859 354 724
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-orange-200 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-white">Hỗ trợ qua Zalo & Email</div>
                      <div className="text-orange-100 text-xs">contact@minhkhoa.com</div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/20 text-[11px] text-orange-100">
                  Phục vụ tất cả các ngày trong tuần (kể cả Lễ, Tết).
                </div>
              </div>

              {/* Right Column: Contact Form */}
              <div className="md:col-span-7 p-6 sm:p-10">
                <h4 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-1">
                  Gửi yêu cầu báo giá & tư vấn xe
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 mb-6">
                  Chúng tôi cam kết bảo mật thông tin và phản hồi chỉ sau vài phút.
                </p>

                {contactSubmitted ? (
                  <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h5 className="font-bold text-emerald-900 text-base">Gửi yêu cầu thành công!</h5>
                    <p className="text-xs text-emerald-700">
                      Chuyên viên Minh Khoa sẽ gọi lại cho bạn qua số điện thoại đã cung cấp ngay bây giờ.
                    </p>
                    <Button 
                      onClick={() => setContactSubmitted(false)}
                      variant="outline" 
                      className="mt-3 text-xs"
                    >
                      Gửi tin nhắn khác
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Họ và tên của bạn
                      </label>
                      <input
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="VD: Nguyễn Văn A"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Số điện thoại / Zalo <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="VD: 0859 354 724"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Dòng xe hoặc nhu cầu thuê xe
                      </label>
                      <textarea
                        rows={3}
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="VD: Tôi cần thuê xe 7 chỗ Fortuner từ 10/09 đến 12/09 nhận tại Hà Nội..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm outline-none transition-all"
                      />
                    </div>

                    <Button 
                      type="submit"
                      className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <Send className="w-4 h-4" />
                      <span>Gửi Yêu Cầu Tư Vấn</span>
                    </Button>
                  </form>
                )}
              </div>

            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
