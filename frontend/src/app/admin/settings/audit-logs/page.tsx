"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ChevronLeft, 
  History, 
  Search, 
  Filter, 
  RefreshCw, 
  User, 
  Shield, 
  Clock, 
  ChevronRight, 
  Eye, 
  X,
  FileCode,
  Globe,
  Laptop
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  resource: string;
  resourceId?: string | null;
  details?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  admin?: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  } | null;
}

const actionBadgeStyles: Record<string, { label: string; bg: string; text: string; border: string }> = {
  UPDATE_SETTINGS: { label: "Sửa cài đặt", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  UPDATE_CUSTOMER: { label: "Sửa khách hàng", bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  DELETE_CUSTOMER: { label: "Xóa khách hàng", bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  CONFIRM_PAYMENT: { label: "Duyệt thanh toán", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  REFUND_PAYMENT: { label: "Hoàn tiền", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  CHANGE_PASSWORD: { label: "Đổi mật khẩu", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  UPDATE_PROFILE: { label: "Cập nhật hồ sơ", bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" },
  LOGIN: { label: "Đăng nhập", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  LOGOUT: { label: "Đăng xuất", bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [actionFilter, setActionFilter] = useState("");
  const [resourceFilter, setResourceFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Detail Modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit,
      };
      if (actionFilter) params.action = actionFilter;
      if (resourceFilter) params.resource = resourceFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get("/admin/settings/audit-logs", { params });
      if (res.data.success) {
        setLogs(res.data.data.logs || []);
        setTotalPages(res.data.data.pagination?.totalPages || 1);
        setTotalCount(res.data.data.pagination?.total || 0);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Không thể tải nhật ký kiểm toán");
    } finally {
      setLoading(false);
    }
  }, [page, limit, actionFilter, resourceFilter, startDate, endDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/admin/settings">
              <Button variant="outline" size="sm" className="h-9 px-3 text-slate-700 bg-white">
                <ChevronLeft className="h-4 w-4 mr-1" /> Quay lại Cài đặt
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5 mt-3">
            <History className="h-7 w-7 text-orange-600" />
            Nhật ký Hoạt động Hệ thống (Audit Logs)
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Ghi chép toàn diện mọi hành động nhạy cảm của quản trị viên để đảm bảo an ninh và tính minh bạch.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 bg-white text-slate-700 shadow-sm"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Action Filter */}
            <div>
              <select
                aria-label="Lọc theo hành động"
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Tất cả hành động</option>
                <option value="UPDATE_SETTINGS">Sửa cài đặt</option>
                <option value="UPDATE_CUSTOMER">Cập nhật khách hàng</option>
                <option value="DELETE_CUSTOMER">Xóa khách hàng</option>
                <option value="CONFIRM_PAYMENT">Duyệt thanh toán</option>
                <option value="REFUND_PAYMENT">Hoàn tiền</option>
                <option value="CHANGE_PASSWORD">Đổi mật khẩu</option>
                <option value="UPDATE_PROFILE">Cập nhật hồ sơ</option>
                <option value="LOGIN">Đăng nhập</option>
                <option value="LOGOUT">Đăng xuất</option>
              </select>
            </div>

            {/* Resource Filter */}
            <div>
              <select
                aria-label="Lọc theo tài nguyên"
                value={resourceFilter}
                onChange={(e) => {
                  setResourceFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Tất cả tài nguyên</option>
                <option value="SETTINGS">SETTINGS (Cài đặt)</option>
                <option value="USER">USER (Người dùng/Khách)</option>
                <option value="PAYMENT">PAYMENT (Thanh toán)</option>
                <option value="BOOKING">BOOKING (Chuyến xe)</option>
              </select>
            </div>

            {/* Date Start */}
            <div>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="h-9 text-xs bg-white"
                title="Từ ngày"
              />
            </div>

            {/* Date End */}
            <div>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="h-9 text-xs bg-white"
                title="Đến ngày"
              />
            </div>
          </div>

          {(actionFilter || resourceFilter || startDate || endDate) && (
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Đang lọc kết quả</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setActionFilter("");
                  setResourceFilter("");
                  setStartDate("");
                  setEndDate("");
                  setPage(1);
                }}
                className="h-6 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              >
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-4">Quản trị viên</th>
                <th className="py-3 px-4">Hành động</th>
                <th className="py-3 px-4">Tài nguyên</th>
                <th className="py-3 px-4">Địa chỉ IP</th>
                <th className="py-3 px-4 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-orange-500" />
                    Đang tải nhật ký...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <History className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                    Không tìm thấy bản ghi nhật ký nào.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const actionStyle = actionBadgeStyles[log.action] || {
                    label: log.action,
                    bg: "bg-slate-100",
                    text: "text-slate-700",
                    border: "border-slate-200",
                  };

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Thời gian */}
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        <div className="font-medium text-slate-900">
                          {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: vi })}
                        </div>
                      </td>

                      {/* Quản trị viên */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {log.admin?.name || log.admin?.email || "Hệ thống"}
                        </div>
                        {log.admin && (
                          <div className="text-[11px] text-slate-500 font-mono">
                            {log.admin.email} • <span className="text-orange-600 font-bold">{log.admin.role}</span>
                          </div>
                        )}
                      </td>

                      {/* Hành động */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-semibold border ${actionStyle.bg} ${actionStyle.text} ${actionStyle.border}`}
                        >
                          {actionStyle.label}
                        </span>
                      </td>

                      {/* Tài nguyên */}
                      <td className="py-3 px-4 font-mono">
                        <span className="text-slate-800 font-bold">{log.resource}</span>
                        {log.resourceId && (
                          <span className="text-slate-500 ml-1">({log.resourceId})</span>
                        )}
                      </td>

                      {/* IP & Thiết bị */}
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3 text-slate-400" />
                          {log.ipAddress || "127.0.0.1"}
                        </div>
                      </td>

                      {/* Thao tác */}
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                          className="h-7 px-2 text-slate-600 hover:text-slate-900"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Xem Payload
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Hiển thị <strong className="text-slate-900">{logs.length}</strong> trong tổng số{" "}
            <strong className="text-slate-900">{totalCount}</strong> bản ghi
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="h-7 px-2 text-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Trước
            </Button>
            <span className="px-2 font-medium">
              Trang {page} / {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="h-7 px-2 text-xs"
            >
              Sau <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Log Payload Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="h-5 w-5 text-orange-600" />
                <h3 className="text-base font-bold text-slate-900">Chi tiết Dữ liệu Nhật ký (Audit Details)</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border">
                <div>
                  <span className="text-slate-400 block">Hành động:</span>
                  <strong className="text-slate-900">{selectedLog.action}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Thời gian:</span>
                  <strong className="text-slate-900">
                    {format(new Date(selectedLog.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: vi })}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Người thực hiện:</span>
                  <strong className="text-slate-900">{selectedLog.admin?.name || selectedLog.admin?.email}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">IP:</span>
                  <strong className="text-slate-900">{selectedLog.ipAddress || "127.0.0.1"}</strong>
                </div>
              </div>

              {selectedLog.userAgent && (
                <div>
                  <span className="text-slate-400 block mb-1">User Agent:</span>
                  <code className="block bg-slate-100 p-2 rounded text-[11px] font-mono break-all text-slate-700">
                    {selectedLog.userAgent}
                  </code>
                </div>
              )}

              <div>
                <span className="text-slate-400 block mb-1 font-semibold">Dữ liệu ghi nhận (Payload):</span>
                <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg text-xs font-mono overflow-x-auto max-h-64 leading-relaxed">
                  {JSON.stringify(selectedLog.details || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedLog(null)}>
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
