'use client';

import { useEffect, useMemo, useState } from 'react';
import { Background, Controls, ReactFlow, type Edge, type Node } from '@xyflow/react';
import { useLocale } from 'next-intl';
import '@xyflow/react/dist/style.css';
import { materials, type DraftGraph } from './materials-api';

const columns: Record<string, number> = {
  Topic: 0, Chunk: 0, KnowledgeEntity: 1, Definition: 2, Exercise: 2,
  Process: 2, Example: 2, Argument: 2, ExerciseStep: 3, ProcessStep: 3,
};
const editableFields: Record<string, string[]> = {
  Topic: ['name', 'summary'], KnowledgeEntity: ['name', 'description'],
  Definition: ['content'], Exercise: ['title', 'content'], Process: ['name', 'description'],
  Example: ['title', 'explanation', 'code_snippet'], Argument: ['hypothesis', 'evidence', 'conclusion'],
  ExerciseStep: ['action'], ProcessStep: ['action'],
};

type Graph = Record<string, unknown>;
type Props = {
  jobId: string;
  revisionId: string;
  jobStatus: string;
  text: string;
  editable: boolean;
  onChange: (text: string) => void;
};

function object(value: unknown): Graph | null {
  return value && typeof value === 'object' ? value as Graph : null;
}

function findAt(graph: Graph | null, path: string) {
  return path.split('/').reduce<Graph | null>((value, key) => object(value?.[key]), graph);
}

export function DraftGraphEditor({ jobId, revisionId, jobStatus, text, editable, onChange }: Props) {
  const vi = useLocale().startsWith('vi');
  const t = (vn: string, en: string) => vi ? vn : en;
  const [snapshot, setSnapshot] = useState<DraftGraph | null>(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [selectedPath, setSelectedPath] = useState('');
  useEffect(() => {
    let current = true;
    void materials.graph(jobId, revisionId).then((value) => {
      if (current) { setSnapshot(value); setError(''); }
    }).catch((failure: Error) => {
      if (current) setError(failure.message);
    });
    return () => { current = false; };
  }, [jobId, revisionId, jobStatus, retry]);

  const data = useMemo(() => {
    try { return object(JSON.parse(text)); } catch { return null; }
  }, [text]);
  const visible = snapshot?.revision_id === revisionId ? snapshot : null;
  const selected = visible?.nodes.find((node) => node.path === selectedPath);
  const entry = selected ? findAt(data, selected.path) : null;

  const diagram = useMemo(() => {
    const ordered = [...(visible?.nodes ?? [])].sort((a, b) => a.path.localeCompare(b.path, undefined, { numeric: true }));
    const rows = new Map<number, number>();
    const nodes: Node[] = ordered.map((item) => {
      const column = columns[item.kind] ?? 4;
      const row = rows.get(column) ?? 0;
      rows.set(column, row + 1);
      const current = findAt(data, item.path);
      const label = [current?.name, current?.title, current?.content, current?.action, item.label]
        .find((value): value is string => typeof value === 'string' && !!value.trim()) ?? item.kind;
      return {
        id: item.id, position: { x: column * 280, y: row * 92 },
        data: { label: `${item.kind} · ${label.slice(0, 85)}` },
        selected: item.path === selectedPath,
      };
    });
    const edges: Edge[] = (visible?.edges ?? []).map((edge) => ({
      id: `${edge.source}:${edge.kind}:${edge.target}`,
      source: edge.source, target: edge.target, label: edge.kind,
    }));
    return { nodes, edges };
  }, [data, selectedPath, visible]);

  function editField(field: string, value: string) {
    if (!data || !selected || !editable) return;
    const next = structuredClone(data);
    const target = findAt(next, selected.path);
    if (!target) return;
    if (selected.kind === 'KnowledgeEntity' && field === 'name') {
      const previousName = target.name;
      if (Array.isArray(next.topics)) {
        for (const topic of next.topics) {
          if (topic && Array.isArray(topic.concepts_included)) {
            topic.concepts_included = topic.concepts_included.map((name: unknown) =>
              typeof name === 'string' && typeof previousName === 'string'
              && name.trim().toLowerCase() === previousName.trim().toLowerCase() ? value : name);
          }
        }
      }
    }
    target[field] = value;
    onChange(JSON.stringify(next, null, 2));
  }

  function moveExercise(destination: number) {
    if (!data || !selected || !editable) return;
    const [, owner, key, index] = selected.path.split('/');
    const next = structuredClone(data);
    const from = findAt(next, `entities/${owner}`);
    const to = findAt(next, `entities/${destination}`);
    if (!from || !to || key !== 'exercises' || !Array.isArray(from.exercises) || owner === String(destination)) return;
    const moved = from.exercises.splice(Number(index), 1)[0];
    if (!moved) return;
    const exercises = Array.isArray(to.exercises) ? to.exercises : [];
    to.exercises = [...exercises, moved];
    setSelectedPath('');
    onChange(JSON.stringify(next, null, 2));
  }

  return (
    <section className="space-y-2">
      <h2 className="font-semibold">{t('Đồ thị theo revision', 'Revision graph')}</h2>
      {error && <p role="alert">{error} <button type="button" className="underline" onClick={() => { setError(''); setRetry(retry + 1); }}>{t('Tải lại', 'Reload')}</button></p>}
      {!visible && !error && <p role="status">{t('Đang tải đồ thị', 'Loading graph')}</p>}
      {visible && (
        <>
          <p role="status">{visible.status} · {diagram.nodes.length} {t('nút', 'nodes')}</p>
          <div className="h-[28rem] rounded border bg-slate-50 text-slate-900 dark:border-slate-600">
            <ReactFlow key={revisionId} nodes={diagram.nodes} edges={diagram.edges} fitView
              minZoom={0.05} nodesDraggable={false} nodesConnectable={false}
              onNodeClick={(_, node) => setSelectedPath(visible.nodes.find((item) => item.id === node.id)?.path ?? '')}>
              <Background />
              <Controls />
            </ReactFlow>
          </div>
          {selected && (
            <div className="space-y-2 rounded border p-3 dark:border-slate-600">
              <p className="font-semibold">{selected.kind} · {selected.label}</p>
              {editableFields[selected.kind]?.map((field) => (
                <label key={field} className="grid gap-1">
                  {field}
                  <textarea className="rounded border bg-transparent px-2 py-1 dark:border-slate-600" rows={2}
                    value={typeof entry?.[field] === 'string' ? entry[field] as string : ''}
                    readOnly={!editable || !entry} onChange={(event) => editField(field, event.target.value)} />
                </label>
              ))}
              {selected.kind === 'Exercise' && editable && Array.isArray(data?.entities) && (
                <label className="grid gap-1">{t('Chuyển bài tập sang khái niệm', 'Move exercise to concept')}
                  <select className="rounded border bg-transparent px-2 py-1 dark:border-slate-600"
                    value={selected.path.split('/')[1]} onChange={(event) => moveExercise(Number(event.target.value))}>
                    {data.entities.map((entity, index) => (
                      <option key={index} value={index}>{object(entity)?.name as string ?? index + 1}</option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
