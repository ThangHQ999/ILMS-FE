'use client';

import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import dynamic from 'next/dynamic';
import 'katex/dist/katex.min.css';
import { preprocessLatex } from '@/lib/latex';

// Dynamic imports with ssr: false to isolate DOM/window and Three.js from SSR
const MermaidRenderer = dynamic(
  () => import('./MermaidRenderer').then((mod) => mod.MermaidRenderer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-28 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/40 p-4 flex items-center justify-center text-slate-400 text-xs">
        Đang tải đồ thị Mermaid...
      </div>
    ),
  }
);

const Vis3dRenderer = dynamic(
  () => import('./Vis3dRenderer').then((mod) => mod.Vis3dRenderer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-44 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900/40 p-4 flex items-center justify-center text-slate-400 text-xs">
        Đang tải không gian 3D...
      </div>
    ),
  }
);

const Atom3DViewer = dynamic(
  () => import('./Atom3DViewer').then((mod) => mod.Atom3DViewer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-56 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 flex items-center justify-center text-slate-400 text-xs">
        Đang tải mô hình nguyên tử 3D...
      </div>
    ),
  }
);

// Component memoized riêng cho khối nguyên tử 3D, tránh parse lại JSON khi chat typing
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

interface AiTutorMarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
  className?: string;
}

export const AiTutorMarkdownRenderer = React.memo(function AiTutorMarkdownRenderer({
  content,
  isStreaming = false,
  className = '',
}: AiTutorMarkdownRendererProps) {
  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({});

  const processedContent = useMemo(() => preprocessLatex(content), [content]);

  const handleCopyCode = (codeText: string, key: string) => {
    navigator.clipboard.writeText(codeText).then(() => {
      setCopiedMap((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedMap((prev) => ({ ...prev, [key]: false }));
      }, 2000);
    });
  };

  return (
    <div className={`text-[15px] leading-relaxed text-slate-800 dark:text-slate-200 space-y-3.5 socratic-markdown-root ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
        components={{
          p({ children }) {
            return <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>;
          },
          strong({ children }) {
            return (
              <strong className="font-semibold text-slate-900 dark:text-slate-100">
                {children}
              </strong>
            );
          },
          em({ children }) {
            return <em className="italic text-slate-700 dark:text-slate-300">{children}</em>;
          },
          ul({ children }) {
            return <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>;
          },
          li({ children }) {
            return <li className="leading-relaxed">{children}</li>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-blue-500 pl-3.5 py-1 my-2 bg-blue-50/50 dark:bg-blue-950/20 text-slate-700 dark:text-slate-300 rounded-r-lg italic">
                {children}
              </blockquote>
            );
          },
          table({ children }) {
            return (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs my-3.5 bg-white dark:bg-slate-900">
                <table className="w-full text-left text-[13.5px] border-collapse">{children}</table>
              </div>
            );
          },
          thead({ children }) {
            return (
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700/80">
                {children}
              </thead>
            );
          },
          th({ children }) {
            return <th className="py-2.5 px-4 font-semibold">{children}</th>;
          },
          tbody({ children }) {
            return (
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                {children}
              </tbody>
            );
          },
          tr({ children }) {
            return <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">{children}</tr>;
          },
          td({ children }) {
            return <td className="py-2.5 px-4">{children}</td>;
          },
          code({ className, children, ...props }: React.ComponentProps<'code'>) {
            const raw = String(children).replace(/\n$/, '');
            const match = /language-([\w-]+)/.exec(className || '');
            const language = match ? match[1].toLowerCase() : '';
            const isCodeBlock = Boolean(match) || raw.includes('\n');

            if (!isCodeBlock) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-amber-700 dark:text-amber-400 font-mono text-[13px] font-semibold border border-slate-200 dark:border-slate-700/80"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            // 1. Mermaid 2D Diagram
            if (language === 'mermaid') {
              return <MermaidRenderer code={raw} isStreaming={isStreaming} />;
            }

            // 2. 3D Model Visualizer (vis-3d / vis3d)
            if (language === 'vis-3d' || language === 'vis3d') {
              return <Vis3dRenderer rawCode={raw} isStreaming={isStreaming} />;
            }

            // 3. 3D Atom Model (atom-3d / atom3d / atom)
            if (language === 'atom-3d' || language === 'atom3d' || language === 'atom') {
              return <MemoizedAtomBlock raw={raw} />;
            }

            // 4. Standard Code Snippet (python, cpp, js, sql, etc.)
            const codeKey = raw.slice(0, 24);
            const isCopied = copiedMap[codeKey];

            return (
              <div className="rounded-xl overflow-hidden bg-[#0f172a] shadow-md border border-slate-800 font-mono text-[13px] my-3.5">
                <div className="flex items-center justify-between px-4 py-2 bg-[#1e293b]/80 border-b border-slate-700/60 text-slate-300">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                    </div>
                    <span className="ml-2 text-xs font-sans text-slate-300 font-medium tracking-wide">
                      {language ? `${language.toUpperCase()} Snippet` : 'Code Snippet'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyCode(raw, codeKey)}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-slate-700/70 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {isCopied ? 'check' : 'content_copy'}
                    </span>
                    <span>{isCopied ? 'Đã sao chép!' : 'Sao chép mã'}</span>
                  </button>
                </div>
                <pre className="p-4 text-slate-200 overflow-x-auto leading-relaxed">
                  <code>{children}</code>
                </pre>
              </div>
            );
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
});
