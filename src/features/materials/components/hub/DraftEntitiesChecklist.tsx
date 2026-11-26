'use client';

import React, { useMemo, useState } from 'react';
import { useConfirm } from '@/components/shared';
import {
  extractDraftGraphOverview,
  type IngestionDraft,
} from '../../schemas/ingestion.schema';
import {
  addEntityToDraft,
  addRelationToDraft,
  addTopicToDraft,
  deleteEntityFromDraft,
  deleteRelationFromDraft,
  deleteTopicFromDraft,
  parseDraftGraph,
  stringifyDraftGraph,
  type DraftEntity,
} from '../../utils/draft-graph-crud';
import { DraftCreateEntityModal } from './modals/DraftCreateEntityModal';
import { DraftCreateRelationModal } from './modals/DraftCreateRelationModal';
import { DraftCreateTopicModal } from './modals/DraftCreateTopicModal';
import { DraftEntityEditorModal } from './modals/DraftEntityEditorModal';

interface DraftEntitiesChecklistProps {
  draft: IngestionDraft;
  text?: string;
  editable?: boolean;
  onChange?: (newText: string) => void;
}

export function DraftEntitiesChecklist({
  draft,
  text,
  editable = false,
  onChange,
}: DraftEntitiesChecklistProps) {
  const confirm = useConfirm();
  const [search, setSearch] = useState('');
  const [showEvidence, setShowEvidence] = useState(false);

  // Modal dialog states
  const [isAddEntityOpen, setIsAddEntityOpen] = useState(false);
  const [isAddRelationOpen, setIsAddRelationOpen] = useState(false);
  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);
  const [editingEntityIndex, setEditingEntityIndex] = useState<number | null>(null);

  // Parse draft data from text if provided, otherwise from draft.graph
  const draftData = useMemo(() => {
    if (text) return parseDraftGraph(text);
    return parseDraftGraph(JSON.stringify(draft.graph ?? {}));
  }, [draft.graph, text]);

  const overview = useMemo(
    () => extractDraftGraphOverview(draftData as unknown as Record<string, unknown>),
    [draftData]
  );

  const filteredEntities = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return overview.entities;
    return overview.entities.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.definition.toLowerCase().includes(q)
    );
  }, [overview.entities, search]);

  const rawRelations = Array.isArray(draftData.knowledge_relations)
    ? draftData.knowledge_relations
    : [];

  const handleUpdateEntity = (updated: DraftEntity) => {
    if (editingEntityIndex === null || !onChange) return;
    const next = structuredClone(draftData);
    if (Array.isArray(next.entities) && next.entities[editingEntityIndex]) {
      const prevName = next.entities[editingEntityIndex].name;
      next.entities[editingEntityIndex] = updated;

      // Rename references across topics and relations
      if (prevName && updated.name && prevName.toLowerCase() !== updated.name.toLowerCase()) {
        if (Array.isArray(next.topics)) {
          for (const topic of next.topics) {
            if (Array.isArray(topic.concepts_included)) {
              topic.concepts_included = topic.concepts_included.map((c) =>
                c.trim().toLowerCase() === prevName.trim().toLowerCase()
                  ? updated.name.trim()
                  : c
              );
            }
          }
        }
        if (Array.isArray(next.knowledge_relations)) {
          for (const rel of next.knowledge_relations) {
            if (rel.source.trim().toLowerCase() === prevName.trim().toLowerCase()) {
              rel.source = updated.name.trim();
            }
            if (rel.target.trim().toLowerCase() === prevName.trim().toLowerCase()) {
              rel.target = updated.name.trim();
            }
          }
        }
      }

      onChange(stringifyDraftGraph(next));
    }
  };

  const handleDeleteEntity = (index: number) => {
    if (!onChange) return;
    const next = deleteEntityFromDraft(draftData, index);
    onChange(stringifyDraftGraph(next));
  };

  const handleDeleteRelation = (relIdx: number) => {
    if (!onChange) return;
    const next = deleteRelationFromDraft(draftData, relIdx);
    onChange(stringifyDraftGraph(next));
  };

  const handleDeleteTopic = (topIdx: number) => {
    if (!onChange) return;
    const next = deleteTopicFromDraft(draftData, topIdx);
    onChange(stringifyDraftGraph(next));
  };

  return (
    <div className="flex flex-col gap-5 text-left">
      {/* Structured Metrics Strip & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 flex-1">
          <div className="rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/50 p-3">
            <div className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">
              Thực thể tri thức
            </div>
            <div className="text-xl font-extrabold text-blue-900 dark:text-blue-100 mt-0.5">
              {overview.entities.length}
            </div>
          </div>
          <div className="rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/50 p-3">
            <div className="text-[11px] font-semibold text-purple-700 dark:text-purple-300">
              Chủ đề (Topics)
            </div>
            <div className="text-xl font-extrabold text-purple-900 dark:text-purple-100 mt-0.5">
              {overview.topics.length}
            </div>
          </div>
          <div className="rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/50 p-3">
            <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
              Quan hệ đồ thị
            </div>
            <div className="text-xl font-extrabold text-emerald-900 dark:text-emerald-100 mt-0.5">
              {rawRelations.length}
            </div>
          </div>
        </div>

        {editable && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsAddEntityOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0059bb] hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>+ Thêm thực thể</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAddRelationOpen(true)}
              disabled={!draftData.entities || draftData.entities.length < 2}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[16px]">hub</span>
              <span>+ Nối quan hệ</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAddTopicOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 text-xs font-bold cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">folder_special</span>
              <span>+ Thêm chủ đề</span>
            </button>
          </div>
        )}
      </div>

      {/* Topics Chips */}
      {overview.topics.length > 0 && (
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Chủ đề được AI &amp; Giảng viên gom nhóm ({overview.topics.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {overview.topics.map((topic, idx) => (
              <div
                key={`${topic.name}-${idx}`}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-2"
              >
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {topic.name}
                </span>
                {topic.conceptsIncluded.length > 0 && (
                  <span className="text-slate-400 text-[11px]">
                    ({topic.conceptsIncluded.length} khái niệm)
                  </span>
                )}
                {editable && (
                  <button
                    type="button"
                    onClick={() => handleDeleteTopic(idx)}
                    className="text-slate-400 hover:text-rose-500 cursor-pointer p-0.5"
                    title="Xóa chủ đề này"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Bar & Evidence Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <span className="material-symbols-outlined text-[18px] text-slate-400 absolute left-3 top-1/2 -translate-y-1/2">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm nhanh thực thể, định nghĩa hoặc mô tả..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowEvidence((prev) => !prev)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">
            {showEvidence ? 'visibility_off' : 'format_quote'}
          </span>
          <span>{showEvidence ? 'Ẩn bằng chứng nguồn' : 'Xem bằng chứng nguồn'}</span>
        </button>
      </div>

      {/* Entities List with Full CRUD */}
      {filteredEntities.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
          <p>Không tìm thấy thực thể tri thức nào phù hợp.</p>
          {editable && (
            <button
              type="button"
              onClick={() => setIsAddEntityOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#0059bb] text-white text-xs font-bold cursor-pointer"
            >
              + Tạo thực thể đầu tiên
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
          {filteredEntities.map((entity) => (
            <div
              key={`${entity.name}-${entity.index}`}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 space-y-2.5 transition-all hover:border-blue-300 dark:hover:border-blue-700"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                    {entity.index + 1}
                  </span>
                  <h5 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {entity.name}
                  </h5>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <div className="flex flex-wrap items-center gap-1 text-[10px] font-bold">
                    {entity.processesCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                        {entity.processesCount} quy trình
                      </span>
                    )}
                    {entity.exercisesCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                        {entity.exercisesCount} bài tập
                      </span>
                    )}
                    {entity.examplesCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                        {entity.examplesCount} ví dụ
                      </span>
                    )}
                    {entity.argumentsCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                        {entity.argumentsCount} lập luận
                      </span>
                    )}
                  </div>

                  {editable && (
                    <div className="flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => setEditingEntityIndex(entity.index)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                        title="Chỉnh sửa định nghĩa, quy trình, bài tập, ví dụ"
                      >
                        <span className="material-symbols-outlined text-[15px]">edit</span>
                        <span>Sửa</span>
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const ok = await confirm({
                            title: 'Xác nhận xóa thực thể tri thức',
                            message: `Bạn có chắc chắn muốn xóa thực thể "${entity.name}" và các liên kết liên quan khỏi đồ thị không? Hành động này không thể hoàn tác.`,
                            variant: 'danger',
                            confirmText: 'Xóa vĩnh viễn',
                            cancelText: 'Hủy',
                          });
                          if (ok) {
                            handleDeleteEntity(entity.index);
                          }
                        }}
                        className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/60 text-rose-500 transition-colors cursor-pointer"
                        title="Xóa thực thể này"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {(entity.definition || entity.description) && (
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50/70 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                  {entity.definition || entity.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Knowledge Relations Section */}
      <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-purple-600 dark:text-purple-400">
              account_tree
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Quan hệ đồ thị tri thức ({rawRelations.length})
            </span>
          </div>
          {editable && (
            <button
              type="button"
              onClick={() => setIsAddRelationOpen(true)}
              disabled={!draftData.entities || draftData.entities.length < 2}
              className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer disabled:opacity-40"
            >
              + Nối quan hệ mới
            </button>
          )}
        </div>

        {rawRelations.length === 0 ? (
          <p className="text-xs text-slate-400 italic">
            Chưa có liên kết quan hệ nào giữa các thực thể.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {rawRelations.map((rel, rIdx) => (
              <div
                key={rIdx}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-bold text-blue-600 dark:text-blue-400 truncate max-w-[120px]">
                    {rel.source}
                  </span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 shrink-0">
                    ──[{rel.relation_type}]──►
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 truncate max-w-[120px]">
                    {rel.target}
                  </span>
                </div>
                {editable && (
                  <button
                    type="button"
                    onClick={() => handleDeleteRelation(rIdx)}
                    className="text-slate-400 hover:text-rose-500 cursor-pointer p-0.5 shrink-0"
                    title="Xóa liên kết này"
                  >
                    <span className="material-symbols-outlined text-[15px]">close</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Source Evidence Viewer */}
      {showEvidence && (
        <div className="rounded-2xl bg-slate-950 text-slate-100 p-4 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400">
              Source Manifest &amp; Trích dẫn gốc (source)
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Revision #{draft.revision}
            </span>
          </div>
          <pre className="max-h-72 overflow-auto text-[11px] font-mono whitespace-pre-wrap text-slate-200 leading-relaxed">
            {JSON.stringify(draft.source, null, 2)}
          </pre>
        </div>
      )}

      {/* Modals */}
      <DraftCreateEntityModal
        isOpen={isAddEntityOpen}
        topics={draftData.topics}
        onClose={() => setIsAddEntityOpen(false)}
        onSubmit={(payload) => {
          if (!onChange) return;
          const next = addEntityToDraft(draftData, payload);
          onChange(stringifyDraftGraph(next));
        }}
      />

      <DraftCreateRelationModal
        isOpen={isAddRelationOpen}
        entities={draftData.entities}
        onClose={() => setIsAddRelationOpen(false)}
        onSubmit={(payload) => {
          if (!onChange) return;
          const next = addRelationToDraft(draftData, payload);
          onChange(stringifyDraftGraph(next));
        }}
      />

      <DraftCreateTopicModal
        isOpen={isAddTopicOpen}
        entities={draftData.entities}
        onClose={() => setIsAddTopicOpen(false)}
        onSubmit={(payload) => {
          if (!onChange) return;
          const next = addTopicToDraft(draftData, payload);
          onChange(stringifyDraftGraph(next));
        }}
      />

      {editingEntityIndex !== null && draftData.entities?.[editingEntityIndex] && (
        <DraftEntityEditorModal
          isOpen={true}
          entity={draftData.entities[editingEntityIndex]}
          entityIndex={editingEntityIndex}
          onClose={() => setEditingEntityIndex(null)}
          onSave={handleUpdateEntity}
          onDelete={handleDeleteEntity}
        />
      )}
    </div>
  );
}
