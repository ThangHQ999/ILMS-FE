'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

/**
 * Lightweight GitHub-Flavored Markdown renderer for announcements, descriptions, and posts.
 */
export function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  return (
    <div
      className={`text-xs sm:text-sm text-gray-800 dark:text-[#C4C7C5] leading-relaxed space-y-2 break-words ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-[#E3E3E3] mt-2 mb-1">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-[#E3E3E3] mt-2 mb-1">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-[#E3E3E3] mt-1.5 mb-0.5">
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="leading-relaxed">{children}</p>,
          ul: ({ children }) => (
            <ul className="list-disc pl-5 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 space-y-1">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-[#A8C7FA] underline hover:opacity-80 font-medium"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-blue-500/60 dark:border-[#A8C7FA]/60 pl-3 py-0.5 text-gray-600 dark:text-[#8E918F] italic">
              {children}
            </blockquote>
          ),
          code: ({ className: codeClassName, children }) => {
            const isBlock = Boolean(codeClassName);
            if (isBlock) {
              return (
                <code className="block w-full overflow-x-auto rounded-xl bg-[#F0F4F8] dark:bg-[#131314] p-3 font-mono text-xs text-gray-900 dark:text-[#E3E3E3]">
                  {children}
                </code>
              );
            }
            return (
              <code className="px-1.5 py-0.5 rounded-md bg-[#F0F4F8] dark:bg-[#131314] font-mono text-xs text-blue-700 dark:text-[#A8C7FA]">
                {children}
              </code>
            );
          },
          pre: ({ children }) => <pre className="overflow-x-auto">{children}</pre>,
          hr: () => <hr className="border-black/10 dark:border-white/10 my-2" />,
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900 dark:text-[#E3E3E3]">
              {children}
            </strong>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="px-2.5 py-1.5 font-semibold bg-[#F0F4F8] dark:bg-[#131314] text-gray-900 dark:text-[#E3E3E3] border-b border-black/10 dark:border-white/10">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-2.5 py-1.5 border-b border-black/5 dark:border-white/5">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
