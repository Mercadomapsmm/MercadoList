'use client';

import React, { useState, useMemo } from 'react';
import { ShoppingList } from '@/types/shopping';
import {
  X,
  Share2,
  Copy,
  Check,
  QrCode,
  Download,
  Upload,
  ExternalLink,
  MessageCircle,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import { encodeListsForUrl, formatWhatsAppMessage, exportListsToJsonFile } from '@/lib/sharing';
import { playAddSound } from '@/lib/sound';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  lists: ShoppingList[];
  activeList: ShoppingList;
  userName: string;
  highContrast: boolean;
  soundEnabled: boolean;
  onImportLists: (newLists: ShoppingList[]) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  lists,
  activeList,
  userName,
  highContrast,
  soundEnabled,
  onImportLists,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [importFeedback, setImportFeedback] = useState<string | null>(null);

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const encoded = encodeListsForUrl(lists, userName);
    return `${window.location.origin}${window.location.pathname}?shared_data=${encoded}`;
  }, [lists, userName]);

  if (!isOpen) return null;

  const totalItemsAcrossLists = lists.reduce((acc, l) => acc + l.items.length, 0);

  // Copiar link com dados embutidos
  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    if (soundEnabled) playAddSound();
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Copiar texto formatado da lista ativa
  const handleCopyText = () => {
    const text = formatWhatsAppMessage(activeList, shareUrl);
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    if (soundEnabled) playAddSound();
    setTimeout(() => setCopiedText(false), 3000);
  };

  // Compartilhamento direto no WhatsApp
  const handleShareWhatsApp = () => {
    const text = formatWhatsAppMessage(activeList, shareUrl);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Compartilhamento Nativo do Sistema / Celular (Web Share API)
  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Lista de Compras: ${activeList.name}`,
          text: `Confira minha lista de compras "${activeList.name}" e use o aplicativo para sincronizar os itens:`,
          url: shareUrl,
        });
      } catch {
        // Usuário cancelou o compartilhamento nativo
      }
    } else {
      handleCopyLink();
    }
  };

  // Importar de arquivo JSON
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        const importedLists = parsed.lists || (Array.isArray(parsed) ? parsed : null);

        if (Array.isArray(importedLists) && importedLists.length > 0) {
          onImportLists(importedLists);
          setImportFeedback(`Sucesso! ${importedLists.length} lista(s) importada(s).`);
          if (soundEnabled) playAddSound();
          setTimeout(() => setImportFeedback(null), 4000);
        } else {
          setImportFeedback('Formato inválido. O arquivo deve conter listas válidas.');
        }
      } catch {
        setImportFeedback('Erro ao ler o arquivo JSON selecionado.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // URL para imagem de QR Code
  const qrCodeImageUrl = shareUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(shareUrl)}`
    : '';

  return (
    <div
      id="share-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="share-modal-card"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-lg rounded-2xl p-5 sm:p-6 shadow-2xl border transition-all max-h-[90vh] overflow-y-auto ${
          highContrast
            ? 'bg-black border-2 border-yellow-400 text-white'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                Compartilhar Aplicativo & Listas
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Compartilhe o app com suas {lists.length} listas e {totalItemsAcrossLists} itens com outras pessoas
              </p>
            </div>
          </div>
          <button
            id="close-share-modal-btn"
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {importFeedback && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{importFeedback}</span>
          </div>
        )}

        {/* Action Options */}
        <div className="mt-5 space-y-3.5">
          {/* 1. Compartilhar no WhatsApp (Ação Principal Recomendada) */}
          <button
            id="share-whatsapp-btn"
            type="button"
            onClick={handleShareWhatsApp}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-md active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="text-left leading-tight">
                <span className="block text-sm sm:text-base font-extrabold">
                  Enviar pelo WhatsApp
                </span>
                <span className="text-xs text-emerald-100 font-normal">
                  Envia a lista com link para abrir e sincronizar no app
                </span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-emerald-100" />
          </button>

          {/* 2. Compartilhamento Nativo do Sistema (Celular / Computador) */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              id="native-device-share-btn"
              type="button"
              onClick={handleNativeShare}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl border font-bold transition-all ${
                highContrast
                  ? 'border-yellow-400 text-yellow-300 hover:bg-zinc-900'
                  : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="text-left leading-tight">
                  <span className="block text-sm sm:text-base">
                    Menu de Compartilhamento do Celular
                  </span>
                  <span className="text-xs text-slate-500 font-normal">
                    Telegram, e-mail, redes sociais ou Bluetooth
                  </span>
                </div>
              </div>
              <Share2 className="w-4 h-4 text-slate-400" />
            </button>
          )}

          {/* 3. Copiar Link do App com as Listas Embutidas */}
          <div
            className={`p-3.5 rounded-xl border ${
              highContrast
                ? 'border-zinc-700 bg-zinc-950'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Link do Aplicativo com Suas Listas:
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                Contém {lists.length} listas prontas
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="share-link-input"
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 text-xs rounded-lg border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-mono truncate"
              />
              <button
                id="copy-share-link-btn"
                type="button"
                onClick={handleCopyLink}
                className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                  copiedLink
                    ? 'bg-emerald-600 text-white'
                    : highContrast
                    ? 'bg-yellow-400 text-black font-extrabold'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
              Qualquer pessoa que abrir este link terá acesso instantâneo ao aplicativo com todas as suas listas carregadas.
            </p>
          </div>

          {/* 4. Copiar Texto Formatado & Visualizar QR Code */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              id="copy-formatted-text-btn"
              type="button"
              onClick={handleCopyText}
              className={`p-3 rounded-xl border text-xs sm:text-sm font-bold flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                copiedText
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Copy className="w-4 h-4 text-emerald-600" />
              <span>{copiedText ? 'Texto Copiado!' : 'Copiar Texto da Lista'}</span>
            </button>

            <button
              id="toggle-qr-code-btn"
              type="button"
              onClick={() => setShowQr(!showQr)}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-bold flex flex-col items-center justify-center gap-1.5 transition-all text-center"
            >
              <QrCode className="w-4 h-4 text-emerald-600" />
              <span>{showQr ? 'Ocultar QR Code' : 'Escanear com a Câmera'}</span>
            </button>
          </div>

          {/* QR Code Display */}
          {showQr && qrCodeImageUrl && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col items-center justify-center text-center animate-in fade-in">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                Aponte a câmera do celular para abrir o app com as listas:
              </p>
              <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrCodeImageUrl}
                  alt="QR Code da Lista de Compras"
                  className="w-44 h-44 object-contain"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Ideal para compartilhar rapidamente na mesma casa ou mercado.
              </p>
            </div>
          )}

          {/* 5. Backup em Arquivo JSON (Exportar e Importar) */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2">
              Backup e Transferência por Arquivo:
            </span>
            <div className="flex items-center gap-2">
              <button
                id="export-json-btn"
                type="button"
                onClick={() => exportListsToJsonFile(lists, userName)}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Baixar Arquivo (.json)</span>
              </button>

              <label
                htmlFor="import-json-input"
                className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                <span>Importar Arquivo (.json)</span>
              </label>
              <input
                id="import-json-input"
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="sr-only"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
