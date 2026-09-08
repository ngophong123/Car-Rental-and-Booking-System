"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, Sparkles, CheckCircle2, PhoneCall, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("travel");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error("Vui lòng cung cấp số điện thoại!");
      return;
    }
    setSubmitted(true);
    toast.success("Gửi yêu cầu thành công! Chuyên viên Minh Khoa sẽ liên hệ lại ngay trong 5 phút.");
  };

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
            <span>Hỗ Trợ Trực Tuyến 24/7 - Giao Xe Tận Nơi</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight mb-4"
          >
            Liên Hệ Với <span className="text-orange-500">Chúng Tôi</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-300 font-light leading-relaxed max-w-2xl mx-auto"
          >
            Hãy để lại thông tin hoặc gọi điện trực tiếp, chúng tôi sẽ tư vấn dòng xe phù hợp và báo giá trọn gói ưu đãi nhất cho bạn.
          </motion.p>
        </div>
      </section>

      {/* 2. Main Contact Form & Info Grid */}
      <section className="py-14 sm:py-20">
        <div className="container px-4 sm:px-6 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left: Contact Info Cards */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5 space-y-6 text-left"
            >
              <div>
                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Kênh liên hệ nhanh</span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  Thông Tin Minh Khoa
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-2 leading-relaxed">
                  Đội ngũ chăm sóc khách hàng và điều hành xe túc trực 24/7 để tiếp nhận yêu cầu và xử lý thủ tục nhanh chóng nhất.
                </p>
              </div>

              <div className="space-y-4">
                {/* Office Hanoi */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Văn phòng Hà Nội</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Khu đô thị Nam Từ Liêm & Cầu Giấy, Hà Nội</p>
                    <span className="inline-block text-[11px] font-semibold text-emerald-600 mt-1">Phục vụ nội thành & Sân bay Nội Bài</span>
                  </div>
                </div>

                {/* Office HCM */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Văn phòng TP. Hồ Chí Minh</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Quận Bình Thạnh & Quận Tân Bình, TP. Hồ Chí Minh</p>
                    <span className="inline-block text-[11px] font-semibold text-emerald-600 mt-1">Phục vụ nội thành & Tân Sơn Nhất</span>
                  </div>
                </div>

                {/* Hotline */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0">
                      <PhoneCall className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-orange-100 uppercase">Hotline Trực Tuyến 24/7</div>
                      <a href="tel:0859354724" className="text-xl font-black text-white hover:underline">
                        0859 354 724
                      </a>
                    </div>
                  </div>
                  <a href="tel:0859354724">
                    <Button size="sm" className="bg-white text-orange-600 hover:bg-slate-100 font-bold text-xs rounded-xl shadow-sm">
                      Gọi Ngay
                    </Button>
                  </a>
                </div>

                {/* Email & Working Hours */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Email & Thời gian làm việc</h3>
                    <p className="text-xs text-slate-500 mt-0.5">contact@minhkhoa.com</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Tổng đài tiếp nhận yêu cầu 24/7 toàn quốc</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Contact Form */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 bg-white p-6 sm:p-10 rounded-3xl shadow-xl border border-slate-200/80"
            >
              <div className="mb-6">
                <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">Tư vấn trực tiếp</span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  Gửi Yêu Cầu Báo Giá & Đặt Xe
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Để lại thông tin, Minh Khoa sẽ kiểm tra xe trống và gửi báo giá ưu đãi nhất cho bạn.
                </p>
              </div>

              {submitted ? (
                <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="text-lg font-bold text-emerald-900">Gửi yêu cầu thành công!</h4>
                  <p className="text-xs sm:text-sm text-emerald-700">
                    Cảm ơn bạn! Chuyên viên chăm sóc khách hàng của Minh Khoa sẽ liên hệ lại qua số điện thoại <strong>{phone}</strong> trong vòng 5 - 15 phút.
                  </p>
                  <Button 
                    onClick={() => setSubmitted(false)}
                    variant="outline"
                    className="mt-2 text-xs rounded-xl"
                  >
                    Gửi yêu cầu khác
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Họ và tên của bạn
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="VD: Nguyễn Văn A"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-xs sm:text-sm outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Số điện thoại / Zalo <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="VD: 0859 354 724"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-xs sm:text-sm outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Dịch vụ bạn cần
                    </label>
                    <select
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-xs sm:text-sm outline-none bg-white font-semibold text-slate-800"
                    >
                      <option value="self-drive">🚗 Thuê xe tự lái (4 - 7 chỗ)</option>
                      <option value="airport">✈️ Đưa đón sân bay Nội Bài / Tân Sơn Nhất</option>
                      <option value="travel">🗺️ Thuê xe du lịch / Đi tour liên tỉnh</option>
                      <option value="business">💼 Xe công tác đối tác & Doanh nghiệp</option>
                      <option value="wedding">💒 Xe hoa đám cưới sang trọng</option>
                      <option value="monthly">📅 Thuê xe dài hạn theo tháng</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Chi tiết lịch trình hoặc loại xe mong muốn
                    </label>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="VD: Tôi cần thuê xe 7 chỗ Fortuner nhận tại Hà Nội ngày 10/09 đi Sapa 3 ngày 2 đêm..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-xs sm:text-sm outline-none transition-all"
                    />
                  </div>

                  <Button 
                    type="submit"
                    className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <Send className="w-4 h-4" />
                    <span>Gửi Yêu Cầu Cho Minh Khoa</span>
                  </Button>
                </form>
              )}
            </motion.div>

          </div>
        </div>
      </section>

      {/* 3. Interactive Google Maps & Office Locations (No more placeholder!) */}
      <section className="py-12 bg-white border-t border-slate-200">
        <div className="container px-4 sm:px-6 mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Hệ thống văn phòng & bãi đỗ xe</span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">Bản Đồ Chỉ Đường & Điểm Giao Nhận Xe</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Khách hàng có thể nhận xe trực tiếp tại văn phòng hoặc yêu cầu giao xe tận nơi miễn phí.
            </p>
          </div>

          <div className="w-full h-[400px] sm:h-[450px] rounded-3xl overflow-hidden shadow-xl border border-slate-200 relative">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.096814183571!2d105.77971427503144!3d21.02881188062061!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313454b32b8fb863%3A0x7000d57d77b8b22!2zQ-G6p3UgR2nhuqV5LCBIw6AgTuG7mWksIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Minh Khoa Car Rental Google Maps"
              className="w-full h-full"
            />

            {/* Floating Office Card on Map */}
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100 max-w-xs hidden sm:block">
              <div className="flex items-center gap-2 text-xs font-bold text-orange-600">
                <MapPin className="w-4 h-4" />
                <span>Trụ Sở Chính Minh Khoa</span>
              </div>
              <div className="text-xs text-slate-700 font-semibold mt-1">Khu Vực Cầu Giấy & Nam Từ Liêm, Hà Nội</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Hotline: 0859 354 724</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
