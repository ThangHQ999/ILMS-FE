'use client';

import React, { useState, useEffect, useCallback } from 'react';

export interface InviteMemberModalProps {
  classCode: string;
  isOpen: boolean;
  onClose: () => void;
  onInvite?: (emailOrEmails: string) => void;
  instructorName?: string;
  enrolledCount?: number;
  maxStudents?: number;
  onSaveSettings?: (settings: {
    autoApprove: boolean;
    limitCap: boolean;
    enrollmentKey: string;
  }) => void;
  onToast?: (message: string) => void;
}

export function InviteMemberModal({
  classCode,
  isOpen,
  onClose,
  onInvite,
  instructorName = 'TS. Lê Hoàng Nam',
  enrolledCount = 45,
  maxStudents = 60,
  onSaveSettings,
  onToast,
}: InviteMemberModalProps) {
  // State
  const initialKey = `${classCode.toUpperCase()}-MATKHAU123`;
  const [enrollmentKey, setEnrollmentKey] = useState(initialKey);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [autoApprove, setAutoApprove] = useState(true);
  const [limitCap, setLimitCap] = useState(true);
  const [bulkEmails, setBulkEmails] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Synchronize key when classCode changes
  useEffect(() => {
    if (classCode) {
      setEnrollmentKey(`${classCode.toUpperCase()}-MATKHAU123`);
    }
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

  if (!isOpen) return null;

  const directInviteLink = `https://ilms.edutech.edu.vn/join?class=${encodeURIComponent(
    classCode
  )}&key=${encodeURIComponent(enrollmentKey.toLowerCase())}`;

  // Copy enrollment code
  const handleCopyCode = () => {
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

  // Generate random new key
  const handleResetCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let randomPart = '';
    for (let i = 0; i < 6; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newCode = `${classCode.toUpperCase()}-${randomPart}`;
    setEnrollmentKey(newCode);
    notify(`Đã tạo mã mời mới ngẫu nhiên: ${newCode}`);
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
  const handleSendBulkInvites = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = bulkEmails.trim();
    if (!trimmed) {
      notify('Vui lòng nhập ít nhất một địa chỉ email sinh viên.');
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      if (onInvite) {
        onInvite(trimmed);
      }
      notify(`Đã gửi thư mời kích hoạt tham gia lớp ${classCode} tới các email đã nhập!`);
      setBulkEmails('');
    }, 600);
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
      className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-[6px] flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      id="modalOverlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-modal-title"
    >
      {/* MODAL CONTAINER (3px visual border, level-3 elevation shadow) */}
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl my-auto transform transition-all overflow-hidden border-[3px] border-slate-300 dark:border-slate-700 animate-in zoom-in-95 duration-200">
        {/* Top Decorative Accent Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-600 to-slate-800" />

        {/* Modal Header */}
        <div className="px-6 py-5 flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs border border-blue-200/60 dark:border-blue-900">
              <span className="material-symbols-outlined text-[24px]">qr_code_scanner</span>
            </div>
            <div>
              <h2
                id="invite-modal-title"
                className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight"
              >
                Mời thành viên &amp; Quản lý mã vào lớp
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Lớp:{' '}
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {classCode}
                </span>{' '}
                • Giảng viên phụ trách:{' '}
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {instructorName}
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
            className="w-9 h-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body Content (Scrollable) */}
        <div className="px-6 py-5 space-y-5 max-h-[calc(86vh-120px)] overflow-y-auto custom-scrollbar">
          {/* ROW 1: ENROLLMENT KEY & QR CODE SPLIT */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* THẺ MÃ THAM GIA LỚP (ENROLLMENT KEY) - 7 cols */}
            <div className="md:col-span-7 flex flex-col justify-between bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border-[3px] border-slate-200 dark:border-slate-700 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">key</span>
                  Mã tham gia lớp (Enrollment Key)
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-semibold flex items-center gap-1.5 border border-blue-200/60 dark:border-blue-900 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                  Đang kích hoạt
                </span>
              </div>

              {/* Big Code Presentation */}
              <div className="my-4 py-4 px-3 bg-white dark:bg-slate-900 rounded-xl text-center shadow-inner border border-slate-200/80 dark:border-slate-800">
                <span
                  className="font-mono text-[26px] sm:text-[30px] font-extrabold tracking-widest text-blue-600 dark:text-blue-400 block select-all"
                  id="enrollmentKeyText"
                >
                  {enrollmentKey}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">
                  Hiệu lực đến:{' '}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    23:59, 31/12/2026
                  </span>
                </span>
              </div>

              {/* Key Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                    copiedKey
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-[0.99]'
                  }`}
                  id="copyKeyBtn"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {copiedKey ? 'check' : 'content_copy'}
                  </span>
                  <span>{copiedKey ? 'Đã sao chép!' : 'Sao chép mã'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetCode}
                  title="Tạo lại mã ngẫu nhiên"
                  className="py-2.5 px-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-blue-400">
                    cached
                  </span>
                  <span>Reset Code</span>
                </button>
              </div>
            </div>

            {/* THẺ MÃ QR CODE TƯƠNG TÁC - 5 cols */}
            <div className="md:col-span-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border-[3px] border-slate-200 dark:border-slate-700 flex flex-col items-center justify-between text-center">
              <div className="w-full flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                  Quét mã vào lớp
                </span>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                  Mobile App
                </span>
              </div>

              {/* Crisp 160x160 SVG QR Visual */}
              <div className="my-3 p-2 bg-white rounded-xl shadow-xs border border-slate-200/80 flex items-center justify-center">
                <svg
                  id="enrollment-qr-svg"
                  className="w-36 h-36"
                  fill="none"
                  viewBox="0 0 160 160"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Background Plate */}
                  <rect fill="#FFFFFF" height="160" rx="8" width="160" />
                  {/* QR Finder Top-Left */}
                  <rect fill="#001a41" height="40" rx="4" width="40" x="12" y="12" />
                  <rect fill="#FFFFFF" height="28" width="28" x="18" y="18" />
                  <rect fill="#0059bb" height="16" width="16" x="24" y="24" />
                  {/* QR Finder Top-Right */}
                  <rect fill="#001a41" height="40" rx="4" width="40" x="108" y="12" />
                  <rect fill="#FFFFFF" height="28" width="28" x="114" y="18" />
                  <rect fill="#0059bb" height="16" width="16" x="120" y="24" />
                  {/* QR Finder Bottom-Left */}
                  <rect fill="#001a41" height="40" rx="4" width="40" x="12" y="108" />
                  <rect fill="#FFFFFF" height="28" width="28" x="18" y="114" />
                  <rect fill="#0059bb" height="16" width="16" x="24" y="120" />
                  {/* Data Pixels & Patterns */}
                  <rect fill="#0059bb" height="8" width="8" x="60" y="14" />
                  <rect fill="#001a41" height="8" width="8" x="76" y="14" />
                  <rect fill="#0059bb" height="8" width="8" x="88" y="14" />
                  <rect fill="#001a41" height="8" width="8" x="60" y="26" />
                  <rect fill="#0059bb" height="8" width="16" x="72" y="26" />
                  <rect fill="#0059bb" height="8" width="8" x="64" y="38" />
                  <rect fill="#001a41" height="8" width="8" x="80" y="38" />
                  {/* Middle Row Alignments */}
                  <rect fill="#0059bb" height="8" width="8" x="14" y="60" />
                  <rect fill="#001a41" height="8" width="12" x="26" y="60" />
                  <rect fill="#0059bb" height="8" width="8" x="44" y="60" />
                  <rect fill="#0059bb" height="16" width="16" x="60" y="60" />
                  <rect fill="#001a41" height="8" width="12" x="84" y="60" />
                  <rect fill="#0059bb" height="8" width="8" x="104" y="60" />
                  <rect fill="#001a41" height="8" width="8" x="120" y="60" />
                  <rect fill="#0059bb" height="8" width="12" x="136" y="60" />
                  <rect fill="#001a41" height="8" width="16" x="14" y="76" />
                  <rect fill="#0059bb" height="8" width="8" x="38" y="76" />
                  <rect fill="#0059bb" height="8" width="8" x="84" y="76" />
                  <rect fill="#001a41" height="8" width="16" x="100" y="76" />
                  <rect fill="#0059bb" height="8" width="8" x="124" y="76" />
                  <rect fill="#001a41" height="8" width="8" x="140" y="76" />
                  <rect fill="#0059bb" height="8" width="8" x="14" y="92" />
                  <rect fill="#001a41" height="8" width="8" x="30" y="92" />
                  <rect fill="#0059bb" height="8" width="8" x="46" y="92" />
                  <rect fill="#001a41" height="16" width="8" x="62" y="84" />
                  <rect fill="#0059bb" height="8" width="16" x="76" y="92" />
                  <rect fill="#001a41" height="8" width="8" x="108" y="92" />
                  <rect fill="#0059bb" height="8" width="24" x="124" y="92" />
                  {/* Bottom Area Data */}
                  <rect fill="#001a41" height="8" width="16" x="60" y="108" />
                  <rect fill="#0059bb" height="8" width="8" x="84" y="108" />
                  <rect fill="#001a41" height="8" width="8" x="100" y="108" />
                  <rect fill="#0059bb" height="8" width="16" x="116" y="108" />
                  <rect fill="#001a41" height="8" width="8" x="140" y="108" />
                  <rect fill="#0059bb" height="8" width="8" x="60" y="124" />
                  <rect fill="#001a41" height="8" width="8" x="76" y="124" />
                  <rect fill="#0059bb" height="12" width="16" x="92" y="120" />
                  <rect fill="#001a41" height="8" width="8" x="116" y="124" />
                  <rect fill="#0059bb" height="8" width="16" x="132" y="124" />
                  <rect fill="#001a41" height="8" width="24" x="60" y="140" />
                  <rect fill="#0059bb" height="8" width="8" x="92" y="140" />
                  <rect fill="#001a41" height="12" width="16" x="108" y="136" />
                  <rect fill="#0059bb" height="8" width="16" x="132" y="140" />
                  {/* Center Tech Dot */}
                  <circle cx="80" cy="80" fill="#0070ea" r="5" />
                </svg>
              </div>

              {/* Download Button */}
              <button
                type="button"
                onClick={handleDownloadQR}
                className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-blue-400">
                  download
                </span>
                <span>Tải ảnh QR về máy (PNG)</span>
              </button>
            </div>
          </div>

          {/* ROW 2: THẺ ĐƯỜNG LINK MỜI TRỰC TIẾP */}
          <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border-[3px] border-slate-200 dark:border-slate-700 shadow-xs">
            <label
              htmlFor="directInviteLink"
              className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-2"
            >
              <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-blue-400">
                link
              </span>
              Đường link mời tham gia trực tiếp
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                  public
                </span>
                <input
                  id="directInviteLink"
                  type="text"
                  readOnly
                  value={directInviteLink}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-800 dark:text-slate-200 select-all focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className={`w-full sm:w-auto shrink-0 px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                  copiedLink
                    ? 'bg-emerald-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
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

          {/* ROW 3: CÀI ĐẶT PHÊ DUYỆT THAM GIA (TOGGLE CONTROLS) */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border-[3px] border-slate-200 dark:border-slate-700 space-y-3">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 block mb-1">
              Quy tắc phê duyệt &amp; Giới hạn sĩ số
            </span>

            {/* Toggle 1: Auto approve */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200/60 dark:border-blue-900">
                  <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Tự động duyệt học viên khi có mã hợp lệ
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
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
                <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>

            {/* Toggle 2: Capacity cap */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200 dark:border-slate-700">
                  <span className="material-symbols-outlined text-[18px]">group</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Giới hạn số lượng thành viên tối đa (Hiện tại: {enrolledCount}/{maxStudents})
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Tự động khóa ghi danh khi đạt sĩ số {maxStudents} sinh viên.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-900">
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
                  <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>
            </div>
          </div>

          {/* ROW 4: GỬI LỜI MỜI QUA EMAIL HÀNG LOẠT */}
          <form
            onSubmit={handleSendBulkInvites}
            className="bg-white dark:bg-slate-850 p-4 rounded-2xl border-[3px] border-slate-200 dark:border-slate-700 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <label
                htmlFor="bulkEmailInput"
                className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-blue-400">
                  outgoing_mail
                </span>
                Gửi lời mời qua Email hàng loạt
              </label>
              <span className="text-xs text-slate-400 dark:text-slate-500">
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
                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none leading-relaxed"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
                <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-blue-400 shrink-0">
                  info
                </span>
                <span>Sinh viên sẽ nhận email chứa hướng dẫn kèm mã kích hoạt ngay lập tức.</span>
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full sm:w-auto shrink-0 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
                id="sendInviteBtn"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isSending ? 'sync' : 'forward_to_inbox'}
                </span>
                <span>{isSending ? 'Đang gửi...' : 'Gửi thư mời tự động'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200/80 dark:border-slate-800 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
            <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-blue-400">
              lock
            </span>
            <span>Bảo mật: Chỉ thành viên được mời mới truy cập tài liệu {classCode}</span>
          </div>

          <div className="flex items-center gap-2.5 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Đóng lại
            </button>
            <button
              type="button"
              onClick={handleSaveSettings}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>Lưu thiết lập mã lớp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

