'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { CustomSelect } from '@/components/shared';
import { useCreateDirectConversation } from '../../hooks/useConversations';
import {
  useCreateSmartGroup,
  useStudyPreferences,
  useStudyRecommendations,
  useUpdateStudyPreferences,
} from '../../hooks/useChatPhase2';

interface StudyMatchingModalProps {
  isOpen: boolean;
  defaultClassId?: string | null;
  defaultCourseId?: string | null;
  onClose: () => void;
  onOpenedConversation: (conversationId: string) => void;
}

interface LightweightClassItem {
  id: string;
  name: string;
  title?: string;
  courses?: Array<{ id: string; name?: string; title?: string }>;
}

export function StudyMatchingModal({
  isOpen,
  defaultClassId,
  defaultCourseId,
  onClose,
  onOpenedConversation,
}: StudyMatchingModalProps) {
  const t = useTranslations('chat.modals.matching');
  const { data: prefs, isLoading: prefsLoading } = useStudyPreferences(isOpen);
  const updatePrefs = useUpdateStudyPreferences();
  const createDirect = useCreateDirectConversation();
  const createSmartGroup = useCreateSmartGroup();

  const { data: myClasses = [] } = useQuery({
    queryKey: ['chat', 'matching-classes'],
    enabled: isOpen,
    staleTime: 60_000,
    queryFn: async (): Promise<LightweightClassItem[]> => {
      try {
        const { data } = await api.get<{
          data?: { items?: LightweightClassItem[]; content?: LightweightClassItem[] } | LightweightClassItem[];
        }>('/classes', { params: { page: 0, size: 50 } });
        const raw = data?.data;
        if (Array.isArray(raw)) return raw;
        if (raw && 'items' in raw && Array.isArray(raw.items)) return raw.items;
        if (raw && 'content' in raw && Array.isArray(raw.content)) return raw.content;
        return [];
      } catch {
        return [];
      }
    },
  });

  const [classId, setClassId] = useState(defaultClassId || '');
  const [courseId, setCourseId] = useState(defaultCourseId || '');
  const [mode, setMode] = useState<'MENTOR' | 'PEER_CIRCLE'>('MENTOR');
  const [selectedPeers, setSelectedPeers] = useState<string[]>([]);
  const [smartGroupName, setSmartGroupName] = useState(t('defaultSmartGroupName'));
  const [triggerAiIntro, setTriggerAiIntro] = useState(true);
  const [willingToMentor, setWillingToMentor] = useState(false);
  const [availabilityNote, setAvailabilityNote] = useState('');

  useEffect(() => {
    if (defaultClassId) setClassId(defaultClassId);
    else if (!classId && myClasses.length > 0) setClassId(myClasses[0].id);
  }, [defaultClassId, myClasses, classId]);

  useEffect(() => {
    if (defaultCourseId) setCourseId(defaultCourseId);
  }, [defaultCourseId]);

  const activeClass = myClasses.find((c) => c.id === classId);
  const { data: recommendations = [], isLoading: recsLoading } =
    useStudyRecommendations(
      classId || null,
      courseId || undefined,
      mode,
      isOpen && Boolean(prefs?.allowPeerMatching) && Boolean(classId)
    );

  if (!isOpen) return null;

  const handleEnableMatching = async () => {
    await updatePrefs.mutateAsync({
      allowPeerMatching: true,
      willingToMentor,
      preferredStudyMode: 'ANY',
      availabilityNote: availabilityNote.trim() || undefined,
    });
  };

  const handleStartDirect = async (userId: string) => {
    const conv = await createDirect.mutateAsync({ targetUserId: userId });
    onOpenedConversation(conv.id);
    onClose();
  };

  const handleCreateSmartGroup = async () => {
    if (!classId || selectedPeers.length === 0 || !smartGroupName.trim()) return;
    const conceptCodes = Array.from(
      new Set(
        recommendations
          .filter((r) => selectedPeers.includes(r.candidateUserId))
          .flatMap((r) => r.matchingConceptCodes)
      )
    );
    const conv = await createSmartGroup.mutateAsync({
      name: smartGroupName.trim(),
      classId,
      courseId: courseId || undefined,
      memberIds: selectedPeers,
      targetConceptCodes: conceptCodes,
      triggerAiIntro,
    });
    onOpenedConversation(conv.id);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('ariaLabel')}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-3xl bg-white dark:bg-[#1E1F20] p-6 shadow-2xl space-y-4 max-h-[88vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-[#0B57D0] dark:text-[#A8C7FA]">
              diversity_3
            </span>
            <h3 className="text-base font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
              {t('title')}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {prefsLoading ? (
          <div className="h-32 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] animate-pulse" />
        ) : !prefs?.allowPeerMatching ? (
          <div className="rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] p-5 space-y-4 text-xs">
            <div className="space-y-1">
              <p className="text-sm font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
                {t('optInTitle')}
              </p>
              <p className="text-[#444746] dark:text-[#C4C7C5] leading-relaxed">
                {t('optInDesc')}
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={willingToMentor}
                onChange={(e) => setWillingToMentor(e.target.checked)}
                className="w-4 h-4 accent-[#0B57D0]"
              />
              <span>{t('mentorToggle')}</span>
            </label>
            <input
              type="text"
              value={availabilityNote}
              onChange={(e) => setAvailabilityNote(e.target.value)}
              placeholder={t('availabilityPlaceholder')}
              className="w-full h-10 px-4 rounded-full bg-white dark:bg-[#1E1F20] outline-none"
            />
            <button
              type="button"
              disabled={updatePrefs.isPending}
              onClick={() => void handleEnableMatching()}
              className="w-full py-2.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-[#062E6F] font-semibold cursor-pointer"
            >
              {updatePrefs.isPending ? t('enablingBtn') : t('enableBtn')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <CustomSelect
                label={t('classLabel')}
                value={classId}
                onChange={(val) => {
                  setClassId(val);
                  setCourseId('');
                  setSelectedPeers([]);
                }}
                options={myClasses.map((c) => ({
                  value: c.id,
                  label: c.title || c.name,
                }))}
              />
              <CustomSelect
                label={t('courseLabel')}
                value={courseId}
                onChange={setCourseId}
                options={[
                  { value: '', label: t('allCourses') },
                  ...(activeClass?.courses ?? []).map((co) => ({
                    value: co.id,
                    label: co.name || co.title || co.id,
                  })),
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C]">
              <button
                type="button"
                onClick={() => setMode('MENTOR')}
                className={`py-1.5 rounded-full text-xs font-semibold cursor-pointer ${
                  mode === 'MENTOR'
                    ? 'bg-white dark:bg-[#1E1F20] text-[#041E49] dark:text-[#A8C7FA] shadow-xs'
                    : 'text-[#444746] dark:text-[#C4C7C5]'
                }`}
              >
                {t('tabMentor')}
              </button>
              <button
                type="button"
                onClick={() => setMode('PEER_CIRCLE')}
                className={`py-1.5 rounded-full text-xs font-semibold cursor-pointer ${
                  mode === 'PEER_CIRCLE'
                    ? 'bg-white dark:bg-[#1E1F20] text-[#041E49] dark:text-[#A8C7FA] shadow-xs'
                    : 'text-[#444746] dark:text-[#C4C7C5]'
                }`}
              >
                {t('tabPeer')}
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {recsLoading ? (
                <div className="h-20 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] animate-pulse" />
              ) : recommendations.length === 0 ? (
                <p className="text-xs text-center text-[#747775] py-6">
                  {t('empty')}
                </p>
              ) : (
                recommendations.map((rec) => {
                  const picked = selectedPeers.includes(rec.candidateUserId);
                  return (
                    <div
                      key={rec.candidateUserId}
                      className="p-3 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 space-y-1">
                        <p className="font-bold text-[#1F1F1F] dark:text-[#E3E3E3] truncate">
                          {rec.fullName}
                        </p>
                        {rec.matchingConceptTitles.length > 0 && (
                          <p className="text-[11px] text-[#0B57D0] dark:text-[#A8C7FA] truncate">
                            {t('matchingConcepts', {
                              concepts: rec.matchingConceptTitles.join(', '),
                            })}
                          </p>
                        )}
                        {rec.availabilityNote && (
                          <p className="text-[11px] text-[#747775] dark:text-[#8E918F]">
                            {rec.availabilityNote}
                          </p>
                        )}
                      </div>

                      {mode === 'MENTOR' ? (
                        <button
                          type="button"
                          disabled={createDirect.isPending}
                          onClick={() => void handleStartDirect(rec.candidateUserId)}
                          className="px-3.5 py-1.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-[#062E6F] text-[11px] font-semibold shrink-0 cursor-pointer"
                        >
                          {t('directMsgBtn')}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedPeers((prev) =>
                              picked
                                ? prev.filter((id) => id !== rec.candidateUserId)
                                : [...prev, rec.candidateUserId]
                            )
                          }
                          className={`px-3 py-1.5 rounded-full text-[11px] font-semibold shrink-0 cursor-pointer ${
                            picked
                              ? 'bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-[#062E6F]'
                              : 'bg-white dark:bg-[#1E1F20] text-[#1F1F1F] dark:text-[#E3E3E3]'
                          }`}
                        >
                          {picked ? t('selectedPeerBtn') : t('selectPeerBtn')}
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {mode === 'PEER_CIRCLE' && recommendations.length > 0 && (
              <div className="space-y-2.5 pt-2 border-t border-[#F0F4F9] dark:border-[#282A2C] text-xs">
                <input
                  type="text"
                  value={smartGroupName}
                  onChange={(e) => setSmartGroupName(e.target.value)}
                  placeholder={t('smartGroupNamePlaceholder')}
                  className="w-full h-9 px-3.5 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] outline-none"
                />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={triggerAiIntro}
                    onChange={(e) => setTriggerAiIntro(e.target.checked)}
                    className="w-4 h-4 accent-[#0B57D0]"
                  />
                  <span>{t('triggerAiIntro')}</span>
                </label>
                <button
                  type="button"
                  disabled={selectedPeers.length === 0 || createSmartGroup.isPending}
                  onClick={() => void handleCreateSmartGroup()}
                  className="w-full py-2.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-[#062E6F] font-semibold disabled:opacity-50 cursor-pointer"
                >
                  {createSmartGroup.isPending
                    ? t('creatingGroupBtn')
                    : t('createSmartGroupTitle', { count: selectedPeers.length })}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
