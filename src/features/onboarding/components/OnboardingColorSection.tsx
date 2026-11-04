'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ThemeMode, ColorOption, FontFamilyName, AiPersona } from '../types';
import {
  PRIMARY_PALETTE,
  SECONDARY_PALETTE,
  TERTIARY_PALETTE,
  NEUTRAL_PALETTE,
} from '../constants';
import { OnboardingLivePreview } from './OnboardingLivePreview';

interface OnboardingColorSectionProps {
  themeMode: ThemeMode;
  onSelectTheme: (mode: ThemeMode) => void;
  primaryColor: ColorOption;
  secondaryColor: ColorOption;
  tertiaryColor: ColorOption;
  neutralColor: ColorOption;
  onSelectColor: (type: 'primary' | 'secondary' | 'tertiary' | 'neutral', option: ColorOption) => void;
  fontFamily: FontFamilyName;
  persona: AiPersona;
}

export function OnboardingColorSection({
  themeMode,
  onSelectTheme,
  primaryColor,
  secondaryColor,
  tertiaryColor,
  neutralColor,
  onSelectColor,
  fontFamily,
  persona,
}: OnboardingColorSectionProps) {
  const t = useTranslations('onboarding.color');

  const renderPalette = (
    title: string,
    desc: string,
    tag: string,
    current: ColorOption,
    palette: ColorOption[],
    type: 'primary' | 'secondary' | 'tertiary' | 'neutral'
  ) => (
    <div className="bg-white dark:bg-[#0B0F19] rounded-xl p-3 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[13px] font-semibold text-slate-900 dark:text-white">{title}</span>
          <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">
            {tag}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2.5 leading-relaxed">{desc}</p>
        <div className="flex items-center gap-1.5 flex-wrap">
          {palette.map((color) => {
            const isSelected = current.hex === color.hex;
            return (
              <button
                key={color.hex}
                type="button"
                title={`${color.name} (${color.hex})`}
                onClick={() => onSelectColor(type, color)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white shadow-xs transition-transform hover:scale-110 ${
                  isSelected ? 'ring-2 ring-offset-2 ring-blue-600 dark:ring-[#38BDF8] scale-105' : 'opacity-85 hover:opacity-100'
                }`}
                style={{ backgroundColor: color.hex }}
              >
                {isSelected && <span className="material-symbols-outlined text-[14px]">check</span>}
              </button>
            );
          })}
        </div>
      </div>
      <div className="font-mono text-[11px] text-blue-600 dark:text-[#38BDF8] font-medium mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
        {current.name} ({current.hex})
      </div>
    </div>
  );

  return (
    <fieldset className="flex flex-col border-none p-0 m-0">
      <legend className="text-base font-semibold text-slate-900 dark:text-white mb-3.5 flex items-center gap-2.5">
        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
          3
        </span>
        {t('legend')}
      </legend>

      <div className="flex flex-col gap-4">
        {/* Row 1: Theme Mode & Live Preview */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5 bg-slate-50 dark:bg-[#161D2F] rounded-xl p-4 flex flex-col justify-between border border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                  {t('themeTitle')}
                </span>
                <span className="font-mono text-[11px] text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {t('themeBadge')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => onSelectTheme('light')}
                  className={`rounded-lg p-2.5 text-left transition-all flex flex-col gap-2 border ${
                    themeMode === 'light'
                      ? 'bg-white shadow-md border-blue-500/40 dark:border-transparent'
                      : 'bg-slate-100 dark:bg-slate-800/80 border-transparent opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="w-full h-12 bg-white rounded p-1.5 flex flex-col justify-between shadow-xs border border-slate-200">
                    <div className="h-2 w-1/2 bg-blue-600 rounded-sm" />
                    <div className="flex gap-1">
                      <div className="h-4 flex-1 bg-slate-200 rounded-sm" />
                      <div className="h-4 w-1/3 bg-slate-300 rounded-sm" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{t('lightTheme')}</span>
                    {themeMode === 'light' && (
                      <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <span className="material-symbols-outlined text-[10px]">check</span>
                      </span>
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectTheme('dark')}
                  className={`rounded-lg p-2.5 text-left transition-all flex flex-col gap-2 border ${
                    themeMode === 'dark'
                      ? 'bg-[#0B0F19] shadow-md border-[#38BDF8] text-white'
                      : 'bg-slate-100 dark:bg-slate-800/80 border-transparent opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="w-full h-12 bg-[#0B0F19] rounded p-1.5 flex flex-col justify-between shadow-inner border border-slate-800">
                    <div className="h-2 w-1/2 bg-[#38BDF8] rounded-sm" />
                    <div className="flex gap-1">
                      <div className="h-4 flex-1 bg-slate-700 rounded-sm" />
                      <div className="h-4 w-1/3 bg-slate-800 rounded-sm" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{t('darkTheme')}</span>
                    {themeMode === 'dark' && (
                      <span className="w-4 h-4 rounded-full bg-[#38BDF8] text-slate-900 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[10px]">check</span>
                      </span>
                    )}
                  </div>
                </button>
              </div>
            </div>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-2.5">
              {t('themeDesc')}
            </p>
          </div>

          <OnboardingLivePreview
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            tertiaryColor={tertiaryColor}
            fontFamily={fontFamily}
            persona={persona}
          />
        </div>

        {/* Row 2: 4 Color Tokens */}
        <div className="bg-slate-50 dark:bg-[#161D2F] rounded-xl p-4 flex flex-col gap-3.5 border border-slate-200 dark:border-slate-800">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
            <div className="text-xs uppercase tracking-wider text-slate-900 dark:text-white font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-[#38BDF8]">palette</span>
              {t('tokensTitle')}
            </div>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
              {t('tokensDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {renderPalette(t('primaryTitle'), t('primaryDesc'), t('primaryTag'), primaryColor, PRIMARY_PALETTE, 'primary')}
            {renderPalette(t('secondaryTitle'), t('secondaryDesc'), t('secondaryTag'), secondaryColor, SECONDARY_PALETTE, 'secondary')}
            {renderPalette(t('tertiaryTitle'), t('tertiaryDesc'), t('tertiaryTag'), tertiaryColor, TERTIARY_PALETTE, 'tertiary')}
            {renderPalette(t('neutralTitle'), t('neutralDesc'), t('neutralTag'), neutralColor, NEUTRAL_PALETTE, 'neutral')}
          </div>
        </div>
      </div>
    </fieldset>
  );
}
