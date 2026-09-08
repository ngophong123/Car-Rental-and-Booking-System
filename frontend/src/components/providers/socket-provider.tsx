"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token, user } = useAuthStore();

  useEffect(() => {
    if (!token) return;

    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:4000", {
      auth: {
        token
      }
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log("Socket connected:", socketInstance.id);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket disconnected");
    });

    // Global Event Listeners
    socketInstance.on("booking:created", (data: any) => {
      if (user?.role === "ADMIN" || user?.role === "STAFF") {
        toast.info(`Có đơn đặt xe mới: ${data.bookingId}`, {
          description: "Vui lòng vào trang quản lý để xác nhận.",
        });
      }
    });

    socketInstance.on("booking:status_changed", (data: any) => {
      if (user?.role === "CUSTOMER") {
        toast.success(`Cập nhật chuyến đi`, {
          description: `Đơn xe ${data.bookingId} đã chuyển trạng thái sang: ${data.status}`,
        });
      }
    });

    socketInstance.on("booking:assigned", (data: any) => {
      if (user?.role === "DRIVER") {
        toast.info("Bạn được phân công chuyến mới!", {
          description: `Mã chuyến: ${data.bookingId}. Hãy kiểm tra lịch trình.`,
        });
      } else if (user?.role === "CUSTOMER") {
        toast.success("Đã xếp xe thành công", {
          description: `Tài xế của bạn đang chuẩn bị. Mã chuyến: ${data.bookingId}`,
        });
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token, user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
