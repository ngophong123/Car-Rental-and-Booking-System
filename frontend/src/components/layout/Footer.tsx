import Link from 'next/link';
import { MapPin, Phone, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="container mx-auto px-4 md:px-8 py-12 md:py-16">
        {/* Top 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Contact info */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center space-x-2">
              <span className="text-2xl font-black tracking-tight text-emerald-400">MINH KHOA</span>
            </Link>

            <div className="space-y-1">
              <a 
                href="tel:0859354724" 
                className="text-2xl font-bold text-white hover:text-emerald-400 transition-colors flex items-center gap-2"
              >
                0859 354 724
              </a>
              <p className="text-xs text-slate-400">Tổng đài hỗ trợ: 7AM - 10PM (Hàng ngày)</p>
            </div>

            <div className="space-y-1">
              <a 
                href="mailto:contact@minhkhoa.com" 
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                contact@minhkhoa.com
              </a>
              <p className="text-xs text-slate-400">Gửi mail cho Minh Khoa</p>
            </div>

            <div className="flex space-x-3 pt-2">
              <a 
                href="#" 
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors"
                title="Facebook"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors"
                title="Tiktok"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.46 2.77 1.05-.03 2.05-.59 2.63-1.48.4-.57.6-1.27.6-1.98.03-4.48.01-8.96.01-13.44.02-.32.03-.64.03-.96z"/>
                </svg>
              </a>
              <a 
                href="https://zalo.me/0859354724" 
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-blue-600 text-white flex items-center justify-center font-bold text-xs transition-colors"
                title="Zalo"
              >
                Zalo
              </a>
            </div>
          </div>

          {/* Col 2: Chính Sách */}
          <div>
            <h4 className="font-bold text-white text-base mb-4">Chính Sách</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link href="/about" className="hover:text-emerald-400 transition-colors">Chính sách & Quy định</Link></li>
              <li><Link href="/about" className="hover:text-emerald-400 transition-colors">Quy chế hoạt động</Link></li>
              <li><Link href="/about" className="hover:text-emerald-400 transition-colors">Chính sách bảo mật (BVDLCN)</Link></li>
              <li><Link href="/contact" className="hover:text-emerald-400 transition-colors">Giải quyết khiếu nại</Link></li>
            </ul>
          </div>

          {/* Col 3: Tìm Hiểu Thêm */}
          <div>
            <h4 className="font-bold text-white text-base mb-4">Tìm Hiểu Thêm</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link href="/about" className="hover:text-emerald-400 transition-colors">Hướng dẫn chung</Link></li>
              <li><Link href="/vehicles" className="hover:text-emerald-400 transition-colors">Hướng dẫn đặt xe</Link></li>
              <li><Link href="/bookings" className="hover:text-emerald-400 transition-colors">Hướng dẫn thanh toán</Link></li>
              <li><Link href="/about" className="hover:text-emerald-400 transition-colors">Về Minh Khoa</Link></li>
              <li><Link href="/contact" className="hover:text-emerald-400 transition-colors">Hỏi và trả lời</Link></li>
            </ul>
          </div>

          {/* Col 4: Đối Tác */}
          <div>
            <h4 className="font-bold text-white text-base mb-4">Đối Tác</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link href="/contact" className="hover:text-emerald-400 transition-colors">Đăng ký chủ xe / Đối tác</Link></li>
              <li><Link href="/contact" className="hover:text-emerald-400 transition-colors">Đăng ký thiết bị GPS định vị</Link></li>
              <li><Link href="/services" className="hover:text-emerald-400 transition-colors">Thuê xe dài hạn theo tháng</Link></li>
              <li><Link href="/contact" className="hover:text-emerald-400 transition-colors">Hợp tác doanh nghiệp</Link></li>
            </ul>
          </div>
        </div>

        {/* Legal & Corporate Info */}
        <div className="pt-8 border-t border-slate-800 text-xs text-slate-400 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="font-semibold text-slate-300">© Công ty Cổ phần Vận tải & Du lịch Minh Khoa</p>
              <p className="mt-1">Số GCNĐKKD: 0317307544 - Cấp ngày: 24-05-2022</p>
              <p>Nơi cấp: Sở Kế hoạch và Đầu tư TP. Hồ Chí Minh & Hà Nội</p>
            </div>
            <div>
              <p className="font-semibold text-slate-300">Văn phòng đại diện</p>
              <p className="mt-1">📍 Hà Nội: Cầu Giấy, Nam Từ Liêm, TP. Hà Nội</p>
              <p>📍 TP.HCM: Quận Bình Thạnh, TP. Hồ Chí Minh</p>
            </div>
            <div>
              <p className="font-semibold text-slate-300">Thông tin tài khoản ngân hàng</p>
              <p className="mt-1">Tên TK: CONG TY CO PHAN MINH KHOA</p>
              <p>Số TK: <span className="text-emerald-400 font-bold">0859354724</span> - Vietcombank</p>
            </div>
          </div>

          {/* Payment Partners & Security Badges */}
          <div className="pt-6 mt-6 border-t border-slate-800/60 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Hệ thống thanh toán bảo mật chuẩn quốc tế SSL 256-bit</span>
            </div>

            {/* Payment Partner Logos */}
            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2 sm:gap-2.5 text-xs">
              <span className="font-medium text-slate-400 mr-1 text-xs hidden sm:inline">Chấp nhận:</span>
              
              {/* MoMo */}
              <div 
                className="h-8 px-2.5 bg-[#A50064] text-white rounded-lg flex items-center justify-center font-black text-[11px] shadow-sm hover:scale-105 transition-transform cursor-default"
                title="Ví Điện Tử MoMo"
              >
                <span className="tracking-tighter">mo<span className="text-yellow-300">mo</span></span>
              </div>

              {/* VNPay */}
              <div 
                className="h-8 px-2.5 bg-white text-slate-900 rounded-lg flex items-center justify-center font-black text-[11px] shadow-sm hover:scale-105 transition-transform cursor-default"
                title="Cổng thanh toán VNPAY-QR"
              >
                <span className="text-[#005BAA]">VN</span>
                <span className="text-[#ED1C24]">PAY</span>
              </div>

              {/* ZaloPay */}
              <div 
                className="h-8 px-2.5 bg-[#008FE5] text-white rounded-lg flex items-center justify-center font-bold text-[11px] shadow-sm hover:scale-105 transition-transform cursor-default"
                title="Ví ZaloPay"
              >
                <span>Zalo<span className="text-[#00FF87]">Pay</span></span>
              </div>

              {/* VISA */}
              <div 
                className="h-8 px-3 bg-white text-[#1A1F71] rounded-lg flex items-center justify-center font-black italic text-xs tracking-wider shadow-sm hover:scale-105 transition-transform cursor-default border border-slate-700/50"
                title="Thẻ Quốc Tế Visa"
              >
                <span>VISA</span>
              </div>

              {/* Mastercard */}
              <div 
                className="h-8 px-2.5 bg-slate-950 text-white rounded-lg flex items-center justify-center gap-1.5 shadow-sm hover:scale-105 transition-transform cursor-default border border-slate-700/50"
                title="Thẻ Quốc Tế Mastercard"
              >
                <div className="flex -space-x-1.5 items-center">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#EB001B]"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-[#F79E1B] opacity-85"></div>
                </div>
                <span className="text-[10px] font-semibold tracking-tight text-slate-200">mastercard</span>
              </div>

              {/* Apple Pay */}
              <div 
                className="h-8 px-2.5 bg-black text-white rounded-lg flex items-center justify-center gap-1 text-[11px] font-semibold shadow-sm hover:scale-105 transition-transform cursor-default border border-slate-700/50"
                title="Apple Pay"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.5-7.79-11.44-14.14-5.87-9.46-10.45-20.08-13.73-31.84-3.28-11.77-4.92-23.01-4.92-33.72 0-14.7 3.72-26.6 11.16-35.69 7.44-9.1 16.54-13.73 27.31-13.89 4.8 0 10.11 1.24 15.93 3.71 5.82 2.47 9.56 3.76 11.22 3.86 1.48 0 5.48-1.39 12-4.17 6.52-2.78 12.24-3.97 17.16-3.58 13.06 1.06 23.36 5.86 30.9 14.41-11.44 6.9-17.06 16.48-16.86 28.75.21 9.8 4.07 17.97 11.58 24.51 7.51 6.54 16.27 10.3 26.29 11.28-2.22 6.99-5.18 14.15-8.88 21.49h-.02zM119.22 31.84c0-7.39 2.66-14.42 7.99-21.1 5.33-6.68 11.96-10.59 19.89-11.74.21 1.06.32 2.06.32 3.01 0 7.39-2.82 14.54-8.47 21.44-5.65 6.9-12.27 10.87-19.87 11.91-.07-1.16.14-2.33.14-3.52z"/>
                </svg>
                <span>Pay</span>
              </div>

              {/* Vietcombank */}
              <div 
                className="h-8 px-2.5 bg-[#006037] text-white rounded-lg flex items-center justify-center font-bold text-[10px] tracking-tight shadow-sm hover:scale-105 transition-transform cursor-default"
                title="Ngân hàng TMCP Ngoại thương Việt Nam - Vietcombank"
              >
                <span>Vietcombank</span>
              </div>

              {/* VietQR / Napas */}
              <div 
                className="h-8 px-2.5 bg-gradient-to-r from-blue-700 to-cyan-600 text-white rounded-lg flex items-center justify-center font-black text-[10px] shadow-sm hover:scale-105 transition-transform cursor-default"
                title="Chuyển khoản nhanh Napas 247 & VietQR"
              >
                <span>VietQR 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
