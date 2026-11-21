'use client';

import React, { useEffect, useState, useRef, useId, useCallback, memo } from 'react';
import mermaid from 'mermaid';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';

export interface MermaidRendererProps {
  code: string;
  isStreaming?: boolean;
  className?: string;
}

// Global in-memory cache for rendered SVG diagrams across component re-renders
const svgRenderCache = new Map<string, string>();

/**
 * Helper to detect diagram type from first line or keyword
 */
function detectDiagramType(code: string): string {
  const firstWord = code.trim().split(/\s+/)[0]?.toLowerCase() || '';
  if (firstWord.startsWith('graph') || firstWord.startsWith('flowchart')) return 'Flowchart';
  if (firstWord.startsWith('sequencediagram')) return 'Sequence Diagram';
  if (firstWord.startsWith('classdiagram')) return 'Class Diagram';
  if (firstWord.startsWith('statediagram')) return 'State Diagram';
  if (firstWord.startsWith('erdiagram')) return 'ER Diagram';
  if (firstWord.startsWith('gantt')) return 'Gantt Chart';
  if (firstWord.startsWith('pie')) return 'Pie Chart';
  if (firstWord.startsWith('gitgraph')) return 'Git Graph';
  if (firstWord.startsWith('mindmap')) return 'Mindmap';
  if (firstWord.startsWith('quadrantchart')) return 'Quadrant Chart';
  if (firstWord.startsWith('timeline')) return 'Timeline';
  return '2D Diagram';
}

export const MermaidRenderer = memo(function MermaidRenderer({
  code,
  isStreaming = false,
  className = '',
}: MermaidRendererProps) {
  const t = useTranslations('aiTutor');
  const { resolvedTheme } = useTheme();
  const reactId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const containerId = useRef(`mermaid-${reactId}-${Math.random().toString(36).slice(2, 7)}`).current;

  const cleanCode = code.trim();
  const diagramType = detectDiagramType(cleanCode);
  const themeKey = resolvedTheme || 'dark';
  const cacheKey = `${themeKey}:::${cleanCode}`;

  // Check if we already have this exact SVG cached in memory
  const cachedSvg = svgRenderCache.get(cacheKey);

  const [svgHtml, setSvgHtml] = useState<string | null>(cachedSvg || null);
  const [isRendering, setIsRendering] = useState<boolean>(!cachedSvg && Boolean(cleanCode));
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isRawView, setIsRawView] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  const lastRenderedKeyRef = useRef<string | null>(cachedSvg ? cacheKey : null);
  const renderCounterRef = useRef(0);

  // Initialize mermaid configuration according to active theme
  const configureMermaid = useCallback(() => {
    const isDark = resolvedTheme === 'dark';
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      theme: isDark ? 'dark' : 'default',
      themeVariables: isDark
        ? {
            darkMode: true,
            background: '#0B0F19',
            mainBkg: '#1E293B',
            nodeBorder: '#3B82F6',
            textColor: '#E2E8F0',
            lineColor: '#60A5FA',
            primaryColor: '#1E293B',
            primaryTextColor: '#E2E8F0',
            primaryBorderColor: '#3B82F6',
            secondaryColor: '#0F172A',
            tertiaryColor: '#1E293B',
          }
        : {
            darkMode: false,
            background: '#FFFFFF',
            mainBkg: '#F8FAFC',
            nodeBorder: '#2563EB',
            textColor: '#0F172A',
            lineColor: '#2563EB',
            primaryColor: '#EFF6FF',
            primaryTextColor: '#1E3A8A',
            primaryBorderColor: '#3B82F6',
            secondaryColor: '#F1F5F9',
            tertiaryColor: '#FFFFFF',
          },
      fontFamily: 'inherit',
    });
  }, [resolvedTheme]);

  useEffect(() => {
    configureMermaid();
  }, [configureMermaid]);

  // Main rendering effect with persistent cache check
  useEffect(() => {
    let isCancelled = false;
    const currentRun = ++renderCounterRef.current;

    async function executeRender() {
      if (!cleanCode) {
        setSvgHtml(null);
        setIsRendering(false);
        setRenderError(null);
        return;
      }

      // If already rendered and in memory cache for this exact key, use it immediately
      if (svgRenderCache.has(cacheKey)) {
        const cached = svgRenderCache.get(cacheKey)!;
        if (!isCancelled && currentRun === renderCounterRef.current) {
          setSvgHtml(cached);
          setIsRendering(false);
          setRenderError(null);
          lastRenderedKeyRef.current = cacheKey;
        }
        return;
      }

      // If already rendered in this component instance, don't re-render
      if (lastRenderedKeyRef.current === cacheKey && svgHtml) {
        return;
      }

      // Special handling for SSE Streaming:
      // If code is still streaming and not complete yet, test with parse without throwing
      if (isStreaming) {
        try {
          const isValid = await mermaid.parse(cleanCode, { suppressErrors: true });
          if (!isValid) {
            // Diagram syntax is still incomplete or unclosed during token stream
            if (!isCancelled && currentRun === renderCounterRef.current) {
              setIsRendering(true);
              setRenderError(null);
            }
            return;
          }
        } catch {
          if (!isCancelled && currentRun === renderCounterRef.current) {
            setIsRendering(true);
            setRenderError(null);
          }
          return;
        }
      }

      // Attempt parsing and rendering SVG
      try {
        // Do not flip isRendering to true if we already have an SVG displayed
        if (!svgHtml) {
          setIsRendering(true);
        }
        setRenderError(null);

        // Validate syntax first
        const isValid = await mermaid.parse(cleanCode, { suppressErrors: true });
        if (!isValid) {
          if (!isCancelled && currentRun === renderCounterRef.current) {
            setRenderError(t('mermaidSyntaxError'));
            setIsRendering(false);
          }
          return;
        }

        // Render SVG with unique DOM ID
        const renderKey = `render-${containerId}-${currentRun}`;
        const { svg } = await mermaid.render(renderKey, cleanCode);

        // Store into global cache to prevent future re-renders
        svgRenderCache.set(cacheKey, svg);

        if (!isCancelled && currentRun === renderCounterRef.current) {
          setSvgHtml(svg);
          setIsRendering(false);
          setRenderError(null);
          lastRenderedKeyRef.current = cacheKey;
        }
      } catch (err: unknown) {
        // Remove any residual error DOM elements inserted by mermaid
        const errorElement = document.getElementById(`d${containerId}`);
        if (errorElement) {
          errorElement.remove();
        }

        if (!isCancelled && currentRun === renderCounterRef.current) {
          // If streaming, suppress error until stream finishes
          if (isStreaming) {
            setIsRendering(true);
          } else {
            const msg = err instanceof Error ? err.message : t('mermaidSyntaxError');
            setRenderError(msg);
            setIsRendering(false);
          }
        }
      }
    }

    executeRender();

    return () => {
      isCancelled = true;
    };
  }, [cleanCode, isStreaming, cacheKey, containerId, svgHtml, t]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(cleanCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadSvg = () => {
    if (!svgHtml) return;
    const blob = new Blob([svgHtml], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mermaid-${diagramType.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // State: Streaming & Incomplete Syntax
  if (isStreaming && (isRendering || !svgHtml)) {
    return (
      <div className={`rounded-xl border border-blue-200 dark:border-transparent bg-blue-50/40 dark:bg-[#162B4D] overflow-hidden my-3.5 ${className}`}>
        <div className="flex items-center justify-between px-4 py-2.5 bg-blue-100/50 dark:bg-[#162B4D] border-b border-blue-200/60 dark:border-transparent text-blue-800 dark:text-[#A8C7FA]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            <span className="text-xs font-semibold font-mono tracking-wide">
              {diagramType} • {t('mermaidStreaming')}
            </span>
          </div>
          <span className="text-[11px] text-blue-600 dark:text-[#A8C7FA] font-mono">SSE Stream</span>
        </div>
        <pre className="p-4 text-xs font-mono text-slate-700 dark:text-[#C4C7C5] overflow-x-auto bg-[#1E1F20] text-[#E3E3E3]">
          <code>{cleanCode}</code>
        </pre>
      </div>
    );
  }

  // State: Render Syntax Error (stream finished or invalid syntax)
  if (renderError && !isStreaming && !svgHtml) {
    return (
      <div className={`rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-[#3C2A1E] overflow-hidden my-3.5 ${className}`}>
        <div className="flex items-center justify-between px-4 py-2 bg-amber-100/60 dark:bg-[#3C2A1E] border-b border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-[#FFB784]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-amber-600 dark:text-[#FFB784]">
              warning
            </span>
            <span className="text-xs font-medium">{t('mermaidSyntaxError')}</span>
          </div>
          <button
            onClick={handleCopyCode}
            type="button"
            className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-amber-200/60 hover:bg-amber-200 dark:bg-[#3C2A1E] dark:hover:bg-amber-800 text-amber-900 dark:text-amber-200 transition-colors"
          >
            <span className="material-symbols-outlined text-[13px]">
              {copied ? 'check' : 'content_copy'}
            </span>
            <span>{copied ? t('codeCopied') : t('copyCode')}</span>
          </button>
        </div>
        <pre className="p-3.5 text-xs font-mono text-[#E3E3E3] bg-[#0f172a] overflow-x-auto">
          <code>{cleanCode}</code>
        </pre>
      </div>
    );
  }

  // Normal State: Successfully Rendered SVG
  return (
    <>
      <div className={`rounded-xl border border-slate-200 dark:border-transparent bg-white dark:bg-[#131314] overflow-hidden shadow-xs my-4 transition-all duration-200 ${className}`}>
        {/* Toolbar Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-[#1E1F20] border-b border-slate-200 dark:border-transparent text-slate-700 dark:text-[#C4C7C5]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[17px] text-blue-600 dark:text-[#A8C7FA]">
              account_tree
            </span>
            <span className="text-xs font-semibold tracking-wide font-sans text-slate-800 dark:text-[#E3E3E3]">
              {diagramType}
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] rounded font-mono bg-blue-100 dark:bg-[#162B4D] text-blue-700 dark:text-[#A8C7FA] border border-blue-200 dark:border-transparent">
              Mermaid
            </span>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1">
            {/* Toggle Raw Code */}
            <button
              onClick={() => setIsRawView((prev) => !prev)}
              type="button"
              className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full transition-colors ${
                isRawView
                  ? 'bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] whitespace-nowrap'
                  : 'hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] text-slate-700 dark:text-[#C4C7C5]'
              }`}
              title={isRawView ? t('viewDiagram') : t('viewRawCode')}
            >
              <span className="material-symbols-outlined text-[14px]">
                {isRawView ? 'visibility' : 'code'}
              </span>
              <span className="hidden sm:inline">
                {isRawView ? t('viewDiagram') : t('viewRawCode')}
              </span>
            </button>

            {/* Copy Mermaid Code */}
            <button
              onClick={handleCopyCode}
              type="button"
              className="flex items-center gap-1 text-xs px-2 py-1 rounded hover:bg-slate-200/70 dark:hover:bg-[#282A2C] text-slate-600 dark:text-[#C4C7C5] transition-colors"
              title={t('copyCode')}
            >
              <span className="material-symbols-outlined text-[14px]">
                {copied ? 'check' : 'content_copy'}
              </span>
            </button>

            {/* Download SVG */}
            {svgHtml && !isRawView && (
              <button
                onClick={handleDownloadSvg}
                type="button"
                className="flex items-center gap-1 text-xs px-2 py-1 rounded hover:bg-slate-200/70 dark:hover:bg-[#282A2C] text-slate-600 dark:text-[#C4C7C5] transition-colors"
                title={t('downloadSvg')}
              >
                <span className="material-symbols-outlined text-[14px]">download</span>
              </button>
            )}

            {/* Fullscreen Zoom */}
            {svgHtml && !isRawView && (
              <button
                onClick={() => setIsFullscreen(true)}
                type="button"
                className="flex items-center gap-1 text-xs px-2 py-1 rounded hover:bg-slate-200/70 dark:hover:bg-[#282A2C] text-slate-600 dark:text-[#C4C7C5] transition-colors"
                title={t('zoomFullscreen')}
              >
                <span className="material-symbols-outlined text-[14px]">fullscreen</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Body: SVG or Raw Code */}
        {isRawView ? (
          <pre className="p-4 text-xs font-mono text-[#E3E3E3] bg-[#0f172a] overflow-x-auto leading-relaxed border-t border-[#282A2C]">
            <code>{cleanCode}</code>
          </pre>
        ) : (
          <div className="p-4 sm:p-6 flex items-center justify-center overflow-x-auto bg-slate-50/50 dark:bg-[#131314] min-h-[140px]">
            {svgHtml ? (
              <div
                className="mermaid-svg-container w-full flex justify-center [&>svg]:max-w-full [&>svg]:h-auto [&>svg]:mx-auto"
                dangerouslySetInnerHTML={{ __html: svgHtml }}
              />
            ) : (
              <div className="py-8 flex items-center gap-2 text-xs text-[#8E918F] font-mono">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span>{t('mermaidRendering')}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fullscreen Modal View */}
      {isFullscreen && svgHtml && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col p-4 md:p-8 animate-in fade-in">
          <div className="flex items-center justify-between pb-4 text-white">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#A8C7FA]">
                account_tree
              </span>
              <span className="font-semibold text-sm">{diagramType} • {t('zoomFullscreen')}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadSvg}
                type="button"
                className="px-3 py-1.5 rounded-lg bg-[#1E1F20] hover:bg-[#282A2C] text-xs flex items-center gap-1.5 text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">download</span>
                <span>{t('downloadSvg')}</span>
              </button>
              <button
                onClick={() => setIsFullscreen(false)}
                type="button"
                className="p-1.5 rounded-lg bg-[#1E1F20] hover:bg-[#282A2C] text-white transition-colors"
                title="Đóng toàn màn hình"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-white dark:bg-[#1E1F20] rounded-2xl p-6 md:p-12 flex items-center justify-center border border-[#282A2C]">
            <div
              className="w-full h-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:h-auto"
              dangerouslySetInnerHTML={{ __html: svgHtml }}
            />
          </div>
        </div>
      )}
    </>
  );
});
