"use client";

import Image from "next/image";
import { CheckCircle2, Shield, Clock, ThumbsUp, Car, Award, PhoneCall, ArrowRight, Users, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 overflow-x-hidden font-sans">
      
      {/* 1. Page Header - Premium Automotive Theme */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-600/20 via-transparent to-transparent opacity-70" />
        
        <div className="container relative z-10 px-4 sm:px-6 mx-auto text-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center bg-orange-500/20 border border-orange-500/30 text-orange-400 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold tracking-wide mb-4"
          >
            <span>Thương Hiệu Cho Thuê Xe Uy Tín Hàng Đầu</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight mb-4"
          >
            Về <span className="text-orange-500">Minh Khoa</span> Car Rental
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-300 font-light leading-relaxed max-w-2xl mx-auto"
          >
            Hành trình hơn 10 năm phát triển và đồng hành cùng hàng vạn khách hàng trên mọi cung đường Việt Nam. Minh Khoa kiến tạo trải nghiệm thuê xe tự lái và có tài xế an tâm, minh bạch và đẳng cấp.
          </motion.p>

          {/* Quick Metrics Bar */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-8 border-t border-slate-800 text-left"
          >
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-2xl font-black text-white">10+ Năm</div>
              <div className="text-xs text-slate-400 font-medium">Kinh nghiệm vận tải</div>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-2xl font-black text-orange-400">100+ Xe</div>
              <div className="text-xs text-slate-400 font-medium">Đời mới 2023 - 2026</div>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-2xl font-black text-white">10.000+</div>
              <div className="text-xs text-slate-400 font-medium">Chuyến đi thành công</div>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-2xl font-black text-emerald-400">99.8%</div>
              <div className="text-xs text-slate-400 font-medium">Khách hàng hài lòng</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Story Section with Scroll Reveal */}
      <section className="py-16 sm:py-24">
        <div className="container px-4 sm:px-6 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Story Image */}
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 relative w-full h-[320px] sm:h-[460px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200"
            >
              <Image
                src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop"
                alt="Minh Khoa Fleet Story"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="text-xs font-bold text-orange-400 uppercase tracking-wider">Hành trình phát triển</div>
                <div className="text-xl font-bold">Khởi nguồn từ đam mê mang lại những chuyến đi trọn vẹn</div>
              </div>
            </motion.div>

            {/* Story Text */}
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 space-y-6 text-left"
            >
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Câu chuyện thương hiệu
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Hơn 10 Năm Xây Dựng Niềm Tin Từ Chất Lượng Dịch Vụ
              </h2>
              <div className="space-y-4 text-slate-600 text-sm sm:text-base leading-relaxed font-light">
                <p>
                  Được thành lập từ năm 2013, <strong>Công ty Cổ phần Vận Tải & Du Lịch Minh Khoa</strong> khởi đầu với đội xe phục vụ nhu cầu đi lại cơ bản trong khu vực. Qua hơn một thập kỷ kiên định với chất lượng, chúng tôi đã mở rộng quy mô thành hệ thống cho thuê xe công nghệ hiện đại phủ sóng tại Hà Nội, TP.HCM và các tỉnh trọng điểm.
                </p>
                <p>
                  Phương châm xuyên suốt của Minh Khoa là <strong>&quot;An Toàn - Minh Bạch - Tận Tâm&quot;</strong>. 100% phương tiện đều được bảo dưỡng chính hãng, khử mùi sạch sẽ và kiểm tra kỹ thuật nghiêm ngặt trước mỗi lần bàn giao cho khách hàng.
                </p>
              </div>

              {/* Check highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0" />
                  <span>100% Xe đời mới từ 2023 - 2026</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0" />
                  <span>Bảo hiểm 2 chiều trọn gói</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0" />
                  <span>Giao nhận xe tận nhà & Sân bay</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0" />
                  <span>Hỗ trợ kỹ thuật & Cứu hộ 24/7</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 3. Core Values with Scroll Reveal */}
      <section className="py-16 sm:py-24 bg-white border-y border-slate-100">
        <div className="container px-4 sm:px-6 mx-auto">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <span className="text-xs font-black tracking-widest text-orange-500 uppercase">
              Core Values
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-1">
              Giá Trị Cốt Lõi Của Minh Khoa
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-2">
              Những cam kết bất biến giúp hàng chục ngàn khách hàng luôn tin tưởng lựa chọn chúng tôi.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Card 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-orange-300 hover:shadow-xl transition-all text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-orange-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">An Toàn Tuyệt Đối</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
                Tất cả phương tiện đều có hồ sơ đăng kiểm, bảo hiểm vật chất 2 chiều và được kiểm tra 30 hạng mục an toàn trước khi lăn bánh.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-orange-300 hover:shadow-xl transition-all text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-orange-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Đúng Giờ & Tốc Độ</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
                Thời gian của quý khách là vô giá. Chúng tôi cam kết giao xe đúng giờ hẹn, thủ tục nhận xe chỉ mất 5 phút với CCCD gắn chip.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-orange-300 hover:shadow-xl transition-all text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-orange-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20">
                <ThumbsUp className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Giá Cả Minh Bạch</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
                Bảng giá thuê xe niêm yết rõ ràng theo ngày/tháng, hợp đồng minh bạch, cam kết không phát sinh bất kỳ khoản phụ phí ngầm nào.
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 4. CTA Section */}
      <section className="py-14 sm:py-20 bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 text-white text-center">
        <div className="container px-4 sm:px-6 mx-auto max-w-2xl space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black">
            Sẵn Sàng Cho Hành Trình Tiếp Theo?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base font-light">
            Liên hệ ngay với Minh Khoa để nhận báo giá ưu đãi và giữ xe đời mới cho chuyến đi của bạn.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <a href="tel:0859354724">
              <Button className="h-12 px-7 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-lg gap-2 transition-transform hover:scale-105">
                <PhoneCall className="w-4 h-4" />
                <span>Gọi Hotline: 0859 354 724</span>
              </Button>
            </a>
            <Link href="/vehicles">
              <Button variant="outline" className="h-12 px-7 rounded-xl border-white/30 text-white hover:bg-white/10 font-bold text-sm">
                Xem Đội Xe
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
