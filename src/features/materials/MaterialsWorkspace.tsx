'use client';

import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useLocale } from 'next-intl';
import { DraftGraphEditor } from './DraftGraphEditor';
import { ApiError } from '@/types/common';
import { materials, type Draft, type Job, type JobSummary } from './materials-api';

const active = new Set(['QUEUED', 'PROCESSING', 'PUBLISHING']);
const input = 'rounded border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-600';
const button = 'rounded bg-blue-700 px-3 py-2 text-white disabled:opacity-40';

export function MaterialsWorkspace() {
  const locale = useLocale();
  const vi = locale.startsWith('vi');
  const t = (vn: string, en: string) => vi ? vn : en;
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [job, setJob] = useState<Job | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [text, setText] = useState('');
  const [saved, setSaved] = useState('');
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState('');
  const dirty = text !== saved;
  const jobId = job?.jobId;
  const jobStatus = job?.status;
  const editable = !!draft && jobStatus === 'AWAITING_REVIEW';

  const apply = useCallback((next: Job) => {
    const graph = next.draft ? JSON.stringify(next.draft.graph, null, 2) : '';
    setJob(next);
    setDraft(next.draft);
    setText(graph);
    setSaved(graph);
    setSaveError('');
  }, []);

  const refreshList = useCallback(async () => {
    setJobs(await materials.list());
  }, []);

  useEffect(() => {
    void refreshList().catch((failure: Error) => setError(failure.message));
  }, [refreshList]);

  useEffect(() => {
    if (!jobId || !jobStatus || !active.has(jobStatus)) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const next = await materials.get(jobId);
        if (stopped) return;
        if (active.has(next.status)) {
          setJob(next);
          timer = setTimeout(poll, 2500);
        } else {
          apply(next);
          void refreshList().catch(() => {});
        }
      } catch (failure) {
        if (stopped) return;
        setError((failure as Error).message);
        timer = setTimeout(poll, 5000);
      }
    };
    timer = setTimeout(poll, 1500);
    return () => { stopped = true; clearTimeout(timer); };
  }, [apply, jobId, jobStatus, refreshList]);

  useEffect(() => {
    if (!editable || !draft || !jobId || !dirty || busy || saving || saveError) return;
    let graph: Record<string, unknown>;
    try {
      graph = JSON.parse(text);
      if (!graph || typeof graph !== 'object' || Array.isArray(graph)) return;
    } catch {
      return;
    }
    const timer = setTimeout(() => {
      setSaving(true);
      void materials.save(jobId, draft, graph)
        .then((revision) => {
          setDraft(revision);
          setSaved(text);
        })
        .catch((failure: ApiError) => setSaveError(failure.httpStatus === 409
          ? (vi ? 'Bản nháp đã thay đổi trên server. Hãy sao chép phần đang sửa rồi mở lại bản mới.' : 'The draft changed on the server. Copy your edits and reload the latest revision.')
          : failure.message))
        .finally(() => setSaving(false));
    }, 800);
    return () => clearTimeout(timer);
  }, [busy, dirty, draft, editable, jobId, saveError, saving, text, vi]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  async function action(work: () => Promise<void>) {
    setBusy(true);
    setError('');
    try {
      await work();
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (!form.get('courseId')) form.delete('courseId');
    void action(async () => {
      const created = await materials.upload(form);
      apply(await materials.get(created.jobId));
      await refreshList();
    });
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6 text-slate-900 dark:text-slate-100">
      <h1 className="text-2xl font-bold">{t('Xử lý học liệu', 'Material ingestion')}</h1>
      <form onSubmit={upload} className="flex flex-wrap items-end gap-3">
        <label className="grid gap-1">{t('Tài liệu', 'Document')}<input className={input} name="file" type="file" required /></label>
        <label className="grid gap-1">{t('Tiêu đề', 'Title')}<input className={input} name="title" required maxLength={255} /></label>
        <label className="grid gap-1">{t('Môn học', 'Subject')}<input className={input} name="subject" required maxLength={100} /></label>
        <label className="grid gap-1">{t('ID khóa học', 'Course ID')}<input className={input} name="courseId" /></label>
        <button className={button} disabled={busy || saving || dirty}>{t('Tải lên', 'Upload')}</button>
      </form>
      <label className="grid gap-1">
        {t('Học liệu đã lưu', 'Saved materials')}
        <select className={input} value={jobId ?? ''} disabled={busy || saving || dirty}
          onChange={(event) => { const id = event.target.value; if (id) void action(async () => apply(await materials.get(id))); }}>
          <option value="">{t('Chọn học liệu', 'Select material')}</option>
          {jobs.map((item) => <option key={item.jobId} value={item.jobId}>{item.title} · {item.status}</option>)}
        </select>
      </label>
      {error && <p role="alert">{error}</p>}
      {job && <p role="status">{job.status} {job.stage} {job.errorCode}</p>}
      {job?.status === 'FAILED' && <button className={button} disabled={busy}
        onClick={() => void action(async () => { await materials.retry(job.jobId); apply(await materials.get(job.jobId)); })}>
        {t('Thử lại', 'Retry')}</button>}
      {draft && (
        <section className="space-y-3">
          <p role="status">{t('Bản sửa', 'Revision')} {draft.revision} · {draft.reviewStatus} ·
            {saving ? t(' Đang lưu', ' Saving') : dirty ? t(' Chưa lưu', ' Unsaved') : t(' Đã lưu', ' Saved')}</p>
          {draft.validation?.parser_warnings?.map((warning) => <p key={warning}>{warning}</p>)}
          {job && <DraftGraphEditor key={job.jobId} jobId={job.jobId} revisionId={draft.id}
            jobStatus={job.status} text={text} editable={editable && !busy} onChange={setText} />}
          <details><summary>{t('Sửa nâng cao (JSON)', 'Advanced edit (JSON)')}</summary>
          <label className="grid gap-1">{t('Đồ thị nháp (JSON)', 'Draft graph (JSON)')}
            <textarea className={`${input} min-h-96 font-mono text-sm`} value={text} readOnly={!editable || busy}
              onChange={(event) => setText(event.target.value)} spellCheck={false} /></label></details>
          <details><summary>{t('Bằng chứng nguồn', 'Source evidence')}</summary>
            <pre className="max-h-96 overflow-auto whitespace-pre-wrap text-sm">{JSON.stringify(draft.source, null, 2)}</pre></details>
          {saveError && <p role="alert">{saveError}</p>}
          {dirty && jobId && <div className="flex gap-2">
            {saveError && <button className={button} disabled={busy || saving} onClick={() => setSaveError('')}>{t('Thử lưu lại', 'Retry save')}</button>}
            <button className={button} disabled={busy || saving} onClick={() => {
              if (window.confirm(t('Bỏ thay đổi chưa lưu và tải bản trên server?', 'Discard unsaved edits and reload the server draft?'))) {
                void action(async () => apply(await materials.get(jobId)));
              }
            }}>{t('Mở lại bản đã lưu', 'Reload saved draft')}</button>
          </div>}
          {editable && jobId && draft.reviewStatus === 'PENDING_REVIEW' && <div className="flex flex-wrap gap-2">
            {([['APPROVED', t('Duyệt và xuất bản', 'Approve and publish')],
              ['CHANGES_REQUESTED', t('Yêu cầu chỉnh sửa', 'Request changes')],
              ['REJECTED', t('Từ chối', 'Reject')]] as const).map(([decision, label]) => (
              <button key={decision} className={button} disabled={busy || saving || dirty}
                onClick={() => void action(async () => {
                  await materials.review(jobId, draft, decision);
                  apply(await materials.get(jobId));
                  await refreshList();
                })}>{label}</button>))}
          </div>}
        </section>
      )}
    </main>
  );
}
