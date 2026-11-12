'use client';

import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import dynamic from 'next/dynamic';
import 'katex/dist/katex.min.css';
import { preprocessLatex } from '@/lib/latex';

const MermaidRenderer = dynamic(
  () => import('@/components/shared/MermaidRenderer').then((mod) => mod.MermaidRenderer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-24 rounded-2xl bg-slate-100/50 dark:bg-[#282A2C] p-3 flex items-center justify-center text-[#8E918F] text-xs border-none">
        Đang tải đồ thị Mermaid...
      </div>
    ),
  }
);

const Vis3dRenderer = dynamic(
  () => import('@/components/shared/Vis3dRenderer').then((mod) => mod.Vis3dRenderer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-36 rounded-2xl bg-[#282A2C] p-3 flex items-center justify-center text-[#8E918F] text-xs border-none">
        Đang tải không gian 3D...
      </div>
    ),
  }
);

const Atom3DViewer = dynamic(
  () => import('@/components/shared/Atom3DViewer').then((mod) => mod.Atom3DViewer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-44 rounded-2xl bg-[#131314] p-3 flex items-center justify-center text-[#8E918F] text-xs border-none">
        Đang tải mô hình nguyên tử 3D...
      </div>
    ),
  }
);

const MemoizedAtomBlock = React.memo(function MemoizedAtomBlock({ raw }: { raw: string }) {
  const parsedData = React.useMemo(() => {
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.nucleus && Array.isArray(parsed?.electron_shells)) {
        return parsed;
      }
    } catch {
      return null;
    }
    return null;
  }, [raw]);

  if (!parsedData) {
    return <Vis3dRenderer rawCode={raw} />;
  }

  return <Atom3DViewer data={parsedData} />;
});

interface SocraticMarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

export const SocraticMarkdownRenderer = React.memo(function SocraticMarkdownRenderer({ content, isStreaming = false }: SocraticMarkdownRendererProps) {
  const processedContent = useMemo(() => preprocessLatex(content), [content]);

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed socratic-markdown-root">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-900 dark:text-[#E3E3E3]">{children}</strong>
          ),
          h1: ({ children }) => (
            <h1 className="text-sm font-bold text-slate-900 dark:text-[#E3E3E3] mt-2 mb-1.5">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xs font-bold text-slate-900 dark:text-[#E3E3E3] mt-2 mb-1">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-semibold text-[#A8C7FA] mt-2 mb-1">
              {children}
            </h3>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-2 space-y-1 pl-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-2 space-y-1 pl-1">{children}</ol>
          ),
          li: ({ children }) => <li className="text-xs leading-relaxed">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-[#A8C7FA] pl-2.5 py-0.5 my-2 italic bg-[#162B4D]/30 text-slate-700 dark:text-[#C4C7C5] rounded-r">
              {children}
            </blockquote>
          ),
          pre: ({ children }) => (
            <pre className="p-3 my-2 rounded-xl bg-[#131314] text-[#E3E3E3] text-[11px] font-mono overflow-x-auto border-none">
              {children}
            </pre>
          ),
          code: ({ className, children, ...props }: React.ComponentProps<'code'>) => {
            const raw = String(children).replace(/\n$/, '');
            const match = /language-([\w-]+)/.exec(className || '');
            const language = match ? match[1].toLowerCase() : '';
            const isCodeBlock = Boolean(match) || raw.includes('\n');

            if (!isCodeBlock) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#282A2C] text-[#A8C7FA] font-mono text-[11px]"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            // 1. Mermaid 2D diagram
            if (language === 'mermaid') {
              return <MermaidRenderer code={raw} isStreaming={isStreaming} />;
            }

            // 2. 3D Model visualizer
            if (language === 'vis-3d' || language === 'vis3d') {
              return <Vis3dRenderer rawCode={raw} isStreaming={isStreaming} />;
            }

            // 3. 3D Atom Model (atom-3d / atom3d / atom)
            if (language === 'atom-3d' || language === 'atom3d' || language === 'atom') {
              return <MemoizedAtomBlock raw={raw} />;
            }

            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
});
