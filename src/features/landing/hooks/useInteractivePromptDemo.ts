'use client';

import { useState, useCallback } from 'react';
import type { HeroPromptSample } from '../types';

export const HERO_PROMPT_SAMPLES: readonly HeroPromptSample[] = [
  {
    id: 'calculus',
    subjectKey: 'hero.samples.calculus.subject',
    questionKey: 'hero.samples.calculus.question',
    socraticHintKey: 'hero.samples.calculus.hint',
    formula: 'Δ = b² - 4ac = 0  ⇒  x₁ = x₂ = -b / (2a)',
    followUpKey: 'hero.samples.calculus.followUp',
  },
  {
    id: 'physics',
    subjectKey: 'hero.samples.physics.subject',
    questionKey: 'hero.samples.physics.question',
    socraticHintKey: 'hero.samples.physics.hint',
    formula: 'E_total = E_k + E_p = ½mv² + mgh = const',
    followUpKey: 'hero.samples.physics.followUp',
  },
  {
    id: 'algorithms',
    subjectKey: 'hero.samples.algorithms.subject',
    questionKey: 'hero.samples.algorithms.question',
    socraticHintKey: 'hero.samples.algorithms.hint',
    formula: 'Size(Tree) ≤ 2 · 2^(⌈log₂N⌉ + 1) ≈ 4N',
    followUpKey: 'hero.samples.algorithms.followUp',
  },
] as const;

export function useInteractivePromptDemo() {
  const [selectedSampleId, setSelectedSampleId] = useState<string>('calculus');
  const [customInput, setCustomInput] = useState<string>('');
  const [submittedCustomQuestion, setSubmittedCustomQuestion] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [pulseTrigger, setPulseTrigger] = useState<number>(0);

  const activeSample =
    HERO_PROMPT_SAMPLES.find((s) => s.id === selectedSampleId) ?? HERO_PROMPT_SAMPLES[0];

  const handleSelectSample = useCallback((sampleId: string) => {
    setIsThinking(true);
    setSubmittedCustomQuestion(null);
    setSelectedSampleId(sampleId);
    setPulseTrigger((c) => c + 1);
    setTimeout(() => {
      setIsThinking(false);
    }, 280);
  }, []);

  const handleSubmitCustom = useCallback(
    (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      const trimmed = customInput.trim();
      if (!trimmed) {
        setPulseTrigger((c) => c + 1);
        return;
      }
      setIsThinking(true);
      setSubmittedCustomQuestion(trimmed);
      setPulseTrigger((c) => c + 1);
      setTimeout(() => {
        setIsThinking(false);
      }, 320);
    },
    [customInput]
  );

  return {
    samples: HERO_PROMPT_SAMPLES,
    activeSample,
    selectedSampleId,
    customInput,
    setCustomInput,
    submittedCustomQuestion,
    isThinking,
    pulseTrigger,
    handleSelectSample,
    handleSubmitCustom,
  };
}
