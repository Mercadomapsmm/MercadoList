'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ShoppingList, ShoppingItem, AccessibilitySettings, CategoryId } from '@/types/shopping';
import { AccessibilityBar } from '@/components/AccessibilityBar';
import { AddItemBar } from '@/components/AddItemBar';
import { ItemRow } from '@/components/ItemRow';
import { ShoppingListSummary } from '@/components/ShoppingListSummary';
import { ListSelector } from '@/components/ListSelector';
import { VoiceModal } from '@/components/VoiceModal';
import { ProductTableModal } from '@/components/ProductTableModal';
import { PwaRegister } from '@/components/PwaRegister';
import { PwaInstallPrompt } from '@/components/PwaInstallPrompt';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { CATEGORIES, detectCategory } from '@/lib/categories';
import { agruparItensPorTabela } from '@/lib/productTable';
import { speakListItems, stopSpeaking } from '@/lib/speech';
import { playCheckSound, playUncheckSound, playCompleteSound } from '@/lib/sound';
import { Mic, Search, CheckCircle, ShoppingCart, Layers, BookOpen, Download, Smartphone } from 'lucide-react';

const INITIAL_LISTS: ShoppingList[] = [
  {
    id: 'list-supermercado',
    name: 'Supermercado Semanal',
    icon: '🛒',
    color: '#059669',
    createdAt: Date.now() - 3600000 * 24,
    updatedAt: Date.now(),
    items: [
      {
        id: 'item-1',
        name: 'Arroz agulhinha tipo 1',
        quantity: 1,
        unit: 'pct',
        category: 'mercearia',
        estimatedPrice: 28.50,
        isBought: false,
        createdAt: Date.now() - 50000,
      },
      {
        id: 'item-2',
        name: 'Feijão carioca',
        quantity: 1,
        unit: 'kg',
        category: 'mercearia',
        estimatedPrice: 8.90,
        isBought: false,
        createdAt: Date.now() - 40000,
      },
      {
        id: 'item-3',
        name: 'Leite integral',
        quantity: 3,
        unit: 'cx',
        category: 'laticinios',
        estimatedPrice: 5.20,
        isBought: true,
        createdAt: Date.now() - 30000,
      },
      {
        id: 'item-4',
        name: 'Ovos brancos grandes',
        quantity: 1,
        unit: 'dz',
        category: 'laticinios',
        estimatedPrice: 16.00,
        isBought: false,
        createdAt: Date.now() - 20000,
      },
      {
        id: 'item-5',
        name: 'Banana prata',
        quantity: 1,
        unit: 'dz',
        category: 'hortifruti',
        estimatedPrice: 9.50,
        isBought: false,
        createdAt: Date.now() - 15000,
      },
      {
        id: 'item-6',
        name: 'Tomate para salada',
        quantity: 1.5,
        unit: 'kg',
        category: 'hortifruti',
        estimatedPrice: 7.00,
        isBought: false,
        createdAt: Date.now() - 10000,
      },
      {
        id: 'item-7',
        name: 'Detergente de coco',
        quantity: 2,
        unit: 'un',
        category: 'limpeza',
        estimatedPrice: 2.80,
        isBought: true,
        createdAt: Date.now() - 5000,
      },
    ],
  },
  {
    id: 'list-feira',
    name: 'Feira & Frutas',
    icon: '🍎',
    color: '#d97706',
    createdAt: Date.now() - 3600000 * 12,
    updatedAt: Date.now(),
    items: [
      {
        id: 'item-f1',
        name: 'Maçã gala',
        quantity: 1,
        unit: 'kg',
        category: 'hortifruti',
        estimatedPrice: 11.90,
        isBought: false,
        createdAt: Date.now() - 3000,
      },
      {
        id: 'item-f2',
        name: 'Batata inglesa',
        quantity: 2,
        unit: 'kg',
        category: 'hortifruti',
        estimatedPrice: 6.50,
        isBought: false,
        createdAt: Date.now() - 2000,
      },
      {
        id: 'item-f3',
        name: 'Alface americana',
        quantity: 1,
        unit: 'un',
        category: 'hortifruti',
        estimatedPrice: 4.50,
        isBought: false,
        createdAt: Date.now() - 1000,
      },
    ],
  },
  {
    id: 'list-limpeza',
    name: 'Limpeza & Casa',
    icon: '🧹',
    color: '#0d9488',
    createdAt: Date.now() - 3600000 * 4,
    updatedAt: Date.now(),
    items: [
      {
        id: 'item-l1',
        name: 'Sabão em pó',
        quantity: 1,
        unit: 'cx',
        category: 'limpeza',
        estimatedPrice: 18.90,
        isBought: false,
        createdAt: Date.now() - 2500,
      },
      {
        id: 'item-l2',
        name: 'Água sanitária',
        quantity: 1,
        unit: 'garrafa',
        category: 'limpeza',
        estimatedPrice: 6.90,
        isBought: false,
        createdAt: Date.now() - 1500,
      },
    ],
  },
];

const DEFAULT_SETTINGS: AccessibilitySettings = {
  fontSize: 'normal',
  highContrast: false,
  soundFeedback: true,
  groupByCategory: false,
  speechSpeed: 1.0,
};

export default function ShoppingListPage() {
  const [hasMounted, setHasMounted] = useState(false);
  const [lists, setLists] = useState<ShoppingList[]>(INITIAL_LISTS);
  const [activeListId, setActiveListId] = useState<string>('list-supermercado');
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);

  const [filter, setFilter] = useState<'all' | 'pending' | 'bought'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isProductTableModalOpen, setIsProductTableModalOpen] = useState(false);
  const [isPwaInstallModalOpen, setIsPwaInstallModalOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [hasEnteredApp, setHasEnteredApp] = useState(false);

  // Load from localStorage & check PWA install status on mount only to prevent hydration mismatch
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedLists = localStorage.getItem('lista_compras_domestica_lists');
        if (savedLists) {
          const parsed = JSON.parse(savedLists);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setLists(parsed);
          }
        }
        const savedActiveId = localStorage.getItem('lista_compras_domestica_active_id');
        if (savedActiveId) {
          setActiveListId(savedActiveId);
        }
        const savedSettings = localStorage.getItem('lista_compras_domestica_settings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }

        // Check if running as standalone PWA
        const standalone =
          window.matchMedia('(display-mode: standalone)').matches ||
          (window.navigator as unknown as { standalone?: boolean }).standalone === true;
        setIsStandalone(standalone);

        // Se estiver em modo standalone ou o usuário já liberou a entrada na sessão
        const alreadyEntered = sessionStorage.getItem('pwa_has_entered_app') === 'true';
        if (standalone || alreadyEntered) {
          setHasEnteredApp(true);
        }
      } catch {
        // Ignore
      }
      setHasMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Save to localStorage when state updates after mount
  useEffect(() => {
    if (!hasMounted) return;
    try {
      localStorage.setItem('lista_compras_domestica_lists', JSON.stringify(lists));
      localStorage.setItem('lista_compras_domestica_settings', JSON.stringify(settings));
      localStorage.setItem('lista_compras_domestica_active_id', activeListId);
    } catch {
      // Ignore
    }
  }, [lists, settings, activeListId, hasMounted]);

  const handleEnterApp = () => {
    try {
      sessionStorage.setItem('pwa_has_entered_app', 'true');
    } catch {
      // Ignore
    }
    setHasEnteredApp(true);
    setIsPwaInstallModalOpen(false);
  };

  const handleClosePwaModal = () => {
    setIsPwaInstallModalOpen(false);
  };

  const activeList = lists.find(l => l.id === activeListId) || lists[0];

  const handleUpdateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleSelectList = (id: string) => {
    setActiveListId(id);
    stopSpeaking();
    setIsSpeaking(false);
  };

  const handleCreateList = (name: string) => {
    const newList: ShoppingList = {
      id: `list-${Date.now()}`,
      name,
      icon: '🛒',
      color: '#059669',
      items: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setLists(prev => [newList, ...prev]);
    setActiveListId(newList.id);
  };

  const handleDeleteList = (id: string) => {
    if (lists.length <= 1) return;
    const remaining = lists.filter(l => l.id !== id);
    setLists(remaining);
    if (activeListId === id) {
      setActiveListId(remaining[0].id);
    }
  };

  const handleAddItem = (itemData: Omit<ShoppingItem, 'id' | 'createdAt' | 'isBought'>) => {
    // Classifica automaticamente de acordo com as categorias de supermercado se for 'outros' ou não especificado
    const detected = detectCategory(itemData.name);
    const finalCategory = (!itemData.category || itemData.category === 'outros') ? detected : itemData.category;

    const newItem: ShoppingItem = {
      ...itemData,
      category: finalCategory,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
      isBought: false,
    };

    setLists(prev =>
      prev.map(l => {
        if (l.id === activeListId) {
          return {
            ...l,
            items: [newItem, ...l.items],
            updatedAt: Date.now(),
          };
        }
        return l;
      })
    );
  };

  const handleAddMultipleVoiceItems = (parsedItems: { name: string; quantity: number; unit: string; category: string }[]) => {
    const newItems: ShoppingItem[] = parsedItems.map((p, idx) => {
      const detected = detectCategory(p.name);
      const finalCategory = (!p.category || p.category === 'outros') ? detected : p.category;
      return {
        id: `item-${Date.now()}-${idx}`,
        name: p.name,
        quantity: p.quantity,
        unit: p.unit as any,
        category: finalCategory as any,
        isBought: false,
        createdAt: Date.now() + idx,
      };
    });

    setLists(prev =>
      prev.map(l => {
        if (l.id === activeListId) {
          return {
            ...l,
            items: [...newItems, ...l.items],
            updatedAt: Date.now(),
          };
        }
        return l;
      })
    );
  };

  const handleToggleBought = (itemId: string) => {
    let nowCompleted = false;

    setLists(prev =>
      prev.map(l => {
        if (l.id === activeListId) {
          const updatedItems = l.items.map(item => {
            if (item.id === itemId) {
              const newBought = !item.isBought;
              if (settings.soundFeedback) {
                if (newBought) {
                  playCheckSound();
                } else {
                  playUncheckSound();
                }
              }
              return { ...item, isBought: newBought };
            }
            return item;
          });

          // Check if all items are now bought!
          const allBought = updatedItems.length > 0 && updatedItems.every(i => i.isBought);
          if (allBought) {
            nowCompleted = true;
          }

          return { ...l, items: updatedItems, updatedAt: Date.now() };
        }
        return l;
      })
    );

    if (nowCompleted) {
      if (settings.soundFeedback) playCompleteSound();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Confetti fallback
      }
    }
  };

  const handleDeleteItem = (itemId: string) => {
    setLists(prev =>
      prev.map(l => {
        if (l.id === activeListId) {
          return {
            ...l,
            items: l.items.filter(i => i.id !== itemId),
            updatedAt: Date.now(),
          };
        }
        return l;
      })
    );
  };

  const handleUpdateQuantity = (itemId: string, newQty: number) => {
    setLists(prev =>
      prev.map(l => {
        if (l.id === activeListId) {
          return {
            ...l,
            items: l.items.map(item =>
              item.id === itemId ? { ...item, quantity: Math.max(0.1, newQty) } : item
            ),
            updatedAt: Date.now(),
          };
        }
        return l;
      })
    );
  };

  const handleClearBought = () => {
    if (!confirm('Deseja remover todos os itens que já foram colocados no carrinho?')) return;
    setLists(prev =>
      prev.map(l => {
        if (l.id === activeListId) {
          return {
            ...l,
            items: l.items.filter(i => !i.isBought),
            updatedAt: Date.now(),
          };
        }
        return l;
      })
    );
  };

  const handleReadList = () => {
    if (!activeList) return;
    setIsSpeaking(true);
    speakListItems(activeList.items, settings.speechSpeed);

    // Watch when speech ends
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const checkInterval = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          setIsSpeaking(false);
          clearInterval(checkInterval);
        }
      }, 500);
    }
  };

  const handleStopSpeaking = () => {
    stopSpeaking();
    setIsSpeaking(false);
  };

  // Filter items
  const filteredItems = (activeList?.items || []).filter(item => {
    if (filter === 'pending' && item.isBought) return false;
    if (filter === 'bought' && !item.isBought) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const catName = CATEGORIES[item.category]?.name.toLowerCase() || '';
      const matchCat = catName.includes(q);
      if (!matchName && !matchCat) return false;
    }
    return true;
  });

  const pendingItems = (activeList?.items || []).filter(i => !i.isBought);
  const boughtItems = (activeList?.items || []).filter(i => i.isBought);

  // Agrupamento dos produtos utilizando a Tabela de Produtos e Classificação de Categorias
  const groupedItems = React.useMemo(() => {
    if (!settings.groupByCategory) return null;
    return agruparItensPorTabela(filteredItems);
  }, [filteredItems, settings.groupByCategory]);

  const containerPaddingClass = {
    normal: 'p-4 sm:p-6',
    large: 'p-5 sm:p-7',
    extra: 'p-6 sm:p-8',
  }[settings.fontSize];

  // Carregamento inicial rápido para sincronizar estado e evitar hydration mismatch
  if (!hasMounted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 animate-pulse mb-3">
          <Smartphone className="w-8 h-8" />
        </div>
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Carregando Lista de Compras...</p>
      </div>
    );
  }

  // Solicitar a instalação ANTES de apresentar o aplicativo
  // Se o aplicativo ainda não foi aberto em modo standalone (PWA instalado) e o usuário ainda não confirmou a entrada:
  if (!isStandalone && !hasEnteredApp) {
    return (
      <div className={settings.highContrast ? 'contrast-high' : ''}>
        <PwaRegister />
        <OfflineIndicator />
        <PwaInstallPrompt
          isOpen={true}
          isGateScreen={true}
          highContrast={settings.highContrast}
          onClose={handleEnterApp}
        />
      </div>
    );
  }

  return (
    <div
      id="app-root"
      suppressHydrationWarning
      className={`min-h-screen transition-colors ${
        settings.highContrast
          ? 'bg-black text-white'
          : 'bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100'
      }`}
    >
      {/* Top Accessibility Settings Toolbar */}
      <AccessibilityBar
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onReadList={handleReadList}
        isSpeaking={isSpeaking}
        onStopSpeaking={handleStopSpeaking}
        remainingCount={pendingItems.length}
        onOpenInstallModal={() => setIsPwaInstallModalOpen(true)}
        isStandalone={isStandalone}
      />

      {/* Main Container */}
      <main className={`max-w-4xl mx-auto ${containerPaddingClass} space-y-5 sm:space-y-6`}>
        {/* App Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-4 border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
              <ShoppingCart className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
                <span>Lista de Compras</span>
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                Controle doméstico fácil com comando de voz e alta legibilidade
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            {/* Botão de Instalação PWA para qualquer dispositivo */}
            {!isStandalone && (
              <button
                id="header-install-app-button"
                type="button"
                onClick={() => setIsPwaInstallModalOpen(true)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95 ${
                  settings.highContrast
                    ? 'bg-yellow-400 text-black border-yellow-300 ring-2 ring-yellow-300 font-extrabold'
                    : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                }`}
                title="Instalar este aplicativo no seu celular ou computador"
              >
                <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Instalar App</span>
              </button>
            )}

            {/* Quick Voice Command CTA Banner */}
            <button
              id="header-voice-cta-button"
              type="button"
              onClick={() => setIsVoiceModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-md active:scale-95 text-xs sm:text-sm"
              title="Ditar itens para a lista usando a voz"
            >
              <Mic className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
              <span>Adicionar por Voz</span>
            </button>
          </div>
        </header>

        {/* List Navigation Tabs */}
        <ListSelector
          lists={lists}
          activeListId={activeListId}
          onSelectList={handleSelectList}
          onCreateList={handleCreateList}
          onDeleteList={handleDeleteList}
          fontSize={settings.fontSize}
          highContrast={settings.highContrast}
          soundEnabled={settings.soundFeedback}
        />

        {/* Add Item Form / Quick Staples */}
        <AddItemBar
          onAddItem={handleAddItem}
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          fontSize={settings.fontSize}
          highContrast={settings.highContrast}
          soundEnabled={settings.soundFeedback}
        />

        {/* Shopping Progress & Summary Card */}
        {activeList && (
          <ShoppingListSummary
            items={activeList.items}
            filter={filter}
            onFilterChange={setFilter}
            onClearBought={handleClearBought}
            onReadList={handleReadList}
            listName={activeList.name}
            fontSize={settings.fontSize}
            highContrast={settings.highContrast}
          />
        )}

        {/* Search Bar & Group by Categories Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="search-items-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar item ou categoria nesta lista..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sm sm:text-base font-semibold focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Botão para agrupar por categorias */}
          <button
            id="group-by-category-button"
            type="button"
            onClick={() => handleUpdateSettings({ groupByCategory: !settings.groupByCategory })}
            className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all shrink-0 active:scale-95 ${
              settings.highContrast
                ? settings.groupByCategory
                  ? 'bg-yellow-400 text-black border-yellow-300 ring-2 ring-yellow-300 font-extrabold'
                  : 'bg-black text-white border-white hover:bg-zinc-900'
                : settings.groupByCategory
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Agrupar os produtos da lista por categorias de supermercado"
          >
            <Layers className="w-4 h-4" />
            <span>{settings.groupByCategory ? 'Agrupado por Categorias' : 'Agrupar por Categorias'}</span>
          </button>

          {/* Botão para ver tabela de produtos e classificação das categorias */}
          <button
            id="open-product-table-modal-btn"
            type="button"
            onClick={() => setIsProductTableModalOpen(true)}
            className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all shrink-0 active:scale-95 ${
              settings.highContrast
                ? 'bg-black text-yellow-300 border-yellow-400 hover:bg-zinc-900'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Ver tabela completa com nome dos produtos e classificação por categorias"
          >
            <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Tabela de Produtos</span>
          </button>
        </div>

        {/* Items Listing Section */}
        <section
          id="items-list-container"
          aria-label="Itens da lista de compras"
          className="space-y-2.5"
        >
          {filteredItems.length === 0 ? (
            <div className="p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-3">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200">
                {activeList?.items.length === 0
                  ? 'Sua lista está vazia!'
                  : 'Nenhum item encontrado no filtro atual.'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                {activeList?.items.length === 0
                  ? 'Adicione itens escrevendo no campo acima ou toque em "Adicionar por Voz" para ditar sua lista.'
                  : 'Mude os filtros para "Todos" ou limpe o termo de busca.'}
              </p>
            </div>
          ) : settings.groupByCategory && groupedItems ? (
            <div className="space-y-4">
              {groupedItems.map(group => {
                const boughtInGroup = group.items.filter(i => i.isBought).length;

                return (
                  <div
                    key={group.categoryId}
                    id={`category-group-${group.categoryId}`}
                    className="space-y-2"
                  >
                    {/* Category Header Banner */}
                    <div
                      className={`flex items-center justify-between px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-bold ${
                        settings.highContrast
                          ? 'bg-zinc-900 text-yellow-300 border-yellow-400'
                          : `${group.category.bgColor} ${group.category.color} ${group.category.borderColor}`
                      }`}
                    >
                      <span className="uppercase tracking-wider font-extrabold">
                        {group.category.name}
                      </span>
                      <span className="text-xs font-semibold opacity-90">
                        {group.items.length} {group.items.length === 1 ? 'item' : 'itens'}
                        {boughtInGroup > 0 && ` (${boughtInGroup} no carrinho)`}
                      </span>
                    </div>

                    {/* Category Products */}
                    <div className="space-y-2">
                      {group.items.map(item => (
                        <ItemRow
                          key={item.id}
                          item={item}
                          onToggleBought={handleToggleBought}
                          onDelete={handleDeleteItem}
                          onUpdateQuantity={handleUpdateQuantity}
                          fontSize={settings.fontSize}
                          highContrast={settings.highContrast}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map(item => (
                <ItemRow
                  key={item.id}
                  item={item}
                  onToggleBought={handleToggleBought}
                  onDelete={handleDeleteItem}
                  onUpdateQuantity={handleUpdateQuantity}
                  fontSize={settings.fontSize}
                  highContrast={settings.highContrast}
                />
              ))}
            </div>
          )}
        </section>

        {/* Helpful Accessibility & Household Tips Footer */}
        <footer className="pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 space-y-1">
          <p className="font-semibold">
            Dica para compras: Marque os itens com um toque conforme coloca no carrinho. Use o botão &ldquo;Ouvir Lista&rdquo; para saber o que ainda falta comprar.
          </p>
          <p className="text-[11px] text-slate-400">
            Lista de Compras Doméstica • Projetado para todas as idades com alta acessibilidade visual e comando de voz.
          </p>
        </footer>
      </main>

      {/* Voice Recognition Modal */}
      <VoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onAddItems={handleAddMultipleVoiceItems}
        fontSize={settings.fontSize}
        highContrast={settings.highContrast}
        soundEnabled={settings.soundFeedback}
      />

      {/* Tabela de Produtos e Classificação das Categorias */}
      <ProductTableModal
        isOpen={isProductTableModalOpen}
        onClose={() => setIsProductTableModalOpen(false)}
        onAddProduct={(name, category, unit) => {
          handleAddItem({
            name,
            category,
            quantity: 1,
            unit: (unit as any) || 'un',
          });
        }}
        highContrast={settings.highContrast}
      />

      {/* PWA Service Worker Auto-Registration */}
      <PwaRegister />

      {/* Offline Connectivity Status Toast */}
      <OfflineIndicator />

      {/* PWA Installation Prompt Gate for all devices & OS versions */}
      <PwaInstallPrompt
        isOpen={isPwaInstallModalOpen}
        onClose={handleClosePwaModal}
        highContrast={settings.highContrast}
      />
    </div>
  );
}
