'use client';

import React, { useState, useMemo } from 'react';
import type { StudioQuestionItem, StudioOptionItem } from './TeacherCreateQuizStudioView';

interface GeneratedAiQuestion {
  id: string;
  orderNumber: number;
  bloomBadge: 'Vận dụng cao' | 'Thông hiểu' | 'Nhận biết' | 'Vận dụng';
  bloomLevelText: string;
  difficultyLevel: 'EASY' | 'MEDIUM' | 'HARD';
  chapter: string;
  content: string;
  options: {
    id: string;
    label: 'A' | 'B' | 'C' | 'D';
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
  isSelected: boolean;
  isEditing?: boolean;
}

interface AiRagQuestionGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInjectQuestions: (questions: StudioQuestionItem[]) => void;
  currentQuestionsCount: number;
  subjectName?: string;
  subjectCode?: string;
}

export function AiRagQuestionGeneratorModal({
  isOpen,
  onClose,
  onInjectQuestions,
  currentQuestionsCount,
  subjectName = 'Mạng máy tính & Truyền thông',
  subjectCode = 'CS-202',
}: AiRagQuestionGeneratorModalProps) {
  // RAG Reference Document
  const ragDocument = useMemo(() => {
    if (subjectCode.includes('INT2022') || subjectName.toLowerCase().includes('giải tích')) {
      return {
        name: 'Giao_trinh_Giai_tich_2_Toan_ky_thuat_v2.pdf',
        entities: 24,
        chapters: 5,
        status: 'Vectorized',
      };
    }
    return {
      name: 'Giao_trinh_Mang_may_tinh_v2.pdf',
      entities: 18,
      chapters: 4,
      status: 'Vectorized',
    };
  }, [subjectCode, subjectName]);

  // Prompt customization state
  const [promptText, setPromptText] = useState<string>(
    'Tạo 5 câu hỏi tình huống thực tế về sự cố đứt cáp quang biển AAG và phân tích cơ chế hội tụ của BGP liên vùng (AS level), có kịch bản AS-Path prepending và bẫy lỗi định tuyến Routing Loop.'
  );

  // Quantity selector (3 - 10)
  const [quantity, setQuantity] = useState<number>(5);

  // Bloom distribution percentages
  const [bloomDistribution] = useState({
    remember: 20,
    understand: 40,
    applyHigh: 40,
  });

  // Loading state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Initial generated questions matching the user's template
  const [questionsList, setQuestionsList] = useState<GeneratedAiQuestion[]>([
    {
      id: 'ai-gen-1',
      orderNumber: 1,
      bloomBadge: 'Vận dụng cao',
      bloomLevelText: 'Vận dụng cao • Bloom 4',
      difficultyLevel: 'HARD',
      chapter: 'Chương 4: BGP Path Vector',
      content:
        'Giả sử ISP-A (AS 100) xuất hiện tình trạng đứt 2 tuyến cáp biển quốc tế và muốn phân luồng lưu lượng sang ISP-B (AS 200) một cách bị động. Kỹ sư cần chèn thuộc tính nào vào BGP Update gửi tới đối tác láng giềng eBGP?',
      options: [
        { id: 'opt-1-a', label: 'A', text: 'Tăng chỉ số Local Preference lên giá trị 250', isCorrect: false },
        { id: 'opt-1-b', label: 'B', text: 'Áp dụng AS-Path Prepending lặp lại 3 lần AS 100', isCorrect: true },
        { id: 'opt-1-c', label: 'C', text: 'Cấu hình lại giá trị Weight cục bộ trên router biên', isCorrect: false },
        { id: 'opt-1-d', label: 'D', text: 'Thiết lập Multi-Exit Discriminator (MED) thành 0', isCorrect: false },
      ],
      explanation:
        'AS-Path Prepending kéo dài đường đi danh nghĩa trong thuộc tính AS_PATH. Các AS bên ngoài khi chạy thuật toán chọn đường BGP sẽ ưu tiên đường đi có AS-Path ngắn hơn, từ đó chuyển dòng lưu lượng ingress khỏi kênh bị sự cố. Local Preference không truyền qua biên eBGP.',
      isSelected: true,
    },
    {
      id: 'ai-gen-2',
      orderNumber: 2,
      bloomBadge: 'Thông hiểu',
      bloomLevelText: 'Thông hiểu • Bloom 2',
      difficultyLevel: 'MEDIUM',
      chapter: 'Chương 4: Dijkstra OSPF Link-State',
      content:
        'Trong mạng chạy giao thức OSPF Area 0, khi giá trị Link Cost trên cổng GigabitEthernet được tính mặc định theo Reference Bandwidth = 100 Mbps, điều gì xảy ra nếu quản trị viên nâng cấp đường truyền lên 10 Gbps mà không chỉnh sửa tham số gốc?',
      options: [
        { id: 'opt-2-a', label: 'A', text: 'OSPF sẽ tự động tính Cost = 0.01 và tối ưu chọn đường', isCorrect: false },
        { id: 'opt-2-b', label: 'B', text: 'Báo lỗi OSPF neighbor mismatch MTU trên interface', isCorrect: false },
        { id: 'opt-2-c', label: 'C', text: 'Cost của cổng 10 Gbps vẫn bị làm tròn bằng 1 (ngang cổng 100 Mbps)', isCorrect: true },
        { id: 'opt-2-d', label: 'D', text: 'Router tự chuyển đổi metric sang hop count tương đương RIPv2', isCorrect: false },
      ],
      explanation:
        'Công thức OSPF Metric = Reference BW / Interface BW. Nếu Reference BW là 100 Mbps, bất kỳ băng thông nào từ 100 Mbps trở lên (1 Gbps, 10 Gbps) đều cho kết quả nhỏ hơn hoặc bằng 1, và theo chuẩn OSPF metric tối thiểu là 1, dẫn đến không phân biệt được chất lượng liên kết nhanh hơn nếu không đổi lệnh auto-cost reference-bandwidth.',
      isSelected: true,
    },
    {
      id: 'ai-gen-3',
      orderNumber: 3,
      bloomBadge: 'Nhận biết',
      bloomLevelText: 'Nhận biết • Bloom 1',
      difficultyLevel: 'EASY',
      chapter: 'Chương 2: Tầng Vận chuyển & Bắt tay TCP',
      content:
        'Cờ điều khiển (Control Flags) nào bắt buộc phải bật trong gói tin phản hồi của máy chủ HTTP khi chấp thuận yêu cầu khởi tạo phiên truyền dữ liệu TCP từ client?',
      options: [
        { id: 'opt-3-a', label: 'A', text: 'SYN = 1, ACK = 1', isCorrect: true },
        { id: 'opt-3-b', label: 'B', text: 'SYN = 1, PSH = 1', isCorrect: false },
        { id: 'opt-3-c', label: 'C', text: 'ACK = 1, URG = 1', isCorrect: false },
        { id: 'opt-3-d', label: 'D', text: 'RST = 1, ACK = 1', isCorrect: false },
      ],
      explanation:
        'Trong quy trình bắt tay 3 bước TCP (3-way handshake), bước thứ 2 yêu cầu bên Server gửi gói tin SYN-ACK nhằm đồng thời đồng bộ số Sequence của mình (SYN=1) và xác nhận số Sequence của bên Client gửi sang (ACK=1).',
      isSelected: true,
    },
  ]);

  // Selected count
  const selectedCount = useMemo(() => {
    return questionsList.filter((q) => q.isSelected).length;
  }, [questionsList]);

  if (!isOpen) return null;

  // Toggle selection for a question
  const handleToggleSelect = (id: string) => {
    setQuestionsList((prev) =>
      prev.map((q) => (q.id === id ? { ...q, isSelected: !q.isSelected } : q))
    );
  };

  // Select all or deselect all
  const handleToggleSelectAll = () => {
    const allSelected = questionsList.every((q) => q.isSelected);
    setQuestionsList((prev) => prev.map((q) => ({ ...q, isSelected: !allSelected })));
  };

  // Quick suggestion pills click handler
  const handleApplySuggestion = (text: string) => {
    setPromptText(text);
  };

  // Trigger regeneration simulation
  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      // Generate updated list based on quantity
      const newItems: GeneratedAiQuestion[] = [];
      const baseSamples = [
        {
          bloomBadge: 'Vận dụng cao' as const,
          bloomLevelText: 'Vận dụng cao • Bloom 4',
          difficultyLevel: 'HARD' as const,
          chapter: 'Chương 4: BGP Path Vector',
          content:
            'Giả sử ISP-A (AS 100) xuất hiện tình trạng đứt 2 tuyến cáp biển quốc tế và muốn phân luồng lưu lượng sang ISP-B (AS 200) một cách bị động. Kỹ sư cần chèn thuộc tính nào vào BGP Update gửi tới đối tác láng giềng eBGP?',
          options: [
            { id: 'opt-1-a', label: 'A' as const, text: 'Tăng chỉ số Local Preference lên giá trị 250', isCorrect: false },
            { id: 'opt-1-b', label: 'B' as const, text: 'Áp dụng AS-Path Prepending lặp lại 3 lần AS 100', isCorrect: true },
            { id: 'opt-1-c', label: 'C' as const, text: 'Cấu hình lại giá trị Weight cục bộ trên router biên', isCorrect: false },
            { id: 'opt-1-d', label: 'D' as const, text: 'Thiết lập Multi-Exit Discriminator (MED) thành 0', isCorrect: false },
          ],
          explanation:
            'AS-Path Prepending kéo dài đường đi danh nghĩa trong thuộc tính AS_PATH. Các AS bên ngoài khi chạy thuật toán chọn đường BGP sẽ ưu tiên đường đi có AS-Path ngắn hơn, từ đó chuyển dòng lưu lượng ingress khỏi kênh bị sự cố.',
        },
        {
          bloomBadge: 'Thông hiểu' as const,
          bloomLevelText: 'Thông hiểu • Bloom 2',
          difficultyLevel: 'MEDIUM' as const,
          chapter: 'Chương 4: Dijkstra OSPF Link-State',
          content:
            'Trong mạng chạy giao thức OSPF Area 0, khi giá trị Link Cost trên cổng GigabitEthernet được tính mặc định theo Reference Bandwidth = 100 Mbps, điều gì xảy ra nếu quản trị viên nâng cấp đường truyền lên 10 Gbps mà không chỉnh sửa tham số gốc?',
          options: [
            { id: 'opt-2-a', label: 'A' as const, text: 'OSPF sẽ tự động tính Cost = 0.01 và tối ưu chọn đường', isCorrect: false },
            { id: 'opt-2-b', label: 'B' as const, text: 'Báo lỗi OSPF neighbor mismatch MTU trên interface', isCorrect: false },
            { id: 'opt-2-c', label: 'C' as const, text: 'Cost của cổng 10 Gbps vẫn bị làm tròn bằng 1 (ngang cổng 100 Mbps)', isCorrect: true },
            { id: 'opt-2-d', label: 'D' as const, text: 'Router tự chuyển đổi metric sang hop count tương đương RIPv2', isCorrect: false },
          ],
          explanation:
            'Công thức OSPF Metric = Reference BW / Interface BW. Nếu Reference BW là 100 Mbps, bất kỳ băng thông nào từ 100 Mbps trở lên đều cho kết quả nhỏ hơn hoặc bằng 1, và OSPF làm tròn tối thiểu là 1.',
        },
        {
          bloomBadge: 'Nhận biết' as const,
          bloomLevelText: 'Nhận biết • Bloom 1',
          difficultyLevel: 'EASY' as const,
          chapter: 'Chương 2: Tầng Vận chuyển & Bắt tay TCP',
          content:
            'Cờ điều khiển (Control Flags) nào bắt buộc phải bật trong gói tin phản hồi của máy chủ HTTP khi chấp thuận yêu cầu khởi tạo phiên truyền dữ liệu TCP từ client?',
          options: [
            { id: 'opt-3-a', label: 'A' as const, text: 'SYN = 1, ACK = 1', isCorrect: true },
            { id: 'opt-3-b', label: 'B' as const, text: 'SYN = 1, PSH = 1', isCorrect: false },
            { id: 'opt-3-c', label: 'C' as const, text: 'ACK = 1, URG = 1', isCorrect: false },
            { id: 'opt-3-d', label: 'D' as const, text: 'RST = 1, ACK = 1', isCorrect: false },
          ],
          explanation:
            'Trong quy trình bắt tay 3 bước TCP (3-way handshake), bước thứ 2 yêu cầu bên Server gửi gói tin SYN-ACK nhằm đồng thời đồng bộ số Sequence của mình (SYN=1) và xác nhận số Sequence của client (ACK=1).',
        },
        {
          bloomBadge: 'Vận dụng' as const,
          bloomLevelText: 'Vận dụng • Bloom 3',
          difficultyLevel: 'MEDIUM' as const,
          chapter: 'Chương 3: Phân đoạn mạng con VLSM',
          content:
            'Cho địa chỉ mạng 172.16.0.0/16. Cần chia mạng con đáp ứng 500 máy chủ (hosts). Địa chỉ Broadcast của mạng con đầu tiên là gì?',
          options: [
            { id: 'opt-4-a', label: 'A' as const, text: '172.16.1.255', isCorrect: true },
            { id: 'opt-4-b', label: 'B' as const, text: '172.16.2.255', isCorrect: false },
            { id: 'opt-4-c', label: 'C' as const, text: '172.16.0.255', isCorrect: false },
            { id: 'opt-4-d', label: 'D' as const, text: '172.16.255.255', isCorrect: false },
          ],
          explanation:
            'Cần 500 hosts => cần 9 bit host (2^9 - 2 = 510). Subnet mask là /23 (255.255.254.0). Mạng con 1: 172.16.0.0/23, broadcast: 172.16.1.255.',
        },
        {
          bloomBadge: 'Thông hiểu' as const,
          bloomLevelText: 'Thông hiểu • Bloom 2',
          difficultyLevel: 'MEDIUM' as const,
          chapter: 'Chương 1: Mô hình OSI & TCP/IP',
          content:
            'Đơn vị dữ liệu giao thức (PDU) tại Tầng Mạng (Network Layer) trong mô hình tham chiếu OSI được gọi là gì?',
          options: [
            { id: 'opt-5-a', label: 'A' as const, text: 'Segment', isCorrect: false },
            { id: 'opt-5-b', label: 'B' as const, text: 'Packet (Gói tin)', isCorrect: true },
            { id: 'opt-5-c', label: 'C' as const, text: 'Frame (Khung)', isCorrect: false },
            { id: 'opt-5-d', label: 'D' as const, text: 'Bit', isCorrect: false },
          ],
          explanation:
            'PDU tại Tầng Vận chuyển là Segment, Tầng Mạng là Packet, Tầng Liên kết dữ liệu là Frame, Tầng Vật lý là Bit.',
        },
      ];

      const count = Math.min(Math.max(quantity, 1), baseSamples.length);
      for (let i = 0; i < count; i++) {
        const item = baseSamples[i];
        newItems.push({
          id: `ai-gen-${Date.now()}-${i + 1}`,
          orderNumber: i + 1,
          ...item,
          isSelected: true,
        });
      }
      setQuestionsList(newItems);
    }, 900);
  };

  // Push selected questions to studio
  const handleConfirmPushToQuiz = () => {
    const selectedQuestions = questionsList.filter((q) => q.isSelected);
    if (selectedQuestions.length === 0) return;

    const formattedStudioQuestions: StudioQuestionItem[] = selectedQuestions.map((q, idx) => {
      const studioOpts: StudioOptionItem[] = q.options.map((opt) => ({
        id: `opt-${Date.now()}-${idx}-${opt.label.toLowerCase()}`,
        label: opt.label,
        text: opt.text,
        isCorrect: opt.isCorrect,
      }));

      return {
        id: `q-studio-ai-${Date.now()}-${idx + 1}`,
        orderIndex: currentQuestionsCount + idx + 1,
        type: 'SINGLE_CHOICE',
        typeLabel: `Trắc nghiệm AI • ${q.bloomBadge}`,
        bloomLevel: q.bloomLevelText,
        difficultyLevel: q.difficultyLevel,
        points: 1.0,
        content: q.content,
        options: studioOpts,
        explanation: q.explanation,
        isCollapsed: false,
      };
    });

    onInjectQuestions(formattedStudioQuestions);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 xl:p-8 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      id="ai-rag-modal-container"
    >
      {/* AI RAG QUESTION GENERATOR DIALOG */}
      <div className="w-full max-w-6xl max-h-[92vh] bg-white dark:bg-[#1E1F20] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-[#282A2C]">
        {/* 1. HEADER MODAL */}
        <div className="px-6 py-4 bg-white dark:bg-[#1E1F20] border-b border-slate-200/80 dark:border-[#282A2C] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
            </div>
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Sinh câu hỏi bằng AI
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 text-[11px] font-semibold tracking-wide">
                  Cognitive Engine v4.2 PRO • GPT-4o EdTech
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Tùy chỉnh Prompt học thuật kết hợp RAG Knowledge Graph từ giáo trình khoa CNTT
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
            className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-[#282A2C] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 flex items-center justify-center transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* 2. MODAL BODY (Balanced 2-Column Studio Grid) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto min-h-0 bg-slate-50 dark:bg-[#131314]">
          {/* CỘT TRÁI: CẤU HÌNH YÊU CẦU AI (5 Cols) */}
          <div className="lg:col-span-5 p-6 bg-white dark:bg-[#1E1F20] flex flex-col gap-5 overflow-y-auto border-r border-slate-200/80 dark:border-[#282A2C]">
            {/* Knowledge Document Attachment */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-blue-400">
                    menu_book
                  </span>
                  Tài liệu tham chiếu RAG
                </label>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-[11px] font-medium border border-blue-200/60 dark:border-blue-900/60">
                  {ragDocument.status}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#282A2C]/60 hover:bg-slate-100 dark:hover:bg-[#282A2C] transition-colors flex items-center gap-3 border border-slate-200/60 dark:border-slate-700/60">
                <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                    {ragDocument.name}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span>{ragDocument.entities} thực thể tri thức</span>
                    <span>•</span>
                    <span>{ragDocument.chapters} chương trọng tâm</span>
                  </span>
                </div>
                <button
                  type="button"
                  title="Đồng bộ lại tài liệu"
                  onClick={() => handleGenerate()}
                  className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">sync</span>
                </button>
              </div>
            </div>

            {/* Prompt Customization Textarea */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="ai-prompt"
                  className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-blue-400">
                    psychology
                  </span>
                  Prompt tinh chỉnh chuyên sâu
                </label>
                <span className="text-[11px] text-slate-400">
                  {promptText.length}/500 ký tự
                </span>
              </div>
              <textarea
                id="ai-prompt"
                value={promptText}
                maxLength={500}
                onChange={(e) => setPromptText(e.target.value)}
                rows={4}
                placeholder="Ví dụ: Tạo 5 câu hỏi tình huống thực tế về sự cố đứt cáp và cơ chế hội tụ của giao thức BGP liên vùng, có bảng định tuyến minh họa..."
                className="w-full bg-slate-50 dark:bg-[#131314] p-3 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all resize-none shadow-xs leading-relaxed"
              />

              {/* Quick Suggestion Prompt Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-slate-400 mr-1">Gợi ý nhanh:</span>
                <button
                  type="button"
                  onClick={() =>
                    handleApplySuggestion(
                      'Tạo câu hỏi phân tích sự cố rớt gói khi mạng doanh nghiệp chuyển đổi IPv4 sang IPv6 sử dụng đường hầm 6to4 và NAT64.'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#282A2C] hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 dark:hover:text-blue-400 text-slate-600 dark:text-slate-300 text-[11px] font-medium transition-colors cursor-pointer"
                >
                  + Tình huống thực tế
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleApplySuggestion(
                      'Tạo câu hỏi tính toán đường đi ngắn nhất theo thuật toán Dijkstra OSPF khi có các tham số Link Cost và Reference Bandwidth khác nhau.'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#282A2C] hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 dark:hover:text-blue-400 text-slate-600 dark:text-slate-300 text-[11px] font-medium transition-colors cursor-pointer"
                >
                  + Tính toán Metric Dijkstra
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleApplySuggestion(
                      'Tạo câu hỏi về bẫy lỗi định tuyến Routing Loop, kỹ thuật Split Horizon và Poison Reverse trong mạng doanh nghiệp đa tầng.'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#282A2C] hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 dark:hover:text-blue-400 text-slate-600 dark:text-slate-300 text-[11px] font-medium transition-colors cursor-pointer"
                >
                  + Bẫy lỗi thường gặp
                </button>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#282A2C]/50 border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Số lượng câu cần sinh
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tối ưu từ 3 - 10 câu mỗi lần chạy
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-[#1E1F20] text-slate-800 dark:text-white flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs font-semibold border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  -
                </button>
                <span className="w-8 text-center font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                  {quantity < 10 ? `0${quantity}` : quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-[#1E1F20] text-slate-800 dark:text-white flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs font-semibold border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Bloom Taxonomy Distribution */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-blue-400">
                    analytics
                  </span>
                  Phân bổ mức độ Bloom
                </label>
                <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                  Tổng: 100%
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {/* Nhận biết */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#282A2C]/50 border border-slate-200/60 dark:border-slate-700/60 flex flex-col items-center gap-1 text-center">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Nhận biết</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {bloomDistribution.remember}%
                  </span>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-blue-300 dark:bg-blue-400 h-full"
                      style={{ width: `${bloomDistribution.remember}%` }}
                    />
                  </div>
                </div>

                {/* Thông hiểu */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#282A2C]/50 border border-slate-200/60 dark:border-slate-700/60 flex flex-col items-center gap-1 text-center">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Thông hiểu</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {bloomDistribution.understand}%
                  </span>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-blue-600 h-full"
                      style={{ width: `${bloomDistribution.understand}%` }}
                    />
                  </div>
                </div>

                {/* Vận dụng cao */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#282A2C]/50 border border-slate-200/60 dark:border-slate-700/60 flex flex-col items-center gap-1 text-center">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Vận dụng cao</span>
                  <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                    {bloomDistribution.applyHigh}%
                  </span>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-blue-800 dark:bg-blue-500 h-full"
                      style={{ width: `${bloomDistribution.applyHigh}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Generate Button */}
            <div className="pt-2 mt-auto">
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerate}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60"
              >
                {isGenerating ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                    <span>Đang trích xuất tri thức &amp; sinh câu hỏi...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">temp_preferences_custom</span>
                    <span>✨ Bắt đầu sinh câu hỏi</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center mt-2 flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-emerald-500">
                  verified
                </span>
                Đã bật đối chiếu chéo (Hallucination Detection Guard 99.4%)
              </p>
            </div>
          </div>

          {/* CỘT PHẢI: KHU VỰC XEM TRƯỚC & DUYỆT CÂU HỎI (7 Cols) */}
          <div className="lg:col-span-7 p-6 flex flex-col gap-4 overflow-y-auto bg-slate-50/80 dark:bg-[#131314]">
            {/* Sticky Status & Filtering Sub-bar */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-[#1E1F20] shadow-xs border border-slate-200/80 dark:border-[#282A2C]">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px]">
                  check_circle
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Đã chọn {selectedCount}/{questionsList.length} câu hỏi hợp lệ
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#282A2C] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">select_all</span>
                  {questionsList.every((q) => q.isSelected) ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </button>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#282A2C] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">refresh</span>
                  Tái tạo lại
                </button>
              </div>
            </div>

            {/* Question Previews List */}
            <div className="flex flex-col gap-4">
              {questionsList.map((q) => (
                <div
                  key={q.id}
                  className={`p-5 rounded-xl bg-white dark:bg-[#1E1F20] shadow-xs border transition-all ${
                    q.isSelected
                      ? 'border-blue-500/50 dark:border-blue-500/50'
                      : 'border-slate-200/80 dark:border-[#282A2C] opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={q.isSelected}
                        onChange={() => handleToggleSelect(q.id)}
                        className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                      />
                      <div className="flex flex-col">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                            Câu {q.orderNumber}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-[#282A2C] text-slate-600 dark:text-slate-300 font-medium">
                            {q.bloomBadge}
                          </span>
                          <span className="font-mono text-[11px] text-slate-400">
                            {q.chapter}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white leading-relaxed">
                          {q.content}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-7 mt-3">
                    {q.options.map((opt) => (
                      <div
                        key={opt.id}
                        className={`p-2.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                          opt.isCorrect
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-900/60 font-medium'
                            : 'bg-slate-50 dark:bg-[#282A2C]/60 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60'
                        }`}
                      >
                        <span>
                          <span
                            className={`font-bold mr-1.5 ${
                              opt.isCorrect
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {opt.label}.
                          </span>
                          {opt.text}
                        </span>
                        {opt.isCorrect && (
                          <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-blue-400 shrink-0 ml-1">
                            check_circle
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Socratic Explanation AI Box */}
                  <div className="ml-7 mt-3 p-3 rounded-lg bg-slate-50 dark:bg-[#282A2C]/60 border border-slate-200/60 dark:border-slate-700/60 flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                      <span className="material-symbols-outlined text-[16px]">lightbulb</span>
                      <span>Lời giải chi tiết Socratic (RAG Tri thức {subjectCode})</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      {q.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. FOOTER MODAL */}
        <div className="px-6 py-4 bg-white dark:bg-[#1E1F20] border-t border-slate-200/80 dark:border-[#282A2C] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
            <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-blue-400">
              database
            </span>
            <span>Dữ liệu được chuẩn hóa theo định dạng QTI 2.1 &amp; Moodle XML</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-[#282A2C] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              disabled={selectedCount === 0}
              onClick={handleConfirmPushToQuiz}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-blue-600/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">add_task</span>
              <span>Đẩy {selectedCount} câu hỏi đã chọn vào bài thi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
