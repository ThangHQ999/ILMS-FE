'use client';

import React from 'react';
import { FontFamilyName } from '@/hooks/useDesignSystem';

interface LivePreviewCardProps {
  fontFamily: FontFamilyName;
}

export function LivePreviewCard({ fontFamily }: LivePreviewCardProps) {
  return (
    <div className="rounded-3xl bg-white dark:bg-[#1E1F20] p-6 border-none shadow-[0_1px_3px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none transition-all">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold tracking-tight text-[#1F1F1F] dark:text-[#E3E3E3] uppercase">
            Khung xem trước phối màu &amp; Font - Live Preview
          </h2>
          <p className="mt-1 text-xs text-[#444746] dark:text-[#C4C7C5]">
            Hiển thị trực quan thời gian thực các token màu sắc &amp; font chữ đã chọn.
          </p>
        </div>
        <span className="rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] px-3 py-1 text-xs font-semibold text-[#041E49] dark:text-[#A8C7FA] border-none">
          {fontFamily}
        </span>
      </div>

      {/* Mock Component Box */}
      <div className="rounded-3xl bg-[#F0F4F9] dark:bg-[#131314] p-6 border-none shadow-none">
        {/* Mock Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA]">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-[#1F1F1F] dark:text-[#E3E3E3]">
                Trợ lý Socratic ILMS
              </h3>
              <p className="text-xs text-[#444746] dark:text-[#C4C7C5]">
                Khóa học: Kiến trúc Hệ thống Microservices
              </p>
            </div>
          </div>

          {/* Secondary Badge */}
          <span className="inline-flex items-center rounded-full bg-[#C4EED0] text-[#0D652D] dark:bg-[#142E20] dark:text-[#81C995] px-3 py-1 text-xs font-medium border-none">
            Hoạt động
          </span>
        </div>

        {/* Learning Prompt Snippet */}
        <p className="mt-4 text-xs leading-relaxed text-[#1F1F1F] dark:text-[#C4C7C5]">
          Hệ thống đang cá nhân hóa lộ trình dựa trên phản hồi của bạn. Hãy hoàn thành thử thách kiến trúc tiếp theo để nhận chứng chỉ.
        </p>

        {/* Progress Bar (75%) */}
        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-xs font-semibold">
            <span className="text-[#444746] dark:text-[#8E918F]">Tiến độ bài giảng</span>
            <span className="text-[#0B57D0] dark:text-[#A8C7FA]">75% Hoàn thành</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#E1E5EA] dark:bg-[#282A2C]">
            <div
              className="h-full rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] transition-all duration-500"
              style={{ width: '75%' }}
            />
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 rounded-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] px-5 py-2.5 text-xs font-medium border-none shadow-none transition-colors cursor-pointer"
          >
            <span>Nút thao tác chính</span>
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>

          <button
            type="button"
            className="rounded-full bg-[#E1E5EA] hover:bg-[#D3D8DE] text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3] px-5 py-2.5 text-xs font-medium border-none shadow-none transition-colors cursor-pointer"
          >
            Chi tiết bài học
          </button>
        </div>
      </div>
    </div>
  );
}
