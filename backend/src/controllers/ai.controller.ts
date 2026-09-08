import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const chatWithAI = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ success: false, message: 'Message is required', data: null });
      return;
    }

    const lower = message.toLowerCase();

    // Fetch active vehicles and services from database
    const allVehicles = await prisma.vehicle.findMany({
      where: { status: 'AVAILABLE' },
      take: 10
    });

    const services = await prisma.service.findMany({
      where: { active: true }
    });

    let reply = '';
    let recommendedVehicles: any[] = [];
    let quickSuggestions: string[] = [];

    // Check query intent with both accented and unaccented support
    const is7Seat = lower.includes('7 chỗ') || lower.includes('7 cho') || lower.includes('7cho') || lower.includes('bảy chỗ') || lower.includes('bay cho') || lower.includes('gia đình') || lower.includes('gia dinh') || lower.includes('suv') || lower.includes('mpv');
    const is4Seat = lower.includes('4 chỗ') || lower.includes('4 cho') || lower.includes('4cho') || lower.includes('bốn chỗ') || lower.includes('bon cho') || lower.includes('sedan') || lower.includes('nhỏ gọn') || lower.includes('nho gon');
    const is16Seat = lower.includes('16 chỗ') || lower.includes('16 cho') || lower.includes('16cho') || lower.includes('mười sáu') || lower.includes('muoi sau') || lower.includes('đoàn') || lower.includes('doan');
    const isBudget = lower.includes('giá rẻ') || lower.includes('gia re') || lower.includes('dưới 1 triệu') || lower.includes('duoi 1 trieu') || lower.includes('rẻ nhất') || lower.includes('re nhat') || lower.includes('tiết kiệm') || lower.includes('tiet kiem') || lower.includes('bao nhiêu') || lower.includes('bao nhieu');
    const isProcedure = lower.includes('thủ tục') || lower.includes('thu tuc') || lower.includes('giấy tờ') || lower.includes('giay to') || lower.includes('cần gì') || lower.includes('can gi') || lower.includes('đặt cọc') || lower.includes('dat coc') || lower.includes('bằng lái') || lower.includes('bang lai') || lower.includes('cccd');
    const isAirport = lower.includes('sân bay') || lower.includes('san bay') || lower.includes('nội bài') || lower.includes('noi bai') || lower.includes('tân sơn nhất') || lower.includes('tan son nhat') || lower.includes('đón tiễn') || lower.includes('don tien');
    const isDriver = lower.includes('có tài') || lower.includes('co tai') || lower.includes('tài xế') || lower.includes('tai xe') || lower.includes('lái xe') || lower.includes('lai xe');

    if (isProcedure) {
      reply = `Dạ, thủ tục thuê xe tại Minh Khoa rất nhanh gọn và minh bạch ạ:
1. 🪪 **Căn cước công dân (CCCD)** gắn chip hoặc Hộ chiếu còn hạn.
2. 🚗 **Giấy phép lái xe (GPLX)** hạng B1/B2 trở lên hợp lệ.
3. 🏍️ **Tài sản thế chấp:** Xe máy chính chủ kèm cà vẹt gốc (trị giá trên 15 triệu) HOẶC đặt cọc 15.000.000đ (hoàn trả ngay sau khi kết thúc chuyến đi).
4. 📍 Giao xe tận nơi miễn phí trong bán kính 5km hoặc giao tại sân bay!

Anh/chị cần em tư vấn dòng xe nào cụ thể không ạ?`;
      quickSuggestions = ['Xem xe 4 chỗ tự lái', 'Xem xe 7 chỗ gia đình', 'Gọi hotline 0859354724'];
    } else if (is7Seat) {
      recommendedVehicles = allVehicles.filter(v => v.seatCount === 7 || v.type === 'SEAT_7');
      reply = `Bên em có các dòng xe 7 chỗ gầm cao, máy êm, rất rộng rãi và tiện nghi cho gia đình hoặc nhóm bạn đi du lịch:
- **Mitsubishi Xpander Premium** (Giá từ 900.000đ/ngày) - Tiết kiệm, rộng rãi
- **Toyota Fortuner Legender** (Giá từ 1.300.000đ/ngày) - Mạnh mẽ, vượt mọi địa hình
- **Ford Everest Titanium 4x4** (Giá từ 1.500.000đ/ngày) - Đẳng cấp, êm ái hàng đầu

Anh/chị có thể bấm vào thẻ xe bên dưới để xem ảnh chi tiết và đặt xe ngay nhé!`;
      quickSuggestions = ['Thủ tục thuê xe 7 chỗ', 'Xe tự lái hay có tài xế?', 'Tư vấn dòng xe tiết kiệm xăng'];
    } else if (is4Seat) {
      recommendedVehicles = allVehicles.filter(v => v.seatCount === 4 || v.type === 'SEAT_4');
      reply = `Các mẫu sedan 4 chỗ đời mới, nhỏ gọn, tiết kiệm nhiên liệu và dễ lái trong phố của Minh Khoa:
- **Toyota Vios G 2023** (Giá chỉ 700.000đ/ngày)
- **Honda City RS 2024** (Giá chỉ 750.000đ/ngày - Bản thể thao)
- **Mercedes-Benz C300 AMG** (Giá 2.500.000đ/ngày - Xe sang phục vụ sự kiện, đối tác)

Anh/chị chọn xe bên dưới để tiến hành đặt ngay ạ!`;
      quickSuggestions = ['Thuê xe tự lái', 'Thuê xe có tài xế', 'Giá thuê dịp cuối tuần'];
    } else if (isBudget) {
      const sorted = [...allVehicles].sort((a, b) => a.basePrice - b.basePrice);
      recommendedVehicles = sorted.slice(0, 3);
      reply = `Dạ, giá thuê xe tại Minh Khoa rất cạnh tranh, cam kết không phát sinh phụ phí ẩn:
- Dòng xe tiết kiệm nhất: **Toyota Vios G** chỉ từ **700.000đ/ngày**.
- Dòng xe thể thao: **Honda City RS** chỉ từ **750.000đ/ngày**.
- Dòng xe 7 chỗ gia đình: **Mitsubishi Xpander** chỉ từ **900.000đ/ngày**.

Anh/chị xem chi tiết các xe giá tốt nhất bên dưới nhé:`;
      quickSuggestions = ['Đặt xe Vios 700k', 'Thủ tục thuê xe', 'Hotline 0859354724'];
    } else if (isAirport) {
      recommendedVehicles = allVehicles.slice(0, 2);
      reply = `Minh Khoa cung cấp dịch vụ đưa đón sân bay chuyên nghiệp (Nội Bài, Tân Sơn Nhất, Đà Nẵng):
- Giá cước trọn gói cố định, không lo tăng giá giờ cao điểm.
- Tài xế đón tiễn tận sảnh, cầm biển tên, hỗ trợ mang hành lý.
- Theo dõi lịch bay thực tế, đảm bảo đúng giờ 100%.

Anh/chị có thể liên hệ trực tiếp hotline **0859 354 724** hoặc đặt xe trực tiếp trên web ạ!`;
      quickSuggestions = ['Báo giá đưa đón sân bay', 'Thuê xe có tài xế', 'Xem các dòng xe'];
    } else if (isDriver) {
      recommendedVehicles = allVehicles.slice(0, 3);
      reply = `Dạ, nếu anh/chị cần thuê xe kèm tài xế, Minh Khoa có đội ngũ tài xế chuyên nghiệp:
- Nhiều năm kinh nghiệm lái xe đường trường và đô thị.
- Lịch sự, chu đáo, nhiệt tình hỗ trợ suốt hành trình.
- Phụ phí tài xế chỉ từ **300.000đ/ngày**.

Anh/chị muốn thuê xe loại mấy chỗ để em sắp xếp xe và bác tài phù hợp nhất ạ?`;
      quickSuggestions = ['Xe 7 chỗ có tài xế', 'Xe 4 chỗ có tài xế', 'Tư vấn lộ trình'];
    } else {
      // General assistance
      recommendedVehicles = allVehicles.slice(0, 3);
      reply = `Chào anh/chị! Em là trợ lý AI của Minh Khoa. Em có thể hỗ trợ anh/chị:
1. 🔍 **Tìm xe phù hợp:** Xe 4 chỗ, 7 chỗ gia đình, xe sang đón đối tác...
2. 💰 **Báo giá thuê xe:** Tự lái hoặc có tài xế, giá theo ngày hoặc dài hạn.
3. 📝 **Hướng dẫn thủ tục thuê xe:** Giấy tờ, tiền cọc và cách thức nhận xe.
4. 📞 **Hỗ trợ khẩn cấp:** Hotline 24/7 **0859 354 724**.

Anh/chị đang có nhu cầu thuê xe vào thời gian nào và đi đâu ạ?`;
      quickSuggestions = ['Tìm xe 7 chỗ gia đình', 'Xe tự lái dưới 1 triệu', 'Cần giấy tờ gì để thuê xe?'];
    }

    res.status(200).json({
      success: true,
      message: 'AI response generated',
      data: {
        reply,
        recommendedVehicles: recommendedVehicles.map(v => ({
          id: v.id,
          name: v.name,
          seatCount: v.seatCount,
          basePrice: v.basePrice,
          image: v.image,
          type: v.type,
          brand: v.brand
        })),
        quickSuggestions
      }
    });

  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ success: false, message: 'AI service error', data: null });
  }
};
