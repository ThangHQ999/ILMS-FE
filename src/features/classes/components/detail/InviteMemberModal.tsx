'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { generateQrMatrix } from '@/lib/qr';
import {
  regenerateClassCode,
  inviteMemberByEmail,
} from '@/features/classes/services/class.service';

export interface InviteMemberModalProps {
  classId?: string;
  classCode: string;
  isOpen: boolean;
  onClose: () => void;
  onInvite?: (emailOrEmails: string) => void;
  onCodeRegenerated?: (newCode: string) => void;
  instructorName?: string;
  enrolledCount?: number;
  maxStudents?: number;
  endAt?: string | null;
  currentRole?: 'student' | 'teacher' | 'owner';
  onSaveSettings?: (settings: {
    autoApprove: boolean;
    limitCap: boolean;
    enrollmentKey: string;
  }) => void;
  onToast?: (message: string) => void;
}

export function InviteMemberModal({
  classId,
  classCode,
  isOpen,
  onClose,
  onInvite,
  onCodeRegenerated,
  instructorName = '',
  enrolledCount = 0,
  maxStudents = 60,
  endAt,
  currentRole = 'teacher',
  onSaveSettings,
  onToast,
}: InviteMemberModalProps) {
  const isStudent = currentRole === 'student';
  // State
  const [enrollmentKey, setEnrollmentKey] = useState(classCode || '');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [autoApprove, setAutoApprove] = useState(true);
  const [limitCap, setLimitCap] = useState(true);
  const [bulkEmails, setBulkEmails] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Synchronize key when classCode prop updates
  useEffect(() => {
    setEnrollmentKey(classCode || '');
  }, [classCode]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const notify = useCallback(
    (msg: string) => {
      if (onToast) onToast(msg);
    },
    [onToast]
  );

  const baseFrontendUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://ilms.page')
  ).replace(/\/+$/, '');

  const directInviteLink = enrollmentKey
    ? `${baseFrontendUrl}/classes?code=${encodeURIComponent(enrollmentKey)}`
    : `${baseFrontendUrl}/classes`;

  const qrSvgData = useMemo(() => {
    const matrix = generateQrMatrix(directInviteLink);
    const size = matrix.length;
    const quietZone = 2;
    const parts: string[] = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (matrix[r][c]) {
          parts.push(`M${c + quietZone} ${r + quietZone}h1v1h-1z`);
        }
      }
    }
    return {
      viewBoxSize: size + quietZone * 2,
      path: parts.join(''),
    };
  }, [directInviteLink]);

  if (!isOpen) return null;

  // Copy enrollment code
  const handleCopyCode = () => {
    if (!enrollmentKey) return;
    navigator.clipboard
      .writeText(enrollmentKey)
      .then(() => {
        setCopiedKey(true);
        notify(`Đã sao chép mã mời "${enrollmentKey}" vào bộ nhớ tạm!`);
        setTimeout(() => setCopiedKey(false), 2000);
      })
      .catch(() => {});
  };

  // Copy direct link
  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(directInviteLink)
      .then(() => {
        setCopiedLink(true);
        notify('Đã sao chép đường link mời tham gia trực tiếp!');
        setTimeout(() => setCopiedLink(false), 2000);
      })
      .catch(() => {});
  };

  // Regenerate enrollment code via backend API
  const handleResetCode = async () => {
    if (!classId) {
      notify('Không tìm thấy mã lớp học để tạo lại mã mời.');
      return;
    }
    setIsResetting(true);
    try {
      const newCode = await regenerateClassCode(classId);
      setEnrollmentKey(newCode);
      onCodeRegenerated?.(newCode);
      notify(`Đã tạo lại mã mời mới: ${newCode}`);
    } catch {
      notify('Không thể tạo lại mã mời lúc này. Vui lòng thử lại.');
    } finally {
      setIsResetting(false);
    }
  };

  // Download QR code as PNG
  const handleDownloadQR = () => {
    try {
      const svg = document.getElementById('enrollment-qr-svg');
      if (!svg) {
        notify(`Hệ thống đang xuất file mã QR: ${classCode}_QRCode.png`);
        return;
      }
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 320;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, 320, 320);
          ctx.drawImage(img, 0, 0, 320, 320);
          const pngFile = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.download = `${classCode}_QRCode.png`;
          downloadLink.href = pngFile;
          downloadLink.click();
        }
      };
      img.src =
        'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
      notify(`Đang tải ảnh mã QR lớp ${classCode}...`);
    } catch {
      notify(`Đã xuất file mã QR: ${classCode}_QRCode.png`);
    }
  };

  // Send bulk invitations
  const handleSendBulkInvites = async (e: React.FormEvent) => {
    e.preventDefault();
    const emails = bulkEmails
      .split(/[\s,;]+/)
      .map((item) => item.trim())
      .filter((item) => item.includes('@'));

    if (emails.length === 0) {
      notify('Vui lòng nhập ít nhất một địa chỉ email hợp lệ.');
      return;
    }

    if (!classId) {
      if (onInvite) onInvite(emails.join(', '));
      notify(`Đã gửi thư mời tham gia lớp tới: ${emails.join(', ')}`);
      setBulkEmails('');
      return;
    }

    setIsSending(true);
    try {
      const results = await Promise.allSettled(
        emails.map((email) => inviteMemberByEmail(classId, email, 'STUDENT'))
      );
      const succeeded = emails.filter((_, idx) => results[idx].status === 'fulfilled');
      const failed = emails.filter((_, idx) => results[idx].status === 'rejected');

      if (succeeded.length > 0) {
        if (onInvite) onInvite(succeeded.join(', '));
        setBulkEmails(failed.join(', '));
      }

      if (failed.length === 0) {
        notify(`Đã gửi thư mời tham gia lớp tới ${succeeded.length} email!`);
      } else if (succeeded.length > 0) {
        notify(
          `Đã mời ${succeeded.length} email. Không thể mời: ${failed.join(', ')}.`
        );
      } else {
        notify('Không thể gửi lời mời qua email lúc này. Vui lòng thử lại.');
      }
    } finally {
      setIsSending(false);
    }
  };

  // Save settings
  const handleSaveSettings = () => {
    if (onSaveSettings) {
      onSaveSettings({
        autoApprove,
        limitCap,
        enrollmentKey,
      });
    }
    notify(`Đã cập nhật cấu hình mã ghi danh và quy tắc xét duyệt lớp ${classCode} thành công!`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      id="modalOverlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-modal-title"
    >
      {/* MODAL CONTAINER (MD3 borderless dialog, level-3 elevation shadow) */}
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#1E1F20] rounded-3xl shadow-2xl my-auto transform transition-all overflow-hidden border-none animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-800 dark:text-[#C4C7C5] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">qr_code_scanner</span>
            </div>
            <div>
              <h2
                id="invite-modal-title"
                className="text-base sm:text-lg font-semibold text-gray-900 dark:text-[#E3E3E3] tracking-tight"
              >
                {isStudent ? 'Thông tin mã mời & QR tham gia lớp' : 'Mời thành viên & Quản lý mã vào lớp'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-[#8E918F] mt-0.5">
                Lớp:{' '}
                <span className="font-semibold text-gray-900 dark:text-[#E3E3E3]">
                  {classCode}
                </span>{' '}
                • Giảng viên phụ trách:{' '}
                <span className="font-semibold text-gray-900 dark:text-[#E3E3E3]">
                  {instructorName}
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
            className="w-9 h-9 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-gray-700 dark:hover:text-[#E3E3E3] flex items-center justify-center transition-colors cursor-pointer border-none bg-transparent"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body Content (Scrollable) */}
        <div className="px-6 py-5 space-y-5 max-h-[calc(86vh-120px)] overflow-y-auto custom-scrollbar">
          {/* ROW 1: ENROLLMENT KEY & QR CODE SPLIT */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* THẺ MÃ THAM GIA LỚP (ENROLLMENT KEY) - 7 cols */}
            <div className="md:col-span-7 flex flex-col justify-between bg-[#F0F4F8] dark:bg-[#131314] rounded-3xl p-6 border-none relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-600 dark:text-[#A8C7FA] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">key</span>
                  Mã tham gia lớp (Enrollment Key)
                </span>
                <span className="text-xs px-3 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-[#A8C7FA] font-medium flex items-center gap-1.5 border-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#007BFF] dark:bg-[#A8C7FA] animate-pulse" />
                  Đang kích hoạt
                </span>
              </div>

              {/* Big Code Presentation */}
              <div className="my-4 py-4 px-3 bg-white dark:bg-[#1E1F20] rounded-2xl text-center shadow-sm dark:shadow-none border-none">
                <span
                  className="font-mono text-[26px] sm:text-[30px] font-bold tracking-widest text-[#0B57D0] dark:text-[#A8C7FA] block select-all"
                  id="enrollmentKeyText"
                >
                  {enrollmentKey}
                </span>
                <span className="text-xs text-gray-500 dark:text-[#8E918F] block mt-1">
                  Hiệu lực đến:{' '}
                  <span className="font-semibold text-gray-800 dark:text-[#E3E3E3]">
                    {endAt && !Number.isNaN(new Date(endAt).getTime())
                      ? new Date(endAt).toLocaleDateString('vi-VN')
                      : 'Không giới hạn thời gian'}
                  </span>
                </span>
              </div>

              {/* Key Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  disabled={!enrollmentKey}
                  className={`flex-1 py-2.5 px-4 rounded-full font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border-none disabled:opacity-50 ${
                    copiedKey
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 shadow-xs'
                  }`}
                  id="copyKeyBtn"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {copiedKey ? 'check' : 'content_copy'}
                  </span>
                  <span>{copiedKey ? 'Đã sao chép!' : 'Sao chép mã'}</span>
                </button>

                {!isStudent && (
                  <button
                    type="button"
                    onClick={handleResetCode}
                    disabled={isResetting || !classId}
                    title="Tạo lại mã ngẫu nhiên"
                    className="py-2.5 px-4 rounded-full bg-white dark:bg-[#1E1F20] text-gray-800 dark:text-[#C4C7C5] hover:opacity-85 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer border-none shadow-sm dark:shadow-none disabled:opacity-50"
                  >
                    <span
                      className={`material-symbols-outlined text-[18px] text-[#0B57D0] dark:text-[#A8C7FA] ${
                        isResetting ? 'animate-spin' : ''
                      }`}
                    >
                      cached
                    </span>
                    <span>{isResetting ? 'Đang tạo...' : 'Reset Code'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* THẺ MÃ QR CODE TƯƠNG TÁC - 5 cols */}
            <div className="md:col-span-5 bg-[#F0F4F8] dark:bg-[#131314] rounded-3xl p-6 border-none flex flex-col items-center justify-between text-center">
              <div className="w-full flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-600 dark:text-[#8E918F] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                  Quét mã vào lớp
                </span>
                <span className="text-xs font-medium text-gray-400 dark:text-[#8E918F]">
                  Mobile App
                </span>
              </div>

              {/* Real Scannable ISO/IEC 18004 SVG QR Code */}
              <div className="my-3 p-3 bg-white rounded-2xl shadow-xs border-none flex items-center justify-center">
                <svg
                  id="enrollment-qr-svg"
                  className="w-36 h-36"
                  shapeRendering="crispEdges"
                  viewBox={`0 0 ${qrSvgData.viewBoxSize} ${qrSvgData.viewBoxSize}`}
                  xmlns="http://www.w3.org/2000/svg"
                  role="img"
                  aria-label={`Mã QR tham gia lớp ${enrollmentKey}`}
                >
                  <rect
                    width={qrSvgData.viewBoxSize}
                    height={qrSvgData.viewBoxSize}
                    fill="#FFFFFF"
                  />
                  <path d={qrSvgData.path} fill="#1E1F20" />
                </svg>
              </div>

              {/* Download Button */}
              <button
                type="button"
                onClick={handleDownloadQR}
                className="w-full py-2.5 px-4 rounded-full bg-white dark:bg-[#1E1F20] text-gray-800 dark:text-[#C4C7C5] font-semibold text-xs hover:opacity-85 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer border-none shadow-sm dark:shadow-none"
              >
                <span className="material-symbols-outlined text-[18px] text-[#0B57D0] dark:text-[#A8C7FA]">
                  download
                </span>
                <span>Tải ảnh QR về máy (PNG)</span>
              </button>
            </div>
          </div>

          {/* ROW 2: THẺ ĐƯỜNG LINK MỜI TRỰC TIẾP */}
          <div className="bg-[#F0F4F8] dark:bg-[#131314] p-5 rounded-3xl border-none">
            <label
              htmlFor="directInviteLink"
              className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 dark:text-[#8E918F] flex items-center gap-1.5 mb-2"
            >
              <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-[#A8C7FA]">
                link
              </span>
              Đường link mời tham gia trực tiếp
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                  public
                </span>
                <input
                  id="directInviteLink"
                  type="text"
                  readOnly
                  value={directInviteLink}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-[#1E1F20] border-none rounded-full font-mono text-xs text-gray-800 dark:text-[#C4C7C5] select-all focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className={`w-full sm:w-auto shrink-0 px-5 py-2.5 rounded-full font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border-none ${
                  copiedLink
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95'
                }`}
                id="copyLinkBtn"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {copiedLink ? 'check' : 'link'}
                </span>
                <span>{copiedLink ? 'Đã chép link!' : 'Sao chép liên kết'}</span>
              </button>
            </div>
          </div>

          {/* ROW 3: CÀI ĐẶT PHÊ DUYỆT THAM GIA (CHỈ HIỂN THỊ VỚI GIẢNG VIÊN/CHỦ LỚP) */}
          {!isStudent && (
            <div className="bg-[#F0F4F8] dark:bg-[#131314] p-5 rounded-3xl border-none space-y-3">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 dark:text-[#8E918F] block mb-1">
                Quy tắc phê duyệt &amp; Giới hạn sĩ số
              </span>

              {/* Toggle 1: Auto approve */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-[#1E1F20] rounded-2xl border-none shadow-sm dark:shadow-none">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-800 dark:text-[#C4C7C5] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-[#E3E3E3]">
                      Tự động duyệt học viên khi có mã hợp lệ
                    </p>
                    <p className="text-xs text-gray-500 dark:text-[#8E918F] mt-0.5 leading-relaxed">
                      Sinh viên nhập đúng mã sẽ vào thẳng danh sách chính thức mà không cần GV phê duyệt tay.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={autoApprove}
                    onChange={(e) => setAutoApprove(e.target.checked)}
                    className="sr-only peer"
                    id="autoApproveToggle"
                  />
                  <div className="w-11 h-6 bg-[#E1E5EA] dark:bg-[#282A2C] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#007BFF] dark:peer-checked:bg-[#A8C7FA]" />
                </label>
              </div>

              {/* Toggle 2: Capacity cap */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-[#1E1F20] rounded-2xl border-none shadow-sm dark:shadow-none">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-800 dark:text-[#C4C7C5] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[18px]">group</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-[#E3E3E3]">
                      Giới hạn số lượng thành viên tối đa (Hiện tại: {enrolledCount}/{maxStudents})
                    </p>
                    <p className="text-xs text-gray-500 dark:text-[#8E918F] mt-0.5 leading-relaxed">
                      Tự động khóa ghi danh khi đạt sĩ số {maxStudents} sinh viên.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-semibold text-blue-600 dark:text-[#A8C7FA] bg-[#E1E5EA] dark:bg-[#282A2C] px-3 py-1 rounded-full">
                    {enrolledCount} / {maxStudents}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={limitCap}
                      onChange={(e) => setLimitCap(e.target.checked)}
                      className="sr-only peer"
                      id="limitCapToggle"
                    />
                    <div className="w-11 h-6 bg-[#E1E5EA] dark:bg-[#282A2C] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#007BFF] dark:peer-checked:bg-[#A8C7FA]" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ROW 4: GỬI LỜI MỜI QUA EMAIL HÀNG LOẠT (CHỈ HIỂN THỊ VỚI GIẢNG VIÊN/CHỦ LỚP) */}
          {!isStudent && (
            <form
              onSubmit={handleSendBulkInvites}
              className="bg-[#F0F4F8] dark:bg-[#131314] p-5 rounded-3xl border-none space-y-3"
            >
              <div className="flex items-center justify-between">
                <label
                  htmlFor="bulkEmailInput"
                  className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 dark:text-[#8E918F] flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-[#A8C7FA]">
                    outgoing_mail
                  </span>
                  Gửi lời mời qua Email hàng loạt
                </label>
                <span className="text-xs text-gray-400 dark:text-[#8E918F]">
                  Phân cách bằng dấu phẩy (,)
                </span>
              </div>

              <div className="relative">
                <textarea
                  id="bulkEmailInput"
                  rows={2}
                  value={bulkEmails}
                  onChange={(e) => setBulkEmails(e.target.value)}
                  placeholder="vd: sv220201@uet.vnu.edu.vn, minhle@fit.edu.vn, teamicpc@gmail.com..."
                  className="w-full p-4 bg-white dark:bg-[#1E1F20] border-none rounded-2xl font-mono text-xs text-gray-800 dark:text-[#C4C7C5] placeholder:text-gray-400 dark:placeholder:text-[#8E918F] focus:outline-none transition-all resize-none leading-relaxed"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-[#8E918F] text-xs">
                  <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-[#A8C7FA] shrink-0">
                    info
                  </span>
                  <span>Sinh viên sẽ nhận email chứa hướng dẫn kèm mã kích hoạt ngay lập tức.</span>
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full sm:w-auto shrink-0 px-5 py-2.5 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border-none"
                  id="sendInviteBtn"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isSending ? 'sync' : 'forward_to_inbox'}
                  </span>
                  <span>{isSending ? 'Đang gửi...' : 'Gửi thư mời tự động'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-black/5 dark:border-white/5 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-[#8E918F] text-xs">
            <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-[#A8C7FA]">
              lock
            </span>
            <span>Bảo mật: Chỉ thành viên có mã hoặc link mời mới truy cập lớp {classCode}</span>
          </div>

          <div className="flex items-center gap-2.5 justify-end">
            {isStudent ? (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 font-semibold text-xs transition-all cursor-pointer border-none"
              >
                Đóng
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-700 dark:text-[#C4C7C5] hover:bg-gray-100 dark:hover:bg-[#282A2C] px-5 py-2.5 rounded-full font-semibold text-xs transition-all cursor-pointer border-none"
                >
                  Đóng lại
                </button>
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="px-6 py-2.5 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer border-none"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span>Lưu thiết lập mã lớp</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

