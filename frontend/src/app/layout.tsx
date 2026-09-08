import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Minh Khoa - Dịch vụ thuê xe du lịch",
  description: "Cho thuê xe du lịch chất lượng cao, uy tín và an toàn.",
};

import { SocketProvider } from "@/components/providers/socket-provider";
import { AIChatAssistant } from "@/components/ai/AIChatAssistant";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <SocketProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <AIChatAssistant />
          <Toaster richColors position="top-right" />
        </SocketProvider>
      </body>
    </html>
  );
}
