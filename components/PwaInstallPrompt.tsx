'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Download,
  Smartphone,
  Apple,
  Monitor,
  CheckCircle,
  X,
  ArrowRight,
  Share,
  PlusSquare,
  Sparkles,
  WifiOff,
  Zap,
  Mic,
  Laptop,
  Check,
  Info,
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface PwaInstallPromptProps {
  isOpen: boolean;
  onClose: () => void;
  highContrast?: boolean;
  isGateScreen?: boolean;
}

type DeviceCategory = 'android' | 'ios' | 'windows' | 'mac' | 'linux';

function detectInitialDevice(): { tab: DeviceCategory; name: string } {
  if (typeof window === 'undefined') {
    return { tab: 'android', name: '' };
  }
  const ua = window.navigator.userAgent.toLowerCase();
  const platform = (window.navigator.platform || '').toLowerCase();

  const isIOSDevice =
    /iphone|ipad|ipod/.test(ua) ||
    (platform.includes('mac') && window.navigator.maxTouchPoints > 1);
  const isAndroidDevice = /android/.test(ua);
  const isWindowsDevice = /win/.test(platform) || /windows/.test(ua);
  const isMacDevice = /mac/.test(platform) || /macintosh/.test(ua);
  const isLinuxDevice = /linux/.test(platform) && !isAndroidDevice;

  if (isIOSDevice) {
    return { tab: 'ios', name: 'Apple iOS (iPhone / iPad)' };
  }
  if (isAndroidDevice) {
    return { tab: 'android', name: 'Android (Smartphone / Tablet)' };
  }
  if (isWindowsDevice) {
    return { tab: 'windows', name: 'Windows (PC / Notebook)' };
  }
  if (isMacDevice) {
    return { tab: 'mac', name: 'macOS (MacBook / iMac)' };
  }
  if (isLinuxDevice) {
    return { tab: 'linux', name: 'Linux' };
  }
  return { tab: 'android', name: 'Dispositivo Móvel / Web' };
}

export function PwaInstallPrompt({
  isOpen,
  onClose,
  highContrast = false,
  isGateScreen = false,
}: PwaInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installedSuccessfully, setInstalledSuccessfully] = useState(false);
  const [initialDevice] = useState(() => detectInitialDevice());
  const [activeTab, setActiveTab] = useState<DeviceCategory>(initialDevice.tab);
  const detectedSystemName = initialDevice.name;

  // Listen for beforeinstallprompt & appinstalled events
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstalledSuccessfully(true);
      setDeferredPrompt(null);
      setTimeout(() => {
        onClose();
      }, 1800);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [onClose]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setInstalledSuccessfully(true);
        setTimeout(() => {
          onClose();
        }, 1800);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.warn('Aviso no prompt de instalação:', err);
    }
  };

  const hasNativePrompt = useMemo(() => {
    return !!deferredPrompt;
  }, [deferredPrompt]);

  if (!isOpen && !isGateScreen) return null;

  const innerModal = (
    <div
      id={isGateScreen ? 'pwa-install-gate-card' : 'pwa-install-modal'}
      className={`relative w-full max-w-2xl my-auto rounded-3xl shadow-2xl overflow-hidden border transition-all ${
        highContrast
          ? 'bg-black text-white border-yellow-400 ring-2 ring-yellow-400'
          : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800'
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Header / Welcome Gate */}
      <div
        className={`p-5 sm:p-6 text-center relative border-b ${
          highContrast
            ? 'bg-zinc-950 border-yellow-400'
            : 'bg-gradient-to-b from-emerald-500/10 via-emerald-50/50 to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 border-slate-100 dark:border-slate-800'
        }`}
      >
        {!isGateScreen && (
          <button
            id="close-pwa-modal-btn"
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Fechar e continuar no navegador"
            aria-label="Fechar e continuar no navegador"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* App Logo & Badge */}
        <div className="relative inline-block mb-3">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 border-2 border-white dark:border-slate-800">
            <Smartphone className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-amber-400 text-black shadow">
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isGateScreen ? 'Instalação Prévia Recomendada' : 'Instalação Disponível para Todos os Aparelhos'}</span>
        </div>

        <h2
          id="pwa-install-title"
          className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight"
        >
          {isGateScreen ? 'Instale o Aplicativo para Começar' : 'Instale a Lista de Compras no seu Aparelho'}
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 max-w-lg mx-auto leading-relaxed">
          {isGateScreen
            ? 'Para ter a melhor experiência de uso, comando de voz imediato e funcionamento 100% offline no supermercado, instale o aplicativo no seu aparelho.'
            : 'Recomendamos instalar o aplicativo antes de começar para ter acesso imediato direto da tela de início, inclusive 100% offline sem internet no supermercado.'}
        </p>

        {/* Device Detected Banner */}
        {detectedSystemName && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Seu sistema detectado:</span>
            <span className="text-emerald-600 dark:text-emerald-400 underline decoration-dotted">{detectedSystemName}</span>
          </div>
        )}
      </div>

        {/* Benefits Grid */}
        <div className="px-5 pt-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60">
              <WifiOff className="w-4 h-4 mx-auto text-emerald-600 dark:text-emerald-400 mb-1" />
              <div className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white">100% Offline</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">Funciona no mercado</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/60">
              <Zap className="w-4 h-4 mx-auto text-blue-600 dark:text-blue-400 mb-1" />
              <div className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white">Tela Cheia</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">Sem barra de navegação</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200/60 dark:border-violet-800/60">
              <Mic className="w-4 h-4 mx-auto text-violet-600 dark:text-violet-400 mb-1" />
              <div className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white">Comando de Voz</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">Dite itens com 1 toque</div>
            </div>
          </div>
        </div>

        {/* Native 1-Click Install Button (When available on Android/Chrome/Edge/Windows/Mac) */}
        {hasNativePrompt && !installedSuccessfully && (
          <div className="px-5 pt-4">
            <button
              id="pwa-native-install-cta"
              type="button"
              onClick={handleInstallClick}
              className={`w-full py-3.5 px-5 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all shadow-xl active:scale-98 ${
                highContrast
                  ? 'bg-yellow-400 text-black hover:bg-yellow-300 border-2 border-yellow-300 ring-2 ring-yellow-400'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
              }`}
            >
              <Download className="w-5 h-5 animate-bounce" />
              <span>Instalar Aplicativo Agora (1 Clique)</span>
            </button>
          </div>
        )}

        {/* Success message upon install */}
        {installedSuccessfully && (
          <div className="px-5 pt-4">
            <div className="p-4 rounded-2xl bg-emerald-500 text-white flex items-center justify-center gap-3 font-black shadow-lg">
              <CheckCircle className="w-6 h-6" />
              <span>Aplicativo instalado com sucesso! Abrindo lista...</span>
            </div>
          </div>
        )}

        {/* OS System Selector Tabs */}
        <div className="px-5 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Instruções por Sistema Operacional:
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
              Todas as versões suportadas
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
            <button
              id="tab-btn-android"
              type="button"
              onClick={() => setActiveTab('android')}
              className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                activeTab === 'android'
                  ? highContrast
                    ? 'bg-yellow-400 text-black shadow font-black'
                    : 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 shrink-0" />
              <span>Android</span>
            </button>

            <button
              id="tab-btn-ios"
              type="button"
              onClick={() => setActiveTab('ios')}
              className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                activeTab === 'ios'
                  ? highContrast
                    ? 'bg-yellow-400 text-black shadow font-black'
                    : 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Apple className="w-3.5 h-3.5 shrink-0" />
              <span>iPhone/iPad</span>
            </button>

            <button
              id="tab-btn-windows"
              type="button"
              onClick={() => setActiveTab('windows')}
              className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                activeTab === 'windows'
                  ? highContrast
                    ? 'bg-yellow-400 text-black shadow font-black'
                    : 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5 shrink-0" />
              <span>Windows</span>
            </button>

            <button
              id="tab-btn-mac"
              type="button"
              onClick={() => setActiveTab('mac')}
              className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                activeTab === 'mac'
                  ? highContrast
                    ? 'bg-yellow-400 text-black shadow font-black'
                    : 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Laptop className="w-3.5 h-3.5 shrink-0" />
              <span>Mac</span>
            </button>

            <button
              id="tab-btn-linux"
              type="button"
              onClick={() => setActiveTab('linux')}
              className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                activeTab === 'linux'
                  ? highContrast
                    ? 'bg-yellow-400 text-black shadow font-black'
                    : 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>Linux</span>
            </button>
          </div>
        </div>

        {/* Tab Body - System Specific Instructions */}
        <div className="p-5">
          {/* ANDROID TAB */}
          {activeTab === 'android' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                  Compatível com todas as versões do Android (Samsung, Xiaomi, Motorola, etc.)
                </span>
                <span className="text-[11px] font-bold text-slate-400">Android 8 ao 15+</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <ol className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <span>
                      No navegador (<strong>Google Chrome</strong>, <strong>Samsung Internet</strong> ou <strong>Edge</strong>), toque no menu de <strong>três pontinhos (⋮)</strong> no canto superior ou inferior.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <span>
                      Toque na opção <strong>&ldquo;Instalar aplicativo&rdquo;</strong> ou <strong>&ldquo;Adicionar à tela inicial&rdquo;</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <span>
                      Confirme em <strong>&ldquo;Instalar&rdquo;</strong>. O ícone oficial será adicionado à sua tela inicial e funcionará como um aplicativo nativo!
                    </span>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* iOS / iPadOS TAB */}
          {activeTab === 'ios' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                  Compatível com iPhone e iPad (todas as versões do iOS)
                </span>
                <span className="text-[11px] font-bold text-slate-400">iOS 14 ao 18+</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <ol className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                  <li className="flex items-start gap-3">
                    <div className="p-1.5 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 shrink-0">
                      <Share className="w-4 h-4" />
                    </div>
                    <div>
                      <strong>Passo 1:</strong> No <strong>Safari</strong>, toque no botão de <strong>Compartilhar</strong> (ícone de quadrado com seta para cima ⎋) na barra inferior.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="p-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <PlusSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <strong>Passo 2:</strong> Role a lista de opções para baixo e toque em <strong>&ldquo;Adicionar à Tela de Início&rdquo;</strong>.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="p-1.5 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <strong>Passo 3:</strong> Toque em <strong>&ldquo;Adicionar&rdquo;</strong> no canto superior direito. Pronto! O app abrirá em tela cheia sem barra de endereço.
                    </div>
                  </li>
                </ol>

                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400">
                  💡 <em>Se estiver usando o Google Chrome no iPhone:</em> toque no menu (...) e selecione &ldquo;Adicionar à tela de início&rdquo; ou abra no Safari para instalar.
                </div>
              </div>
            </div>
          )}

          {/* WINDOWS TAB */}
          {activeTab === 'windows' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                  Compatível com Windows 10 e Windows 11
                </span>
                <span className="text-[11px] font-bold text-slate-400">Edge, Chrome, Brave</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <ol className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <span>
                      No <strong>Microsoft Edge</strong> ou <strong>Google Chrome</strong>, localize o ícone de instalação (computador com seta para baixo ou sinal de ⊕) na parte direita da <strong>barra de endereços</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <span>
                      Clique no ícone e selecione <strong>&ldquo;Instalar&rdquo;</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <span>
                      O aplicativo será instalado no seu computador, criando um atalho na <strong>Área de Trabalho</strong> e no <strong>Menu Iniciar</strong>.
                    </span>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* MAC TAB */}
          {activeTab === 'mac' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                  Compatível com macOS (Sonoma, Sequoia, Ventura, Monterey)
                </span>
                <span className="text-[11px] font-bold text-slate-400">Safari e Chrome</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <ol className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <span>
                      <strong>No Safari (macOS Sonoma ou superior):</strong> Clique no menu superior <strong>Arquivo &gt; Adicionar ao Dock...</strong> e confirme. O app aparecerá no seu Dock como app nativo!
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <span>
                      <strong>No Google Chrome ou Edge para Mac:</strong> Clique no ícone de instalação (⊕) na barra de navegação à direita do endereço e confirme em <strong>&ldquo;Instalar&rdquo;</strong>.
                    </span>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* LINUX TAB */}
          {activeTab === 'linux' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                  Compatível com distribuições Linux (Ubuntu, Debian, Fedora, Arch)
                </span>
                <span className="text-[11px] font-bold text-slate-400">Chromium, Chrome, Edge</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <ol className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <span>
                      No navegador <strong>Chromium</strong>, <strong>Chrome</strong> ou <strong>Brave</strong>, clique no ícone de instalação na barra de endereços (lado direito).
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <span>
                      Confirme a instalação. O aplicativo criará um atalho no seu lançador de aplicativos desktop (GNOME, KDE, etc.).
                    </span>
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Modal / Gate Footer */}
        <div
          className={`p-4 sm:p-5 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
            highContrast
              ? 'bg-zinc-950 border-yellow-400'
              : 'bg-slate-50 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800'
          }`}
        >
          <button
            id="continue-to-app-btn"
            type="button"
            onClick={onClose}
            className={`w-full sm:w-auto px-6 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all active:scale-98 ${
              highContrast
                ? 'bg-white text-black hover:bg-yellow-400'
                : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 shadow-md'
            }`}
          >
            <span>{isGateScreen ? 'Acessar Lista de Compras / Continuar no Navegador' : 'Continuar para a Lista de Compras'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center sm:text-right">
            {isGateScreen
              ? 'Você também poderá instalar mais tarde através do botão "Instalar App" no topo da tela.'
              : 'Você também pode instalar mais tarde através do botão "Instalar App" no topo da tela.'}
          </p>
        </div>
      </div>
  );

  if (isGateScreen) {
    return (
      <div
        id="pwa-install-gate-screen"
        className={`min-h-screen w-full flex flex-col items-center justify-center p-3 sm:p-6 lg:p-8 transition-colors ${
          highContrast
            ? 'bg-black text-white'
            : 'bg-gradient-to-b from-emerald-50/80 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white'
        }`}
      >
        {innerModal}
      </div>
    );
  }

  return (
    <div
      id="pwa-install-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-install-title"
    >
      {innerModal}
    </div>
  );
}
