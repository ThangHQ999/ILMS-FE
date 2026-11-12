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
    <div className="bg-white dark:bg-[#1E1F20] rounded-2xl p-3.5 border-none shadow-none flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[13px] font-semibold text-slate-900 dark:text-[#E3E3E3]">{title}</span>
          <span className="text-[10px] text-slate-600 dark:text-[#C4C7C5] bg-[#F0F4F9] dark:bg-[#282A2C] px-2 py-0.5 rounded-full font-mono">
            {tag}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-[#C4C7C5] mb-2.5 leading-relaxed">{desc}</p>
        <div className="flex items-center gap-1.5 flex-wrap">
          {palette.map((color) => {
            const isSelected = current.hex === color.hex;
            return (
              <button
                key={color.hex}
                type="button"
                title={`${color.name} (${color.hex})`}
                onClick={() => onSelectColor(type, color)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white border-none shadow-none transition-transform hover:scale-110 ${
                  isSelected ? 'scale-110' : 'opacity-85 hover:opacity-100'
                }`}
                style={{ backgroundColor: color.hex }}
              >
                {isSelected && <span className="material-symbols-outlined text-[14px]">check</span>}
              </button>
            );
          })}
        </div>
      </div>
      <div className="font-mono text-[11px] text-[#0B57D0] dark:text-[#A8C7FA] font-medium mt-2.5 pt-2 border-t border-[#F0F4F9] dark:border-[#282A2C]">
        {current.name} ({current.hex})
      </div>
    </div>
  );

  return (
    <fieldset className="flex flex-col border-none p-0 m-0">
      <legend className="text-base font-semibold text-slate-900 dark:text-[#E3E3E3] mb-3.5 flex items-center gap-2.5">
        <span className="w-6 h-6 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] whitespace-nowrap text-xs font-bold flex items-center justify-center">
          3
        </span>
        {t('legend')}
      </legend>

      <div className="flex flex-col gap-4">
        {/* Row 1: Theme Mode & Live Preview */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5 bg-[#F0F4F9] dark:bg-[#282A2C] rounded-3xl p-5 flex flex-col justify-between border-none shadow-none">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-wider text-slate-600 dark:text-[#C4C7C5] font-semibold">
                  {t('themeTitle')}
                </span>
                <span className="font-mono text-[11px] text-slate-600 dark:text-[#C4C7C5] bg-white dark:bg-[#1E1F20] px-2.5 py-0.5 rounded-full">
                  {t('themeBadge')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => onSelectTheme('light')}
                  className={`rounded-2xl p-2.5 text-left transition-all flex flex-col gap-2 border-none ${
                    themeMode === 'light'
                      ? 'bg-white shadow-none text-slate-900'
                      : 'bg-white/60 dark:bg-[#1E1F20] opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="w-full h-12 bg-[#F0F4F9] rounded-xl p-1.5 flex flex-col justify-between border-none">
                    <div className="h-2 w-1/2 bg-[#0B57D0] rounded-full" />
                    <div className="flex gap-1">
                      <div className="h-4 flex-1 bg-white rounded-lg" />
                      <div className="h-4 w-1/3 bg-white/60 rounded-lg" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900 dark:text-[#E3E3E3]">{t('lightTheme')}</span>
                    {themeMode === 'light' && (
                      <span className="w-4 h-4 rounded-full bg-[#0B57D0] text-white whitespace-nowrap flex items-center justify-center">
                        <span className="material-symbols-outlined text-[10px]">check</span>
                      </span>
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectTheme('dark')}
                  className={`rounded-2xl p-2.5 text-left transition-all flex flex-col gap-2 border-none ${
                    themeMode === 'dark'
                      ? 'bg-[#131314] shadow-none text-white'
                      : 'bg-white/60 dark:bg-[#1E1F20] opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="w-full h-12 bg-[#1E1F20] rounded-xl p-1.5 flex flex-col justify-between border-none">
                    <div className="h-2 w-1/2 bg-[#A8C7FA] rounded-full" />
                    <div className="flex gap-1">
                      <div className="h-4 flex-1 bg-[#282A2C] rounded-lg" />
                      <div className="h-4 w-1/3 bg-[#333537] rounded-lg" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900 dark:text-[#E3E3E3]">{t('darkTheme')}</span>
                    {themeMode === 'dark' && (
                      <span className="w-4 h-4 rounded-full bg-[#A8C7FA] text-[#062E6F] flex items-center justify-center">
                        <span className="material-symbols-outlined text-[10px]">check</span>
                      </span>
                    )}
                  </div>
                </button>
              </div>
            </div>
            <p className="text-[12px] text-slate-500 dark:text-[#C4C7C5] mt-2.5">
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
        <div className="bg-[#F0F4F9] dark:bg-[#282A2C] rounded-3xl p-5 flex flex-col gap-3.5 border-none shadow-none">
          <div className="pb-2">
            <div className="text-xs uppercase tracking-wider text-[#1F1F1F] dark:text-[#E3E3E3] font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#0B57D0] dark:text-[#A8C7FA]">palette</span>
              {t('tokensTitle')}
            </div>
            <p className="text-[12px] text-[#444746] dark:text-[#C4C7C5] mt-0.5">
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
