'use client';

import React from 'react';
import { AccessibilitySettings } from '@/types/shopping';
import { Volume2, VolumeX, Eye, Sparkles, Volume, Download, Smartphone } from 'lucide-react';

interface AccessibilityBarProps {
  settings: AccessibilitySettings;
  onUpdateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  onReadList: () => void;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
  remainingCount: number;
  onOpenInstallModal?: () => void;
  isStandalone?: boolean;
}

export const AccessibilityBar: React.FC<AccessibilityBarProps> = ({
  settings,
  onUpdateSettings,
  onReadList,
  isSpeaking,
  onStopSpeaking,
  remainingCount,
  onOpenInstallModal,
  isStandalone = false,
}) => {
  return (
    <aside
      id="accessibility-bar"
      aria-label="Ajustes de Acessibilidade e Visualização"
      className={`w-full border-b transition-colors ${
        settings.highContrast
          ? 'bg-black text-white border-zinc-700'
          : 'bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-800'
      }`}
    >
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-2 text-sm">
        
        {/* Font Size Selector */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="font-semibold text-xs sm:text-sm flex items-center gap-1 opacity-90">
            <span className="hidden sm:inline">Tamanho da</span> Fonte:
          </span>
          <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
            <button
              id="font-size-normal"
              type="button"
              onClick={() => onUpdateSettings({ fontSize: 'normal' })}
              className={`px-2 py-1 rounded-md text-xs sm:text-sm font-medium transition-all ${
                settings.fontSize === 'normal'
                  ? 'bg-emerald-600 text-white shadow-sm font-bold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Tamanho de texto padrão (16px)"
            >
              A
            </button>
            <button
              id="font-size-large"
              type="button"
              onClick={() => onUpdateSettings({ fontSize: 'large' })}
              className={`px-2 py-1 rounded-md text-sm sm:text-base font-medium transition-all ${
                settings.fontSize === 'large'
                  ? 'bg-emerald-600 text-white shadow-sm font-bold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Tamanho de texto grande para melhor leitura"
            >
              A+
            </button>
            <button
              id="font-size-extra"
              type="button"
              onClick={() => onUpdateSettings({ fontSize: 'extra' })}
              className={`px-2.5 py-1 rounded-md text-base sm:text-lg font-bold transition-all ${
                settings.fontSize === 'extra'
                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Tamanho de texto extra grande para pessoas com baixa visão"
            >
              A++
            </button>
          </div>
        </div>

        {/* High Contrast & Sounds & Read List */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* High Contrast Toggle */}
          <button
            id="toggle-high-contrast"
            type="button"
            onClick={() => onUpdateSettings({ highContrast: !settings.highContrast })}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs sm:text-sm font-semibold transition-all ${
              settings.highContrast
                ? 'bg-yellow-400 text-black border-yellow-300 ring-2 ring-yellow-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
            }`}
            title="Alternar modo de alto contraste para máxima nitidez"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden xs:inline">Alto</span> Contraste
          </button>

          {/* Sound Toggle */}
          <button
            id="toggle-sound-feedback"
            type="button"
            onClick={() => onUpdateSettings({ soundFeedback: !settings.soundFeedback })}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs sm:text-sm font-medium transition-all ${
              settings.soundFeedback
                ? 'bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
            }`}
            title={settings.soundFeedback ? 'Sons ativados' : 'Sons desativados'}
          >
            {settings.soundFeedback ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">Sons</span>
          </button>

          {/* Read List Aloud */}
          {isSpeaking ? (
            <button
              id="stop-reading-button"
              type="button"
              onClick={onStopSpeaking}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white font-semibold text-xs sm:text-sm animate-pulse hover:bg-rose-700 shadow-sm"
              title="Parar leitura em voz alta"
            >
              <VolumeX className="w-4 h-4" />
              Parar Leitura
            </button>
          ) : (
            <button
              id="read-list-button"
              type="button"
              onClick={onReadList}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs sm:text-sm hover:bg-emerald-700 shadow-sm transition-transform active:scale-95"
              title="Ouvir lista de compras em voz alta"
            >
              <Volume className="w-4 h-4" />
              <span>Ouvir Lista</span>
              {remainingCount > 0 && (
                <span className="bg-emerald-800 text-white text-[11px] px-1.5 py-0.2 rounded-full font-bold">
                  {remainingCount}
                </span>
              )}
            </button>
          )}
          {/* Botão de Instalar App no Dispositivo */}
          {onOpenInstallModal && !isStandalone && (
            <button
              id="accessibility-install-app-btn"
              type="button"
              onClick={onOpenInstallModal}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs sm:text-sm font-bold transition-all active:scale-95 ${
                settings.highContrast
                  ? 'bg-yellow-400 text-black border-yellow-300 font-extrabold'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100'
              }`}
              title="Instalar aplicativo no seu celular ou computador"
            >
              <Download className="w-4 h-4" />
              <span>Instalar App</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
