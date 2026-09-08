"use client";

import { Plane, Car, Users, Briefcase, CalendarHeart, Map, Sparkles, CheckCircle2, PhoneCall, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

const services = [
  {
    title: "Đưa Đón Sân Bay",
    subtitle: "Nội Bài & Tân Sơn Nhất",
    description: "Đón tiễn đúng giờ, tài xế theo dõi chuyến bay thực tế tránh trễ giờ. Miễn phí chờ 60 phút, phục vụ 24/7.",
    price: "Từ 350.000đ / chuyến",
    Icon: Plane,
    badge: "Phổ Biến",
    features: ["Theo dõi giờ bay", "Miễn phí thời gian chờ", "Hành lý thoải mái"]
  },
  {
    title: "Thuê Xe Tự Lái",
    subtitle: "Tự do trải nghiệm mọi hành trình",
    description: "Hàng trăm dòng xe 4 - 7 chỗ đời mới (Mazda, Toyota, Ford, VinFast). Giao xe tận nhà sau 30 phút, thủ tục nhanh chỉ cần CCCD.",
    price: "Từ 800.000đ / ngày",
    Icon: Car,
    badge: "Hot Nhất",
    features: ["Thủ tục chỉ cần CCCD", "Giao xe tận nơi", "Bảo hiểm 2 chiều"]
  },
  {
    title: "Xe Công Tác Doanh Nghiệp",
    subtitle: "Chuyên nghiệp & Đẳng cấp đối tác",
    description: "Dịch vụ xe sang có tài xế phục vụ đón tiếp đối tác, chuyên gia nước ngoài, hội nghị cao cấp với hóa đơn VAT đầy đủ.",
    price: "Từ 1.500.000đ / ngày",
    Icon: Briefcase,
    badge: "Doanh Nghiệp",
    features: ["Xuất hóa đơn VAT", "Tài xế biết tiếng Anh", "Hợp đồng linh hoạt"]
  },
  {
    title: "Xe Phục Vụ Đám Cưới",
    subtitle: "Sang trọng cho ngày trọng đại",
    description: "Cho thuê xe hoa Mercedes, BMW, Camry kết hoa tươi tinh tế, tài xế trang phục lịch sự, đúng giờ tuyệt đối.",
    price: "Từ 2.000.000đ / buổi",
    Icon: CalendarHeart,
    badge: "Sự Kiện",
    features: ["Trang trí hoa tươi", "Tài xế chuyên nghiệp", "Hỗ trợ đoàn xe đưa dâu"]
  },
  {
    title: "Thuê Xe Theo Tháng",
    subtitle: "Tiết kiệm chi phí tối ưu",
    description: "Giải pháp vận tải dài hạn cho công ty hoặc cá nhân. Xe mới 100%, bảo dưỡng định kỳ miễn phí, chi phí trọn gói.",
    price: "Ưu đãi theo hợp đồng",
    Icon: Users,
    badge: "Tiết Kiệm",
    features: ["Bảo dưỡng định kỳ", "Đổi xe khi bảo dưỡng", "Giá cố định không biến động"]
  },
  {
    title: "Xe Đi Tour & Liên Tỉnh",
    subtitle: "Đồng hành khám phá Việt Nam",
    description: "Phục vụ du lịch khám phá Tây Bắc, Hạ Long, Miền Tây, Đà Lạt với đội xe 4 - 45 chỗ đời mới, tài xế kinh nghiệm đèo dốc an toàn.",
    price: "Từ 1.200.000đ / ngày",
    Icon: Map,
    badge: "Du Lịch",
    features: ["Tài xế thạo đường", "Lịch trình tự do", "Nhiều dòng xe 16-45 chỗ"]
  }
];

export default function ServicesPage() {
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
            className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 text-orange-400 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold tracking-wide mb-4"
          >
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>Giải Pháp Vận Tải Toàn Diện & Đẳng Cấp</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight mb-4"
          >
            Dịch Vụ Của <span className="text-orange-500">Minh Khoa</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-300 font-light leading-relaxed max-w-2xl mx-auto"
          >
            Đáp ứng trọn vẹn mọi nhu cầu di chuyển từ thuê xe tự lái, đưa đón sân bay đến các tour du lịch và hợp đồng vận chuyển doanh nghiệp.
          </motion.p>
        </div>
      </section>

      {/* 2. Services Grid with Scroll Reveal */}
      <section className="py-16 sm:py-24">
        <div className="container px-4 sm:px-6 mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {services.map((service, index) => {
              const Icon = service.Icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false, amount: 0.15 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: (index % 3) * 0.1,
                    ease: "easeOut" 
                  }}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 hover:border-orange-400/80 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-5">
                      <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300 shadow-sm">
                        <Icon className="w-7 h-7" />
                      </div>
                      <span className="text-[11px] font-extrabold uppercase px-3 py-1 rounded-full bg-orange-100 text-orange-700 tracking-wider">
                        {service.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs font-semibold text-orange-500 mt-0.5">
                      {service.subtitle}
                    </p>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light mt-3 mb-5">
                      {service.description}
                    </p>

                    <div className="space-y-2 py-3 border-y border-slate-100 text-xs text-slate-600 font-medium">
                      {service.features.map((feat, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-5 mt-4 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Báo giá</span>
                      <span className="text-sm sm:text-base font-black text-orange-600">{service.price}</span>
                    </div>
                    <Link href="/vehicles">
                      <Button className="h-10 px-4 rounded-xl bg-slate-900 hover:bg-orange-500 text-white font-bold text-xs shadow-sm transition-all group-hover:bg-orange-500">
                        Đặt Xe Ngay
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 3. Commitment Section */}
      <section className="py-14 sm:py-20 bg-white border-y border-slate-100">
        <div className="container px-4 sm:px-6 mx-auto text-center max-w-3xl space-y-6">
          <ShieldCheck className="w-12 h-12 text-orange-500 mx-auto" />
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900">
            Cam Kết Về Chất Lượng Dịch Vụ
          </h2>
          <p className="text-slate-600 text-sm sm:text-base font-light leading-relaxed">
            Minh Khoa cam kết 100% xe sạch sẽ, giao xe đúng giờ hẹn và hoàn tiền nếu quý khách không hài lòng về chất lượng phục vụ.
          </p>
          <div className="pt-2">
            <a href="tel:0859354724">
              <Button className="h-12 px-8 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 gap-2 transition-transform hover:scale-105">
                <PhoneCall className="w-4 h-4" />
                <span>Liên Hệ Tổng Đài: 0859 354 724</span>
              </Button>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
