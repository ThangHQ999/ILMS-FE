'use client';

import React, { useState, useRef } from 'react';
import type { StudioQuestionItem, StudioOptionItem } from './TeacherCreateQuizStudioView';

interface ImportWordExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportQuestions: (questions: StudioQuestionItem[]) => void;
  currentQuestionsCount: number;
  subjectName?: string;
  subjectCode?: string;
}

export function ImportWordExcelModal({
  isOpen,
  onClose,
  onImportQuestions,
  currentQuestionsCount,
  subjectName = 'Mạng máy tính & Truyền thông',
  subjectCode = 'CS-202',
}: ImportWordExcelModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Uploaded file state
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: string;
    questionCount: number;
  } | null>({
    name: 'De_thi_trac_nghiem_Chuong4_BGP.docx',
    size: '1.8 MB',
    questionCount: 15,
  });

  // Upload progress simulation
  const [progress, setProgress] = useState<number>(100);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [showDetailPreview, setShowDetailPreview] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

  if (!isOpen) return null;

  // Handle file select or drop
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    processUploadedFile(file.name, file.size);
  };

  const processUploadedFile = (fileName: string, fileSize: number) => {
    setIsProcessing(true);
    setProgress(30);

    setTimeout(() => {
      setProgress(75);
      setTimeout(() => {
        setProgress(100);
        setIsProcessing(false);
        setUploadedFile({
          name: fileName,
          size: `${(fileSize / (1024 * 1024)).toFixed(1)} MB`,
          questionCount: 15,
        });
      }, 400);
    }, 400);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file.name, file.size);
    }
  };

  // Download Sample Word Template
  const handleDownloadWordTemplate = (e: React.MouseEvent) => {
    e.preventDefault();
    const content = `CẤU TRÚC ĐỀ THI TRẮC NGHIỆM CHUẨN ILMS (.DOCX / TEXT)
Môn học: ${subjectName} (${subjectCode})

[HƯỚNG DẪN SOẠN THẢO]
- Mỗi câu hỏi bắt đầu bằng "Câu X:" hoặc "Question X:".
- Các phương án A, B, C, D trên từng dòng.
- Đáp án đúng được đánh dấu bằng dấu sao (*) phía trước phương án hoặc ghi "Đáp án: [A/B/C/D]".
- Mức độ Bloom có thể ghi trong ngoặc vuông: [Nhận biết], [Thông hiểu], [Vận dụng], [Vận dụng cao].
- Phần "Giải thích:" hoặc "Lời giải:" đặt ở cuối câu hỏi.

---
Câu 1: [Thông hiểu] Giao thức BGP sử dụng cổng TCP nào để thiết lập phiên kết nối láng giềng?
A. Cổng 80
*B. Cổng 179
C. Cổng 53
D. Cổng 443
Giải thích: BGP dùng TCP port 179 để đảm bảo độ tin cậy trong truyền nhận bảng định tuyến.

Câu 2: [Vận dụng cao] Giả sử mạng gặp sự cố đứt cáp, cơ chế nào sau đây giúp điều phối dòng lưu lượng eBGP ingress hiệu quả?
A. Tăng Local Preference
*B. Áp dụng AS-Path Prepending
C. Cấu hình Weight nội bộ
D. Thiết lập MED = 0
Giải thích: AS-Path Prepending giúp kéo dài chuỗi AS nhằm định tuyến lưu lượng vào kênh dự phòng.
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mau_cau_hoi_Word_${subjectCode}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download Sample Excel Template
  const handleDownloadExcelTemplate = (e: React.MouseEvent) => {
    e.preventDefault();
    const headers = [
      'STT',
      'Nội dung câu hỏi',
      'Phương án A',
      'Phương án B',
      'Phương án C',
      'Phương án D',
      'Đáp án đúng',
      'Mức độ Bloom',
      'Điểm',
      'Giải thích đáp án',
    ];

    const rows = [
      [
        '1',
        'Giao thức định tuyến nào thuộc nhóm Path Vector Protocol?',
        'OSPF',
        'RIPv2',
        'BGP',
        'IS-IS',
        'C',
        'Thông hiểu',
        '1.0',
        'BGP là giao thức định tuyến liên vùng thuộc kiến trúc Path Vector.',
      ],
      [
        '2',
        'Đơn vị dữ liệu (PDU) tại Tầng Mạng là gì?',
        'Frame',
        'Packet',
        'Segment',
        'Bit',
        'B',
        'Nhận biết',
        '1.0',
        'Tầng Mạng truyền tải các Packet (Gói tin).',
      ],
      [
        '3',
        'Trong thuật toán Dijkstra, cấu trúc dữ liệu nào thường dùng để tìm đỉnh có nhãn nhỏ nhất nhanh nhất?',
        'Hàng đợi ưu tiên (Min-Heap)',
        'Ngăn xếp (Stack)',
        'Mảng tuyến tính',
        'Cây nhị phân thuần',
        'A',
        'Vận dụng',
        '1.0',
        'Min-Heap cho phép lấy min trong O(1) và cập nhật trong O(log V).',
      ],
    ];

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mau_ma_tran_Excel_${subjectCode}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Generate 15 parsed questions
  const generate15ParsedQuestions = (): StudioQuestionItem[] => {
    const rawBank = [
      {
        content: 'BGP (Border Gateway Protocol) hoạt động dựa trên thuật toán định tuyến nào sau đây?',
        options: [
          { label: 'A' as const, text: 'Link-state algorithm', isCorrect: false },
          { label: 'B' as const, text: 'Path-vector algorithm', isCorrect: true },
          { label: 'C' as const, text: 'Distance-vector thuần túy', isCorrect: false },
          { label: 'D' as const, text: 'Bellman-Ford cải tiến', isCorrect: false },
        ],
        explanation: 'BGP sử dụng Path-vector algorithm nhằm tránh vòng lặp định tuyến (Routing Loop) trên phạm vi toàn cầu.',
        bloomLevel: 'Thông hiểu • Bloom 2',
        difficultyLevel: 'MEDIUM' as const,
      },
      {
        content: 'Cổng TCP mặc định được BGP sử dụng để thiết lập phiên ngang hàng peer là cổng số mấy?',
        options: [
          { label: 'A' as const, text: 'TCP 80', isCorrect: false },
          { label: 'B' as const, text: 'TCP 179', isCorrect: true },
          { label: 'C' as const, text: 'TCP 520', isCorrect: false },
          { label: 'D' as const, text: 'TCP 161', isCorrect: false },
        ],
        explanation: 'BGP thiết lập kết nối TCP tin cậy trên cổng 179.',
        bloomLevel: 'Nhận biết • Bloom 1',
        difficultyLevel: 'EASY' as const,
      },
      {
        content: 'Khi hai router eBGP kết nối trực tiếp, giá trị TTL mặc định của các gói tin BGP là bao nhiêu?',
        options: [
          { label: 'A' as const, text: 'TTL = 1', isCorrect: true },
          { label: 'B' as const, text: 'TTL = 64', isCorrect: false },
          { label: 'C' as const, text: 'TTL = 255', isCorrect: false },
          { label: 'D' as const, text: 'TTL = 32', isCorrect: false },
        ],
        explanation: 'Mặc định eBGP peer có TTL = 1, nếu muốn kết nối đa chặng phải cấu hình ebgp-multihop.',
        bloomLevel: 'Thông hiểu • Bloom 2',
        difficultyLevel: 'MEDIUM' as const,
      },
      {
        content: 'Thuộc tính nào của BGP có phạm vi chỉ có ý nghĩa trong nội bộ một Autonomous System (AS)?',
        options: [
          { label: 'A' as const, text: 'AS-Path', isCorrect: false },
          { label: 'B' as const, text: 'Next-Hop', isCorrect: false },
          { label: 'C' as const, text: 'Local Preference', isCorrect: true },
          { label: 'D' as const, text: 'Atomic Aggregate', isCorrect: false },
        ],
        explanation: 'Local Preference được truyền trong iBGP nhưng không bao giờ truyền qua eBGP sang AS khác.',
        bloomLevel: 'Thông hiểu • Bloom 2',
        difficultyLevel: 'MEDIUM' as const,
      },
      {
        content: 'Trong quy trình chọn đường đi tốt nhất của BGP (BGP Best Path Selection), tiêu chí nào được xét đầu tiên?',
        options: [
          { label: 'A' as const, text: 'Local Preference cao nhất', isCorrect: false },
          { label: 'B' as const, text: 'Weight cao nhất (trên router Cisco)', isCorrect: true },
          { label: 'C' as const, text: 'AS-Path ngắn nhất', isCorrect: false },
          { label: 'D' as const, text: 'Origin Code thấp nhất', isCorrect: false },
        ],
        explanation: 'Weight cao nhất là tiêu chí nội bộ đầu tiên của thiết bị Cisco trước khi xét đến Local Preference.',
        bloomLevel: 'Vận dụng • Bloom 3',
        difficultyLevel: 'MEDIUM' as const,
      },
      {
        content: 'Kỹ thuật nào sau đây được sử dụng để phân phối thông điệp định tuyến BGP mà không cần cấu hình full-mesh iBGP?',
        options: [
          { label: 'A' as const, text: 'Route Reflector & BGP Confederation', isCorrect: true },
          { label: 'B' as const, text: 'Split Horizon & Poison Reverse', isCorrect: false },
          { label: 'C' as const, text: 'Static Route Redundancy', isCorrect: false },
          { label: 'D' as const, text: 'OSPF Virtual Link', isCorrect: false },
        ],
        explanation: 'Route Reflector và Confederation giải quyết bài toán scale của iBGP full-mesh.',
        bloomLevel: 'Vận dụng cao • Bloom 4',
        difficultyLevel: 'HARD' as const,
      },
      {
        content: 'Giao thức nào cung cấp tính năng gán nhãn chuyển tiếp gói tin nhanh ở tầng 2.5?',
        options: [
          { label: 'A' as const, text: 'MPLS (Multi-Protocol Label Switching)', isCorrect: true },
          { label: 'B' as const, text: 'BGP-4', isCorrect: false },
          { label: 'C' as const, text: 'VLAN Trunking 802.1Q', isCorrect: false },
          { label: 'D' as const, text: 'GRE Tunnel', isCorrect: false },
        ],
        explanation: 'MPLS dùng nhãn shim 32 bit giữa L2 và L3 để định tuyến nhanh (Label Switching).',
        bloomLevel: 'Nhận biết • Bloom 1',
        difficultyLevel: 'EASY' as const,
      },
      {
        content: 'Địa chỉ IPv6 có tổng cộng bao nhiêu bit và được biểu diễn dưới hệ cơ số nào?',
        options: [
          { label: 'A' as const, text: '32 bit, hệ thập phân chấm', isCorrect: false },
          { label: 'B' as const, text: '64 bit, hệ nhị phân thuần', isCorrect: false },
          { label: 'C' as const, text: '128 bit, 8 nhóm số thập lục phân (Hex)', isCorrect: true },
          { label: 'D' as const, text: '256 bit, hệ mã hóa Base64', isCorrect: false },
        ],
        explanation: 'IPv6 dài 128 bit, biểu diễn bằng 8 cụm 4 chữ số Hex cách nhau bằng dấu hai chấm.',
        bloomLevel: 'Nhận biết • Bloom 1',
        difficultyLevel: 'EASY' as const,
      },
      {
        content: 'Cơ chế phát hiện vòng lặp định tuyến của BGP hoạt động nhờ thuộc tính nào?',
        options: [
          { label: 'A' as const, text: 'Nếu router thấy số ASN của mình nằm trong thuộc tính AS_PATH', isCorrect: true },
          { label: 'B' as const, text: 'Đếm số hop count vượt quá 15', isCorrect: false },
          { label: 'C' as const, text: 'Gửi gói tin ICMP Time Exceeded', isCorrect: false },
          { label: 'D' as const, text: 'Kiểm tra checksum trong header gói tin', isCorrect: false },
        ],
        explanation: 'Khi nhận BGP Update từ eBGP, nếu AS_PATH có chứa ASN của router thì gói tin lập tức bị hủy bỏ để chống vòng lặp.',
        bloomLevel: 'Thông hiểu • Bloom 2',
        difficultyLevel: 'MEDIUM' as const,
      },
      {
        content: 'Kỹ thuật NAT64 kết hợp DNS64 nhằm mục đích chính là gì?',
        options: [
          { label: 'A' as const, text: 'Cho phép máy khách chỉ có IPv6 truy cập tài nguyên máy chủ chỉ có IPv4', isCorrect: true },
          { label: 'B' as const, text: 'Tự động cấp phát địa chỉ IP qua DHCPv6', isCorrect: false },
          { label: 'C' as const, text: 'Mã hóa gói tin IPv6 qua IPSec', isCorrect: false },
          { label: 'D' as const, text: 'Nén header IPv6 để tiết kiệm băng thông', isCorrect: false },
        ],
        explanation: 'DNS64 tổng hợp AAAA record giả lập từ A record và NAT64 dịch gói IPv6 sang IPv4.',
        bloomLevel: 'Vận dụng • Bloom 3',
        difficultyLevel: 'MEDIUM' as const,
      },
      {
        content: 'Trong BGP, thuộc tính MED (Multi-Exit Discriminator) được sử dụng để làm gì?',
        options: [
          { label: 'A' as const, text: 'Gợi ý cho AS láng giềng chọn cổng ingress đi vào AS của mình', isCorrect: true },
          { label: 'B' as const, text: 'Định tuyến gói tin ra cổng egress nhanh nhất', isCorrect: false },
          { label: 'C' as const, text: 'Tăng trọng số ưu tiên nội bộ', isCorrect: false },
          { label: 'D' as const, text: 'Đo lường thời gian trễ của đường truyền', isCorrect: false },
        ],
        explanation: 'MED (metric ngoài) do bên gửi đặt để đề xuất đường đi tối ưu cho dòng lưu lượng từ đối tác vào.',
        bloomLevel: 'Thông hiểu • Bloom 2',
        difficultyLevel: 'MEDIUM' as const,
      },
      {
        content: 'Trạng thái BGP nào thể hiện phiên TCP giữa hai router đã thiết lập thành công và đang chờ gói BGP OPEN?',
        options: [
          { label: 'A' as const, text: 'Idle', isCorrect: false },
          { label: 'B' as const, text: 'Connect', isCorrect: false },
          { label: 'C' as const, text: 'OpenSent', isCorrect: true },
          { label: 'D' as const, text: 'Established', isCorrect: false },
        ],
        explanation: 'Sau khi kết nối TCP hoàn tất, router gửi gói OPEN và chuyển sang trạng thái OpenSent.',
        bloomLevel: 'Thông hiểu • Bloom 2',
        difficultyLevel: 'MEDIUM' as const,
      },
      {
        content: 'Khi nào phiên BGP chuyển sang trạng thái Established?',
        options: [
          { label: 'A' as const, text: 'Khi hai bên trao đổi thành công gói OPEN và KEEPALIVE', isCorrect: true },
          { label: 'B' as const, text: 'Ngay khi bắt tay TCP 3 bước hoàn thành', isCorrect: false },
          { label: 'C' as const, text: 'Khi bảng định tuyến đã học đủ 100% prefix', isCorrect: false },
          { label: 'D' as const, text: 'Khi kết thúc trao đổi gói Update đầu tiên', isCorrect: false },
        ],
        explanation: 'Established là trạng thái sẵn sàng truyền Update sau khi nhận và xác nhận Keepalive.',
        bloomLevel: 'Nhận biết • Bloom 1',
        difficultyLevel: 'EASY' as const,
      },
      {
        content: 'Thuộc tính AS_PATH có dạng "100 200 200 200 300". Mục đích của việc lặp lại ASN 200 là gì?',
        options: [
          { label: 'A' as const, text: 'Kỹ thuật AS-Path Prepending để làm giảm độ ưu tiên của tuyến đường này', isCorrect: true },
          { label: 'B' as const, text: 'Báo lỗi cấu hình lặp ASN trên router', isCorrect: false },
          { label: 'C' as const, text: 'Tăng tốc độ truyền dữ liệu qua AS 200', isCorrect: false },
          { label: 'D' as const, text: 'Chia sẻ tải cân bằng giữa 3 router', isCorrect: false },
        ],
        explanation: 'AS-Path prepending kéo dài độ dài chuỗi AS để các router khác tránh tuyến này nếu có tuyến ngắn hơn.',
        bloomLevel: 'Vận dụng • Bloom 3',
        difficultyLevel: 'MEDIUM' as const,
      },
      {
        content: 'Để ngăn ngừa hiện tượng BGP Route Flapping gây quá tải CPU trên các router toàn cầu, cơ chế nào được kích hoạt?',
        options: [
          { label: 'A' as const, text: 'BGP Route Dampening', isCorrect: true },
          { label: 'B' as const, text: 'OSPF LSA Throttling', isCorrect: false },
          { label: 'C' as const, text: 'TCP Window Scaling', isCorrect: false },
          { label: 'D' as const, text: 'Fast Reroute (FRR)', isCorrect: false },
        ],
        explanation: 'Route Dampening gán điểm phạt (penalty) cho prefix thay đổi trạng thái liên tục và tạm thời khóa prefix đó.',
        bloomLevel: 'Vận dụng cao • Bloom 4',
        difficultyLevel: 'HARD' as const,
      },
    ];

    return rawBank.map((item, idx) => {
      const qIndex = currentQuestionsCount + idx + 1;
      const studioOpts: StudioOptionItem[] = item.options.map((opt) => ({
        id: `opt-imp-${Date.now()}-${idx}-${opt.label.toLowerCase()}`,
        label: opt.label,
        text: opt.text,
        isCorrect: opt.isCorrect,
      }));

      return {
        id: `q-studio-imp-${Date.now()}-${idx + 1}`,
        orderIndex: qIndex,
        type: 'SINGLE_CHOICE',
        typeLabel: 'Trắc nghiệm nhập từ file',
        bloomLevel: item.bloomLevel,
        difficultyLevel: item.difficultyLevel,
        points: 1.0,
        content: item.content,
        options: studioOpts,
        explanation: item.explanation,
        isCollapsed: false,
      };
    });
  };

  // Confirm import and inject into quiz
  const handleConfirmImport = () => {
    setIsConfirming(true);
    setTimeout(() => {
      setIsConfirming(false);
      const parsedQuestions = generate15ParsedQuestions();
      onImportQuestions(parsedQuestions);
      onClose();
    }, 700);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
        id="import-modal-overlay"
      >
        {/* Modal Card (Width: ~580px) */}
        <div className="w-full max-w-[580px] bg-white dark:bg-[#1E1F20] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-[#282A2C] transition-all transform animate-in zoom-in-95 duration-200">
          {/* 1. HEADER MODAL */}
          <div className="px-6 pt-6 pb-4 bg-white dark:bg-[#1E1F20] flex items-start gap-4 relative border-b border-slate-200/80 dark:border-[#282A2C]">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/70 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400 shadow-xs border border-blue-100 dark:border-blue-900/60">
              <span className="material-symbols-outlined text-[28px]">upload_file</span>
            </div>
            <div className="flex flex-col pr-8">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Nhập câu hỏi từ file Word / Excel
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Hỗ trợ tự động bóc tách câu hỏi, các phương án A-B-C-D và đáp án chính xác theo mẫu chuẩn ILMS.
              </p>
            </div>
            {/* Nút Đóng Modal */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng hộp thoại"
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#282A2C] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* 2. THÂN MODAL */}
          <div className="px-6 py-4 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
            {/* Khu vực Kéo & Thả file (Dropzone area) */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative group cursor-pointer rounded-2xl p-6 sm:p-7 flex flex-col items-center justify-center text-center transition-all duration-200 border-2 border-dashed ${
                isDragging
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500'
                  : 'bg-slate-50 dark:bg-[#18191A] hover:bg-slate-100/80 dark:hover:bg-[#222325] border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#1E1F20] shadow-sm flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3 group-hover:scale-105 transition-transform border border-slate-200/80 dark:border-slate-700">
                  <span className="material-symbols-outlined text-[32px]">cloud_upload</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                  Kéo thả file Word (.docx) hoặc Excel (.xlsx, .csv) vào đây
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  hoặc duyệt tìm tài liệu lưu trữ từ máy của bạn
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="mt-3.5 px-4 py-2 rounded-xl bg-white dark:bg-[#1E1F20] text-blue-600 dark:text-blue-400 font-semibold text-xs shadow-xs hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2 border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">folder_open</span>
                  Chọn file từ máy tính
                </button>
                <span className="font-mono text-slate-400 text-[11px] mt-2.5">
                  Dung lượng tối đa: 15MB • Mã hóa bảo mật nội bộ
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,.xlsx,.xls,.csv,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Thẻ Tải Mẫu Chuẩn (Download Template Cards) */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  File mẫu chuẩn cấu trúc
                </span>
                <button
                  type="button"
                  onClick={() => setShowGuideModal(true)}
                  className="text-[11px] text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px]">menu_book</span>
                  Hướng dẫn định dạng
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Word Template */}
                <button
                  type="button"
                  onClick={handleDownloadWordTemplate}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-[#18191A] hover:bg-slate-100 dark:hover:bg-[#222325] border border-slate-200/80 dark:border-slate-800 transition-all flex items-center gap-3 text-left shadow-xs group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors border border-blue-100 dark:border-blue-900/60">
                    <span className="material-symbols-outlined text-[22px]">description</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      Mẫu câu hỏi Word
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Định dạng .docx chuẩn
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 ml-auto text-[18px] group-hover:text-blue-600 group-hover:translate-y-0.5 transition-all">
                    download
                  </span>
                </button>

                {/* Excel Template */}
                <button
                  type="button"
                  onClick={handleDownloadExcelTemplate}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-[#18191A] hover:bg-slate-100 dark:hover:bg-[#222325] border border-slate-200/80 dark:border-slate-800 transition-all flex items-center gap-3 text-left shadow-xs group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors border border-emerald-100 dark:border-emerald-900/60">
                    <span className="material-symbols-outlined text-[22px]">table_chart</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      Mẫu ma trận Excel
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Định dạng .xlsx chuẩn
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 ml-auto text-[18px] group-hover:text-emerald-600 group-hover:translate-y-0.5 transition-all">
                    download
                  </span>
                </button>
              </div>
            </div>

            {/* File đã tải lên thành công */}
            {uploadedFile && (
              <div className="p-4 rounded-xl bg-white dark:bg-[#1E1F20] shadow-xs border border-slate-200 dark:border-slate-700 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <span className="material-symbols-outlined text-[22px]">draft</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {uploadedFile.name}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {uploadedFile.size} • Vừa tải xong
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs">
                      <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                    </span>
                    <button
                      type="button"
                      aria-label="Xóa file đã tải"
                      onClick={() => setUploadedFile(null)}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>

                {/* Thanh tiến trình hoàn tất 100% */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Kết quả AI Parse tự động */}
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[20px] shrink-0">
                    verified
                  </span>
                  <div className="flex-1 flex flex-wrap items-center justify-between text-emerald-900 dark:text-emerald-300 text-xs font-medium gap-1">
                    <span>
                      Đã nhận diện thành công <strong>{uploadedFile.questionCount} câu hỏi</strong> (0 lỗi cú pháp)
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowDetailPreview(!showDetailPreview)}
                      className="text-blue-600 dark:text-blue-400 font-semibold hover:underline text-[11px] cursor-pointer"
                    >
                      {showDetailPreview ? 'Thu gọn danh sách' : 'Xem chi tiết câu'}
                    </button>
                  </div>
                </div>

                {/* Xem chi tiết 15 câu khi mở rộng */}
                {showDetailPreview && (
                  <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800 p-2 space-y-2 bg-slate-50 dark:bg-[#131314] text-xs">
                    <p className="font-semibold text-slate-700 dark:text-slate-300 px-1">
                      Danh sách sơ bộ 15 câu hỏi bóc tách:
                    </p>
                    {generate15ParsedQuestions().map((q, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded bg-white dark:bg-[#1E1F20] border border-slate-200/80 dark:border-slate-800 flex items-start gap-2"
                      >
                        <span className="font-bold text-blue-600 dark:text-blue-400 shrink-0">
                          #{idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-800 dark:text-slate-200 truncate font-medium">
                            {q.content}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {q.bloomLevel} • 4 đáp án A-B-C-D
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. FOOTER MODAL */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-[#18191A] border-t border-slate-200/80 dark:border-[#282A2C] flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
              Hệ thống sẽ đồng bộ trực tiếp vào mục lục Quiz
            </span>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={!uploadedFile || isConfirming}
                onClick={handleConfirmImport}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-xs active:scale-98 cursor-pointer disabled:opacity-50"
              >
                {isConfirming ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">
                      progress_activity
                    </span>
                    <span>Đang nạp câu hỏi...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">playlist_add_check</span>
                    <span>Xác nhận &amp; Nạp 15 câu vào Quiz</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Formatting Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#1E1F20] rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">help</span>
                Hướng dẫn định dạng file câu hỏi
              </h3>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <div className="mt-4 space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                <strong>1. Định dạng Word (.docx / .txt):</strong>
                <br />
                Mỗi câu bắt đầu bằng <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">Câu 1:</code> hoặc <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">Question 1:</code>. Đáp án đúng có dấu <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">*</code> ở đầu (ví dụ: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">*B. Phương án B</code>).
              </p>
              <p>
                <strong>2. Định dạng Excel (.xlsx / .csv):</strong>
                <br />
                File gồm các cột: <em>STT, Nội dung câu hỏi, Phương án A, Phương án B, Phương án C, Phương án D, Đáp án đúng, Mức độ Bloom, Điểm, Giải thích</em>.
              </p>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
