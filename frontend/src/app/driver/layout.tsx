import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Driver Dashboard - Minh Khoa",
  description: "Trang dành cho tài xế",
};

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container max-w-4xl py-8">
      {children}
    </div>
  );
}
