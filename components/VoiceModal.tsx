'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Check, X, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { ParsedVoiceItem, parseSpokenShoppingText, isSpeechRecognitionSupported } from '@/lib/speech';
import { CATEGORIES } from '@/lib/categories';
import { playVoiceStartSound, playAddSound } from '@/lib/sound';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItems: (items: ParsedVoiceItem[]) => void;
  fontSize: 'normal' | 'large' | 'extra';
  highContrast: boolean;
  soundEnabled: boolean;
}

// Define interface for browser SpeechRecognition
interface IWindowSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: { resultIndex: number; results: { [key: number]: { [key: number]: { transcript: string } }; length: number } }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
  onAddItems,
  fontSize,
  highContrast,
  soundEnabled,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [parsedItems, setParsedItems] = useState<ParsedVoiceItem[]>([]);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [manualText, setManualText] = useState('');
  const recognitionRef = useRef<IWindowSpeechRecognition | null>(null);

  const startListening = React.useCallback(() => {
    setErrorMessage(null);
    setTranscript('');
    setInterimText('');
    setParsedItems([]);

    if (typeof window === 'undefined') return;

    const SpeechRecognitionClass =
      (window as unknown as { SpeechRecognition: new () => IWindowSpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition: new () => IWindowSpeechRecognition }).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setErrorMessage('Reconhecimento de voz não suportado neste navegador. Use a caixa de texto abaixo.');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognitionClass();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        if (soundEnabled) playVoiceStartSound();
      };

      recognition.onresult = (event) => {
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res && res[0]) {
            const text = res[0].transcript;
            currentFinal += text;
          }
        }

        const fullText = currentFinal.trim();
        setTranscript(fullText);
        setInterimText('');

        // Parse in real-time
        if (fullText) {
          const items = parseSpokenShoppingText(fullText);
          setParsedItems(items);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage('Permissão de microfone negada. Verifique as configurações do navegador ou digite abaixo.');
        } else if (event.error === 'no-speech') {
          setErrorMessage('Nenhuma fala foi detectada. Toque no microfone e tente falar novamente.');
        } else {
          setErrorMessage(`Aviso: ${event.error}. Você pode digitar a lista abaixo.`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Error starting speech:', err);
      setErrorMessage('Não foi possível iniciar o microfone. Use a caixa de texto manual.');
      setIsListening(false);
    }
  }, [soundEnabled]);

  const stopListening = React.useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const handleCloseModal = React.useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    setIsListening(false);
    setTranscript('');
    setInterimText('');
    setParsedItems([]);
    setErrorMessage(null);
    setManualText('');
    onClose();
  }, [onClose]);

  // Stop or start recognition on modal open/close
  useEffect(() => {
    if (!isOpen) {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      return;
    }

    const timer = setTimeout(() => {
      startListening();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [isOpen, startListening]);

  // Enhance with server-side Gemini AI if requested
  const handleEnhanceWithAI = async () => {
    const textToAnalyze = transcript || manualText;
    if (!textToAnalyze.trim()) return;

    setIsProcessingAI(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/gemini/parse-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: textToAnalyze }),
      });

      if (!res.ok) {
        throw new Error('Falha ao processar com IA. Usando processamento local.');
      }

      const data = await res.json();
      if (data.items && Array.isArray(data.items) && data.items.length > 0) {
        setParsedItems(data.items);
      } else {
        // Fallback local
        const fallback = parseSpokenShoppingText(textToAnalyze);
        setParsedItems(fallback);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro na IA';
      console.warn('AI error, using local parse:', msg);
      const fallback = parseSpokenShoppingText(textToAnalyze);
      setParsedItems(fallback);
    } finally {
      setIsProcessingAI(false);
    }
  };

  // Handle manual input typing
  const handleManualTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setManualText(val);
    if (val.trim()) {
      const items = parseSpokenShoppingText(val);
      setParsedItems(items);
    } else {
      setParsedItems([]);
    }
  };

  const handleConfirmAdd = () => {
    if (parsedItems.length === 0) return;
    onAddItems(parsedItems);
    if (soundEnabled) playAddSound();
    onClose();
  };

  const handleRemoveParsedItem = (index: number) => {
    setParsedItems(prev => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  const fontClasses = {
    normal: 'text-base',
    large: 'text-lg',
    extra: 'text-xl',
  }[fontSize];

  return (
    <div
      id="voice-modal-overlay"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in"
      onClick={handleCloseModal}
    >
      <div
        id="voice-modal-card"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-lg rounded-2xl p-5 sm:p-6 shadow-2xl border transition-all ${
          highContrast
            ? 'bg-black text-white border-white'
            : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Adicionar por Voz
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                Fale um ou vários itens de uma só vez
              </p>
            </div>
          </div>
          <button
            id="close-voice-modal-button"
            type="button"
            onClick={handleCloseModal}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            aria-label="Fechar janela de voz"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Center: Microphone Visual & Status */}
        <div className="py-6 flex flex-col items-center text-center">
          <div className="relative mb-4">
            {/* Animated Pulse Ring */}
            {isListening && (
              <>
                <span className="absolute -inset-3 rounded-full bg-emerald-400/30 dark:bg-emerald-500/30 animate-ping opacity-75" />
                <span className="absolute -inset-6 rounded-full bg-emerald-300/20 dark:bg-emerald-500/20 animate-pulse" />
              </>
            )}

            <button
              id="toggle-mic-listening-btn"
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center transition-all shadow-lg active:scale-95 ${
                isListening
                  ? 'bg-rose-600 text-white ring-4 ring-rose-300 dark:ring-rose-900 animate-bounce-subtle'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white ring-4 ring-emerald-200 dark:ring-emerald-900'
              }`}
              title={isListening ? 'Toque para parar de ouvir' : 'Toque para falar'}
              aria-label={isListening ? 'Gravando voz. Toque para parar.' : 'Toque para falar'}
            >
              {isListening ? (
                <>
                  <MicOff className="w-10 h-10 mb-1" />
                  <span className="text-xs font-bold uppercase tracking-wider">Parar</span>
                </>
              ) : (
                <>
                  <Mic className="w-10 h-10 mb-1" />
                  <span className="text-xs font-bold uppercase tracking-wider">Falar</span>
                </>
              )}
            </button>
          </div>

          <p className={`font-bold transition-all ${fontClasses} ${isListening ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
            {isListening ? 'Ouvindo você... pode falar!' : 'Toque no microfone para começar a falar'}
          </p>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1">
            Exemplo: <span className="italic font-medium text-slate-700 dark:text-slate-300">&ldquo;2 quilos de batata, sabão em pó e 3 leites&rdquo;</span>
          </p>
        </div>

        {/* Live Spoken Text Box */}
        {(transcript || interimText) && (
          <div className="mb-4 p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
              Você disse:
            </span>
            <p className={`font-medium text-slate-900 dark:text-white ${fontClasses}`}>
              {transcript} {interimText && <span className="opacity-50 italic">{interimText}</span>}
            </p>
          </div>
        )}

        {/* Error message / Warning */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs sm:text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Manual typing fallback if user prefers or speech fails */}
        <div className="mb-4">
          <label htmlFor="voice-manual-input" className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Ou digite sua frase / lista por extenso:
          </label>
          <div className="flex gap-2">
            <input
              id="voice-manual-input"
              type="text"
              value={manualText}
              onChange={handleManualTextChange}
              placeholder="Ex: Arroz, feijão, 1kg de tomate e 6 ovos"
              className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium ${fontClasses}`}
            />
            {(transcript || manualText) && (
              <button
                id="ai-enhance-button"
                type="button"
                onClick={handleEnhanceWithAI}
                disabled={isProcessingAI}
                className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 shrink-0 shadow-sm disabled:opacity-50"
                title="Melhorar organização dos itens com Inteligência Artificial"
              >
                {isProcessingAI ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Organizar</span> com IA
              </button>
            )}
          </div>
        </div>

        {/* Identified items preview */}
        {parsedItems.length > 0 && (
          <div className="mb-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                Itens identificados ({parsedItems.length}):
              </span>
              <span className="text-xs text-slate-500">Toque no X para remover</span>
            </div>
            <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto p-1">
              {parsedItems.map((item, idx) => {
                const cat = CATEGORIES[item.category] || CATEGORIES.outros;
                return (
                  <div
                    key={`${item.name}-${idx}`}
                    className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm"
                  >
                    <span
                      className={`text-xs px-2 py-0.5 rounded-md border font-semibold ${cat.bgColor} ${cat.color} ${cat.borderColor}`}
                    >
                      {cat.name}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {item.quantity} {item.unit}
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {item.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveParsedItem(idx)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                      title="Remover este item"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            id="cancel-voice-button"
            type="button"
            onClick={handleCloseModal}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm sm:text-base"
          >
            Cancelar
          </button>
          <button
            id="confirm-voice-items-button"
            type="button"
            onClick={handleConfirmAdd}
            disabled={parsedItems.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-sm sm:text-base"
          >
            <Check className="w-5 h-5" />
            Adicionar {parsedItems.length > 0 ? `(${parsedItems.length}) Itens` : 'à Lista'}
          </button>
        </div>
      </div>
    </div>
  );
};
