'use client';

import React from 'react';
import { FontFamilyName } from '@/hooks/useDesignSystem';

interface LivePreviewCardProps {
  fontFamily: FontFamilyName;
}

export function LivePreviewCard({ fontFamily }: LivePreviewCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold tracking-tight text-foreground uppercase">
            Khung xem trước phối màu &amp; Font - Live Preview
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Hiển thị trực quan thời gian thực các token màu sắc &amp; font chữ đã chọn.
          </p>
        </div>
        <span className="rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-semibold text-secondary">
          {fontFamily}
        </span>
      </div>

      {/* Mock Component Box */}
      <div className="rounded-xl border border-border bg-background p-5 shadow-inner">
        {/* Mock Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/25">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-foreground">
                Trợ lý Socratic ILMS
              </h3>
              <p className="text-xs text-muted-foreground">
                Khóa học: Kiến trúc Hệ thống Microservices
              </p>
            </div>
          </div>

          {/* Secondary Badge */}
          <span className="inline-flex items-center rounded-full border border-secondary/30 bg-secondary/15 px-3 py-1 text-xs font-bold text-secondary">
            Secondary Tag
          </span>
        </div>

        {/* Learning Prompt Snippet */}
        <p className="mt-4 text-xs leading-relaxed text-foreground/90">
          Hệ thống đang cá nhân hóa lộ trình dựa trên phản hồi của bạn. Hãy hoàn thành thử thách kiến trúc tiếp theo để nhận chứng chỉ.
        </p>

        {/* Progress Bar (75%) */}
        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Tiến độ bài giảng</span>
            <span className="text-tertiary">75% Hoàn thành</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral/20">
            <div
              className="h-full rounded-full bg-tertiary transition-all duration-500"
              style={{ width: '75%' }}
            />
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-md shadow-primary/25 transition-opacity hover:opacity-90"
          >
            <span>Nút thao tác chính</span>
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>

          <button
            type="button"
            className="rounded-xl border border-neutral/30 bg-neutral/10 px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-neutral/20"
          >
            Chi tiết bài học
          </button>
        </div>
      </div>
    </div>
  );
}
