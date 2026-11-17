'use client';

import React, { useState } from 'react';

interface LessonAcademicDocumentProps {
  onToast: (msg: string) => void;
}

export function LessonAcademicDocument({ onToast }: LessonAcademicDocumentProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'comments'>('overview');
  const [isZoomDiagramOpen, setIsZoomDiagramOpen] = useState(false);
  const [isCodeCopied, setIsCodeCopied] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentsList, setCommentsList] = useState([
    {
      id: 'c-1',
      author: 'Lê Minh Quân',
      role: 'Học viên',
      time: '2 giờ trước',
      content:
        'Thầy ơi cho em hỏi nếu gói tin SYN-ACK ở bước 2 bị drop thì Client sẽ gửi lại gói tin SYN sau bao nhiêu giây ạ?',
      replies: [
        {
          id: 'r-1',
          author: 'TS. Lê Hoàng Nam',
          role: 'Giảng viên',
          time: '1 giờ trước',
          content:
            'Chào Quân, theo RFC 6298, giá trị RTO (Retransmission Timeout) khởi tạo thường là 1 giây. Nếu không nhận được SYN-ACK, Client sẽ retransmit và tăng thời gian chờ lũy thừa (Exponential Backoff: 1s, 2s, 4s...) nhé.',
        },
      ],
    },
    {
      id: 'c-2',
      author: 'Nguyễn Thị Mai',
      role: 'Học viên',
      time: '4 giờ trước',
      content:
        'Sơ đồ tuần tự trực quan quá ạ! Nhờ có giải thích về Half-open Connection mà em hiểu rõ tại sao không dùng 2 bước bắt tay.',
      replies: [],
    },
  ]);

  const pythonCode = `# Khởi tạo TCP Socket và thiết lập bắt tay 3 bước
import socket

SERVER_HOST = "192.168.1.10"
SERVER_PORT = 8080

# 1. Tạo socket dòng STREAM (TCP)
client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# 2. Hàm connect() kích hoạt gói tin SYN đầu tiên
try:
    print("[Client] Đang gửi gói tin SYN...")
    client_socket.connect((SERVER_HOST, SERVER_PORT))
    print("[Client] Đã nhận SYN-ACK và gửi ACK thành công! Kết nối ESTABLISHED.")
    
    # 3. Gửi tải tin (Data Payload) sau khi đã bắt tay (Piggybacking)
    client_socket.sendall(b"GET /index.html HTTP/1.1\\r\\nHost: server\\r\\n\\r\\n")
finally:
    client_socket.close()`;

  const handleCopyCode = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(pythonCode);
    }
    setIsCodeCopied(true);
    onToast('Đã sao chép mã nguồn Python vào clipboard!');
    setTimeout(() => setIsCodeCopied(false), 2500);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) {
      onToast('Vui lòng nhập nội dung câu hỏi hoặc phản hồi!');
      return;
    }
    setCommentsList((prev) => [
      {
        id: `c-${Date.now()}`,
        author: 'Trần Nhật Minh',
        role: 'Học viên',
        time: 'Vừa xong',
        content: newComment.trim(),
        replies: [],
      },
      ...prev,
    ]);
    setNewComment('');
    onToast('Đã gửi câu hỏi thảo luận lên bài học!');
  };

  return (
    <article className="max-w-4xl mx-auto w-full bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col gap-6 border-[3px] border-slate-300 dark:border-slate-700">
      {/* Header of Document */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-800">
            Giao thức Giao vận Tin cậy
          </span>
          <span className="text-slate-400 text-xs font-semibold">• RFC 793 / RFC 9293</span>
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Cơ chế Truyền Dữ liệu Tin cậy (RDT) &amp; Bắt tay 3 bước TCP
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Biên soạn bởi Bộ môn Mạng &amp; Truyền thông • Thời gian đọc hiểu: 12 phút
        </p>
      </div>

      {/* Section 1 */}
      <section className="flex flex-col gap-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-blue-600 rounded-full shrink-0" />
          <span>1. Nguyên lý Thiết lập Kết nối Hướng dòng (Connection-Oriented)</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
          Trước khi hai tiến trình ứng dụng có thể truyền gửi dữ liệu qua giao thức TCP, hai bên
          (Client và Server) bắt buộc phải tiến hành bắt tay để đồng bộ hóa các tham số khởi tạo như:{' '}
          <strong className="text-slate-900 dark:text-slate-100">
            Sequence Number khởi tạo (ISN)
          </strong>
          , kích thước bộ đệm tiếp nhận (Receive Window -{' '}
          <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold border border-slate-200 dark:border-slate-700">
            rcv_wnd
          </code>
          ), và tùy chọn kích thước đoạn cực đại (MSS).
        </p>
      </section>

      {/* Knowledge Callout Card */}
      <div className="w-full p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 shadow-xs flex gap-3.5 items-start border-[3px] border-slate-300 dark:border-slate-700">
        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-300 dark:border-amber-700">
          <span className="material-symbols-outlined text-[24px]">lightbulb</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5">
            Câu hỏi kinh điển: Tại sao bắt buộc cần 3 bước mà không phải 2 bước?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
            Nếu chỉ dùng 2 bước bắt tay: Giả sử một gói tin{' '}
            <code className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold px-1 bg-white dark:bg-slate-900 rounded">
              SYN
            </code>{' '}
            của Client bị trễ trong mạng viễn thông. Client sau một thời gian timeout đã hủy yêu cầu
            này và tạo một kết nối khác. Tuy nhiên gói SYN cũ bị trễ này sau đó mới đến Server. Phía
            Server lầm tưởng là kết nối mới nên gửi lại phản hồi chấp nhận và cấp phát tài nguyên
            ngay lập tức. Client khi nhận được phản hồi này sẽ loại bỏ vì không khớp session hiện
            tại. Kết quả là phía Server bị treo một kết nối ma (
            <strong className="text-rose-600 dark:text-rose-400">Half-open Connection</strong>),
            gây lãng phí bộ nhớ và cạn kiệt tài nguyên máy chủ.
          </p>
        </div>
      </div>

      {/* Interactive Diagram Block (Inline SVG) */}
      <div className="w-full p-4 sm:p-5 rounded-xl bg-slate-100 dark:bg-slate-800 flex flex-col gap-3 border-[3px] border-slate-300 dark:border-slate-700">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-blue-600 text-[20px]">sync_alt</span>
            <span>Sơ đồ Tuần tự Bắt tay 3 bước (Sequence Diagram)</span>
          </span>
          <button
            type="button"
            onClick={() => setIsZoomDiagramOpen(true)}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">zoom_in</span>
            <span>Click để phóng to</span>
          </button>
        </div>

        {/* SVG Diagram Canvas */}
        <div
          onClick={() => setIsZoomDiagramOpen(true)}
          className="w-full bg-white dark:bg-slate-900 rounded-lg p-4 flex justify-center cursor-pointer hover:shadow-md transition-shadow border border-slate-200 dark:border-slate-700"
          title="Bấm để xem sơ đồ phóng to toàn màn hình"
        >
          <svg className="w-full max-w-2xl h-auto text-slate-900 dark:text-slate-100" viewBox="0 0 700 240">
            {/* Headers */}
            <rect fill="#0059bb" height="36" rx="6" width="120" x="80" y="10" />
            <text
              fill="#ffffff"
              fontFamily="sans-serif"
              fontSize="13"
              fontWeight="bold"
              textAnchor="middle"
              x="140"
              y="33"
            >
              CLIENT (Host A)
            </text>
            <rect fill="#160066" height="36" rx="6" width="120" x="500" y="10" />
            <text
              fill="#ffffff"
              fontFamily="sans-serif"
              fontSize="13"
              fontWeight="bold"
              textAnchor="middle"
              x="560"
              y="33"
            >
              SERVER (Host B)
            </text>

            {/* Life lines */}
            <line stroke="#75777e" strokeDasharray="4 4" strokeWidth="1.5" x1="140" x2="140" y1="46" y2="230" />
            <line stroke="#75777e" strokeDasharray="4 4" strokeWidth="1.5" x1="560" x2="560" y1="46" y2="230" />

            {/* Step 1: SYN */}
            <path d="M 140 80 L 555 105" markerEnd="url(#arrow-blue)" stroke="#0059bb" strokeWidth="2.5" />
            <text
              fill="#0059bb"
              fontFamily="sans-serif"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
              x="350"
              y="85"
            >
              1. SYN=1, Seq = x (Client_ISN)
            </text>

            {/* Step 2: SYN-ACK */}
            <path d="M 560 135 L 145 160" markerEnd="url(#arrow-purple)" stroke="#7f70fb" strokeWidth="2.5" />
            <text
              fill="#4029ba"
              fontFamily="sans-serif"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
              x="350"
              y="142"
            >
              2. SYN=1, ACK=1, Seq = y, Ack = x + 1
            </text>

            {/* Step 3: ACK */}
            <path d="M 140 190 L 555 215" markerEnd="url(#arrow-blue)" stroke="#0059bb" strokeWidth="2.5" />
            <text
              fill="#0059bb"
              fontFamily="sans-serif"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
              x="350"
              y="195"
            >
              3. ACK=1, Seq = x + 1, Ack = y + 1 (Có thể kèm Data)
            </text>

            <defs>
              <marker id="arrow-blue" markerHeight="6" markerWidth="6" orient="auto-start-reverse" refX="5" refY="5" viewBox="0 0 10 10">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#0059bb" />
              </marker>
              <marker id="arrow-purple" markerHeight="6" markerWidth="6" orient="auto-start-reverse" refX="5" refY="5" viewBox="0 0 10 10">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#7f70fb" />
              </marker>
            </defs>
          </svg>
        </div>
      </div>

      {/* Section 2: Code Implementation Sandbox */}
      <section className="flex flex-col gap-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-blue-600 rounded-full shrink-0" />
          <span>2. Cú pháp Socket TCP Khởi tạo Kết nối (Python 3.11)</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Dưới tầng ứng dụng, hàm <code className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">connect()</code> phía client và <code className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">accept()</code> phía server trực tiếp kích hoạt tiến trình 3-way handshake dưới kernel hệ điều hành:
        </p>

        {/* Code Box */}
        <div className="w-full rounded-xl bg-[#0A192F] text-slate-100 overflow-hidden shadow-md border-[3px] border-slate-700">
          <div className="px-4 py-2 bg-[#071120] flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="font-mono text-xs text-slate-400 ml-2">tcp_client_handshake.py</span>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">
                {isCodeCopied ? 'check' : 'content_copy'}
              </span>
              <span>{isCodeCopied ? 'Đã sao chép' : 'Sao chép mã'}</span>
            </button>
          </div>
          <pre className="p-4 font-mono text-xs leading-relaxed overflow-x-auto text-slate-200">
            <code>{pythonCode}</code>
          </pre>
        </div>
      </section>

      {/* ======================================================== */}
      {/* Academic Tabs Container (Overview, Files, Comments)      */}
      {/* ======================================================== */}
      <section className="mt-2 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-4">
        {/* Tab Headers */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">menu_book</span>
            <span>Chuẩn đầu ra (Overview)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('files')}
            className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'files'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">attach_file</span>
            <span>Tài liệu đính kèm (2)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('comments')}
            className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'comments'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">forum</span>
            <span>Thảo luận lớp học ({commentsList.length})</span>
          </button>
        </div>

        {/* Tab Content 1: Overview */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Mục tiêu chuẩn đầu ra bài học (Learning Outcomes):
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-start gap-3 border-[3px] border-slate-300 dark:border-slate-700">
                <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Giải thích cấu trúc TCP Header
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Nhớ chính xác vai trò 6 cờ điều khiển: URG, ACK, PSH, RST, SYN, FIN.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-start gap-3 border-[3px] border-slate-300 dark:border-slate-700">
                <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Phân tích Bắt tay 3 bước
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Làm rõ cơ chế sinh Sequence Number ngẫu nhiên chống tấn công ISN Guessing.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-start gap-3 border-[3px] border-slate-300 dark:border-slate-700">
                <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                  3
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Bắt gói tin với Wireshark
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Sử dụng bộ lọc <code className="font-mono text-blue-600">tcp.flags.syn == 1</code> để nhận diện traffic bắt tay.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-start gap-3 border-[3px] border-slate-300 dark:border-slate-700">
                <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                  4
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Cơ chế SYN Cookies
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Hiểu giải pháp phòng vệ máy chủ trước các cuộc tấn công từ chối dịch vụ SYN Flood.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: Files */}
        {activeTab === 'files' && (
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Tài nguyên học phần:
            </h3>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-[3px] border-slate-300 dark:border-slate-700">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">picture_as_pdf</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                    Slide_Bai3.2_TCP_Handshake_2025.pdf
                  </p>
                  <p className="text-[11px] text-slate-400">PDF Document • 4.8 MB • Bài giảng chính thức</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onToast('Đang tải file Slide_Bai3.2_TCP_Handshake_2025.pdf')}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 hover:bg-blue-600 hover:text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Tải xuống</span>
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-[3px] border-slate-300 dark:border-slate-700">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">dataset</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                    Packet_Capture_Lab04_Handshake.pcapng
                  </p>
                  <p className="text-[11px] text-slate-400">Wireshark Capture File • 1.2 MB • Dữ liệu mẫu thực hành</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onToast('Đang tải file Packet_Capture_Lab04_Handshake.pcapng')}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 hover:bg-blue-600 hover:text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Tải xuống</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Content 3: Comments */}
        {activeTab === 'comments' && (
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Hỏi đáp &amp; Thảo luận bài học:
            </h3>

            {/* Comment Input */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-[3px] border-slate-300 dark:border-slate-700 flex flex-col gap-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Đặt câu hỏi hoặc chia sẻ góc nhìn về cơ chế bắt tay 3 bước TCP..."
                rows={2}
                className="w-full bg-transparent resize-none outline-none text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddComment}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  Gửi thảo luận
                </button>
              </div>
            </div>

            {/* Comments Thread */}
            <div className="flex flex-col gap-3">
              {commentsList.map((cmt) => (
                <div
                  key={cmt.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-[3px] border-slate-300 dark:border-slate-700 flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                        {cmt.author.charAt(0)}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 mr-2">
                          {cmt.author}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                          {cmt.role}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">{cmt.time}</span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {cmt.content}
                  </p>

                  {/* Replies */}
                  {cmt.replies.map((rep) => (
                    <div
                      key={rep.id}
                      className="ml-5 p-3 rounded-xl bg-white dark:bg-slate-900 border-l-[3px] border-blue-600 flex flex-col gap-1.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                            {rep.author}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                            {rep.role}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{rep.time}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {rep.content}
                      </p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Zoom Diagram Modal */}
      {isZoomDiagramOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl border-[3px] border-slate-300 dark:border-slate-700 shadow-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">sync_alt</span>
                <span>Sơ đồ Tuần tự Bắt tay 3 bước TCP (Độ phân giải cao)</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsZoomDiagramOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            <div className="w-full bg-slate-50 dark:bg-slate-950 p-6 rounded-xl flex items-center justify-center">
              <svg className="w-full h-auto text-slate-900 dark:text-slate-100" viewBox="0 0 700 240">
                <rect fill="#0059bb" height="36" rx="6" width="120" x="80" y="10" />
                <text fill="#ffffff" fontFamily="sans-serif" fontSize="13" fontWeight="bold" textAnchor="middle" x="140" y="33">
                  CLIENT (Host A)
                </text>
                <rect fill="#160066" height="36" rx="6" width="120" x="500" y="10" />
                <text fill="#ffffff" fontFamily="sans-serif" fontSize="13" fontWeight="bold" textAnchor="middle" x="560" y="33">
                  SERVER (Host B)
                </text>

                <line stroke="#75777e" strokeDasharray="4 4" strokeWidth="1.5" x1="140" x2="140" y1="46" y2="230" />
                <line stroke="#75777e" strokeDasharray="4 4" strokeWidth="1.5" x1="560" x2="560" y1="46" y2="230" />

                <path d="M 140 80 L 555 105" markerEnd="url(#zoom-arrow-blue)" stroke="#0059bb" strokeWidth="2.5" />
                <text fill="#0059bb" fontFamily="sans-serif" fontSize="12" fontWeight="bold" textAnchor="middle" x="350" y="85">
                  1. SYN=1, Seq = x (Client_ISN)
                </text>

                <path d="M 560 135 L 145 160" markerEnd="url(#zoom-arrow-purple)" stroke="#7f70fb" strokeWidth="2.5" />
                <text fill="#4029ba" fontFamily="sans-serif" fontSize="12" fontWeight="bold" textAnchor="middle" x="350" y="142">
                  2. SYN=1, ACK=1, Seq = y, Ack = x + 1
                </text>

                <path d="M 140 190 L 555 215" markerEnd="url(#zoom-arrow-blue)" stroke="#0059bb" strokeWidth="2.5" />
                <text fill="#0059bb" fontFamily="sans-serif" fontSize="12" fontWeight="bold" textAnchor="middle" x="350" y="195">
                  3. ACK=1, Seq = x + 1, Ack = y + 1 (Có thể kèm Data)
                </text>

                <defs>
                  <marker id="zoom-arrow-blue" markerHeight="6" markerWidth="6" orient="auto-start-reverse" refX="5" refY="5" viewBox="0 0 10 10">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#0059bb" />
                  </marker>
                  <marker id="zoom-arrow-purple" markerHeight="6" markerWidth="6" orient="auto-start-reverse" refX="5" refY="5" viewBox="0 0 10 10">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#7f70fb" />
                  </marker>
                </defs>
              </svg>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsZoomDiagramOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

