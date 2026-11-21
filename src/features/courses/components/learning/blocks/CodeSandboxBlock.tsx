'use client';

import React, { useEffect, useRef, useState } from 'react';

interface CodeSandboxBlockProps {
  content: Record<string, unknown>;
  isEditorMode: boolean;
  onChange: (nextContent: Record<string, unknown>) => void;
}

export function CodeSandboxBlock({
  content,
  isEditorMode,
  onChange,
}: CodeSandboxBlockProps) {
  const language = String(content.language || 'javascript') as
    | 'javascript'
    | 'python'
    | 'java'
    | 'cpp'
    | 'sql';
  const title = String(content.title ?? '');
  const initialCode = String(content.initialCode ?? '');
  const expectedOutput = String(content.expectedOutput ?? '');
  const allowRun = content.allowRun !== false;

  const [studentCode, setStudentCode] = useState(initialCode);
  const [outputLines, setOutputLines] = useState<string[]>([]);
  const [runError, setRunError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const runIdRef = useRef(0);

  useEffect(() => {
    setStudentCode(initialCode);
  }, [initialCode]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;
      const msg = event.data as {
        source?: string;
        runId?: number;
        logs?: string[];
        error?: string | null;
      };
      if (msg.source !== 'ilms-js-sandbox' || msg.runId !== runIdRef.current) {
        return;
      }
      setIsRunning(false);
      setOutputLines(Array.isArray(msg.logs) ? msg.logs : []);
      setRunError(msg.error || null);
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleRunCode = () => {
    if (language !== 'javascript') {
      setOutputLines([]);
      setRunError(
        `Môi trường chạy trực tiếp trên trình duyệt hiện hỗ trợ JavaScript. Ngôn ngữ ${language.toUpperCase()} cần kết nối Judge0 Sandbox ở Backend.`
      );
      return;
    }

    const runId = ++runIdRef.current;
    setIsRunning(true);
    setRunError(null);
    setOutputLines([]);

    const iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', 'allow-scripts');
    iframe.style.display = 'none';
    const serializedCode = JSON.stringify(isEditorMode ? initialCode : studentCode);
    iframe.srcdoc = `<!DOCTYPE html><html><body><script>
      (function() {
        var logs = [];
        console.log = function() {
          logs.push(Array.prototype.slice.call(arguments).map(function(a) {
            try { return typeof a === 'object' ? JSON.stringify(a) : String(a); } catch (e) { return String(a); }
          }).join(' '));
        };
        try {
          var fn = new Function(${serializedCode});
          var result = fn();
          if (result !== undefined) logs.push(String(result));
          parent.postMessage({ source: 'ilms-js-sandbox', runId: ${runId}, logs: logs, error: null }, '*');
        } catch (err) {
          parent.postMessage({ source: 'ilms-js-sandbox', runId: ${runId}, logs: logs, error: err && err.message ? err.message : String(err) }, '*');
        }
      })();
    <\/script></body></html>`;

    document.body.appendChild(iframe);
    setTimeout(() => {
      iframe.remove();
      setIsRunning(false);
    }, 1500);
  };

  const activeCode = isEditorMode ? initialCode : studentCode;

  return (
    <div className="rounded-2xl overflow-hidden bg-slate-950 text-slate-100 border border-slate-800 shadow-sm">
      {/* Toolbar */}
      <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="material-symbols-outlined text-[18px] text-emerald-400">
            terminal
          </span>
          {isEditorMode ? (
            <input
              type="text"
              value={title}
              onChange={(e) => onChange({ ...content, title: e.target.value })}
              placeholder="Tên bài thực hành code..."
              className="bg-transparent border-none outline-none text-xs font-bold text-white"
            />
          ) : (
            <span className="text-xs font-bold text-white truncate">
              {title || 'Code Sandbox'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isEditorMode ? (
            <select
              value={language}
              onChange={(e) => onChange({ ...content, language: e.target.value })}
              className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-[11px] font-bold border border-slate-700 outline-none"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="sql">SQL</option>
            </select>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono uppercase">
              {language}
            </span>
          )}

          {allowRun && (
            <button
              type="button"
              disabled={isRunning}
              onClick={handleRunCode}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold border-none cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[15px]">
                play_arrow
              </span>
              <span>{isRunning ? 'Đang chạy...' : 'Chạy thử'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Code Area */}
      <textarea
        value={activeCode}
        onChange={(e) => {
          if (isEditorMode) {
            onChange({ ...content, initialCode: e.target.value });
          } else {
            setStudentCode(e.target.value);
          }
        }}
        rows={Math.max(5, Math.min(18, activeCode.split('\n').length + 1))}
        spellCheck={false}
        className="w-full p-4 bg-slate-950 font-mono text-xs text-emerald-300 leading-relaxed outline-none border-none resize-y"
      />

      {isEditorMode && (
        <div className="px-4 py-2.5 bg-slate-900/70 border-t border-slate-800">
          <input
            type="text"
            value={expectedOutput}
            onChange={(e) =>
              onChange({ ...content, expectedOutput: e.target.value })
            }
            placeholder="Output kỳ vọng (tùy chọn)..."
            className="w-full bg-slate-800/80 px-3 py-1.5 rounded-lg text-[11px] font-mono text-slate-200 border-none outline-none"
          />
        </div>
      )}

      {/* Console Output */}
      {(outputLines.length > 0 || runError) && (
        <div className="px-4 py-3 bg-black/50 border-t border-slate-800 font-mono text-xs space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
            Kết quả thực thi (Console)
          </div>
          {outputLines.map((line, i) => (
            <div key={i} className="text-slate-100 whitespace-pre-wrap">
              &gt; {line}
            </div>
          ))}
          {runError && (
            <div className="text-rose-400 whitespace-pre-wrap">{runError}</div>
          )}
          {expectedOutput &&
            !runError &&
            outputLines.join('\n').trim() === expectedOutput.trim() && (
              <div className="text-emerald-400 text-[11px] font-sans font-semibold pt-1">
                ✔ Khớp với kết quả mong đợi!
              </div>
            )}
        </div>
      )}
    </div>
  );
}
