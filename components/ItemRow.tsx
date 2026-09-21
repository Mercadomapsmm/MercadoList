'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Check,
  Trash2,
  Plus,
  Minus,
  DollarSign,
  ChevronDown,
  Pencil,
  X,
  Tag,
} from 'lucide-react';
import { ShoppingItem, FontSizeOption, CategoryId } from '@/types/shopping';
import { CATEGORIES } from '@/lib/categories';

interface ItemRowProps {
  item: ShoppingItem;
  onToggleBought: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateQuantity: (id: string, newQty: number) => void;
  onUpdateCategory: (id: string, newCategory: CategoryId) => void;
  onUpdatePrice: (id: string, newPrice: number) => void;
  fontSize: FontSizeOption;
  highContrast: boolean;
}

export const ItemRow: React.FC<ItemRowProps> = ({
  item,
  onToggleBought,
  onDelete,
  onUpdateQuantity,
  onUpdateCategory,
  onUpdatePrice,
  fontSize,
  highContrast,
}) => {
  const cat = CATEGORIES[item.category] || CATEGORIES.outros;

  // Estado para alteração de preço diretamente na lista
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [priceInput, setPriceInput] = useState(() =>
    item.estimatedPrice !== undefined && item.estimatedPrice > 0
      ? item.estimatedPrice.toFixed(2).replace('.', ',')
      : ''
  );
  const priceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingPrice && priceInputRef.current) {
      priceInputRef.current.focus();
      priceInputRef.current.select();
    }
  }, [isEditingPrice]);

  const handleSavePrice = () => {
    const cleaned = priceInput.trim().replace(',', '.');
    const parsed = parseFloat(cleaned);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdatePrice(item.id, Math.round(parsed * 100) / 100);
    } else if (cleaned === '') {
      onUpdatePrice(item.id, 0);
    }
    setIsEditingPrice(false);
  };

  const handleCancelPriceEdit = () => {
    setPriceInput(
      item.estimatedPrice !== undefined && item.estimatedPrice > 0
        ? item.estimatedPrice.toFixed(2).replace('.', ',')
        : ''
    );
    setIsEditingPrice(false);
  };

  // Font size adjustments for text and numbers
  const nameSizeClass = {
    normal: 'text-base sm:text-lg font-semibold',
    large: 'text-lg sm:text-xl font-bold',
    extra: 'text-xl sm:text-2xl font-black tracking-wide',
  }[fontSize];

  const numberSizeClass = {
    normal: 'text-lg sm:text-xl font-extrabold',
    large: 'text-xl sm:text-2xl font-black',
    extra: 'text-2xl sm:text-3xl font-black tracking-tight',
  }[fontSize];

  const subTextSizeClass = {
    normal: 'text-xs sm:text-sm',
    large: 'text-sm sm:text-base',
    extra: 'text-base sm:text-lg font-medium',
  }[fontSize];

  const itemHasPrice = item.estimatedPrice !== undefined && item.estimatedPrice > 0;
  const totalPrice = itemHasPrice ? item.estimatedPrice! * item.quantity : 0;

  return (
    <div
      id={`item-row-${item.id}`}
      className={`group relative flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3 sm:p-4 rounded-2xl border transition-all duration-150 gap-2.5 sm:gap-4 ${
        item.isBought
          ? highContrast
            ? 'bg-zinc-900/80 border-zinc-700 text-zinc-400 opacity-75'
            : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-slate-500 dark:text-slate-400'
          : highContrast
          ? 'bg-black border-2 border-white text-white hover:border-yellow-400'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-xs hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700'
      }`}
    >
      {/* Left section: Large Checkbox + Name + Interactive Category + Price */}
      <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0 pr-1">
        {/* Jumbo Accessible Checkbox */}
        <button
          id={`checkbox-item-${item.id}`}
          type="button"
          onClick={() => onToggleBought(item.id)}
          aria-label={
            item.isBought
              ? `Desmarcar ${item.name} da lista de compras`
              : `Marcar ${item.name} como comprado`
          }
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform active:scale-90 focus:outline-none focus:ring-4 focus:ring-emerald-400 mt-0.5 sm:mt-0 ${
            item.isBought
              ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500'
              : highContrast
              ? 'border-3 border-white bg-transparent hover:bg-white/20'
              : 'border-2 border-slate-400 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 hover:border-emerald-500'
          }`}
        >
          {item.isBought ? (
            <Check className="w-6 h-6 sm:w-7 sm:h-7 stroke-[3.5]" />
          ) : (
            <span className="w-3 h-3 rounded-sm bg-transparent" />
          )}
        </button>

        {/* Item Details */}
        <div className="flex flex-col min-w-0 flex-1">
          {/* Top Line: Name & Category Dropdown */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`truncate transition-all ${nameSizeClass} ${
                item.isBought ? 'line-through opacity-70' : ''
              }`}
            >
              {item.name}
            </span>

            {/* Interactive Category Selector (Permite alterar a categoria diretamente na lista) */}
            <div className="relative inline-flex items-center">
              <label htmlFor={`cat-select-${item.id}`} className="sr-only">
                Alterar categoria de {item.name}
              </label>
              <select
                id={`cat-select-${item.id}`}
                value={item.category}
                onChange={(e) => onUpdateCategory(item.id, e.target.value as CategoryId)}
                title="Clique para alterar a categoria deste produto"
                className={`appearance-none cursor-pointer pl-2.5 pr-6 py-0.5 rounded-lg border text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  highContrast
                    ? 'bg-zinc-800 text-yellow-300 border-yellow-400'
                    : `${cat.bgColor} ${cat.color} ${cat.borderColor} hover:brightness-95`
                }`}
              >
                {Object.values(CATEGORIES).map((c) => (
                  <option
                    key={c.id}
                    value={c.id}
                    className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium"
                  >
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-1.5 pointer-events-none opacity-70" />
            </div>
          </div>

          {/* Subtext: Price Display & Price Inline Editor (Mostre o preço do produto na lista e permita fazer alteração) */}
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            {isEditingPrice ? (
              /* Inline Price Form */
              <form
                id={`form-edit-price-${item.id}`}
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSavePrice();
                }}
                className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-emerald-500 shadow-sm"
              >
                <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 pl-1">
                  R$
                </span>
                <input
                  ref={priceInputRef}
                  id={`input-price-${item.id}`}
                  type="text"
                  inputMode="decimal"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  placeholder="0,00"
                  className="w-20 px-1.5 py-0.5 text-xs font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded border border-slate-300 dark:border-slate-700 outline-none focus:ring-1 focus:ring-emerald-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') handleCancelPriceEdit();
                  }}
                />
                <span className="text-[10px] text-slate-500 font-medium">/{item.unit}</span>
                <button
                  id={`save-price-btn-${item.id}`}
                  type="submit"
                  className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                  title="Salvar novo preço"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  id={`cancel-price-btn-${item.id}`}
                  type="button"
                  onClick={handleCancelPriceEdit}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title="Cancelar alteração"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : itemHasPrice ? (
              /* Price display with edit button */
              <button
                id={`edit-price-btn-${item.id}`}
                type="button"
                onClick={() => {
                  setPriceInput(item.estimatedPrice!.toFixed(2).replace('.', ','));
                  setIsEditingPrice(true);
                }}
                className={`group/price inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all text-left ${
                  highContrast
                    ? 'border-yellow-400 text-yellow-300 hover:bg-zinc-800'
                    : 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                } ${subTextSizeClass}`}
                title="Clique para alterar o preço deste produto"
              >
                <DollarSign className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>
                  R$ {item.estimatedPrice!.toFixed(2).replace('.', ',')}
                  <span className="text-[11px] font-normal opacity-75 ml-0.5">/{item.unit}</span>
                </span>
                <span className="text-[11px] font-semibold opacity-80 border-l border-emerald-300 dark:border-emerald-700 pl-1.5">
                  Total: R$ {totalPrice.toFixed(2).replace('.', ',')}
                </span>
                <Pencil className="w-3 h-3 text-emerald-600/70 dark:text-emerald-400/70 ml-1 group-hover/price:text-emerald-600 group-hover/price:scale-110 transition-transform" />
              </button>
            ) : (
              /* No price set yet - prominent button to define price */
              <button
                id={`add-price-btn-${item.id}`}
                type="button"
                onClick={() => {
                  setPriceInput('');
                  setIsEditingPrice(true);
                }}
                className={`group/price inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
                  highContrast
                    ? 'border-zinc-700 text-zinc-300 hover:border-yellow-400 hover:text-yellow-300'
                    : 'border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-emerald-600 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30'
                } ${subTextSizeClass}`}
                title="Clique para definir o preço deste produto"
              >
                <Tag className="w-3 h-3 text-slate-400 group-hover/price:text-emerald-600" />
                <span>Preço: R$ 0,00 • Definir preço</span>
                <Pencil className="w-2.5 h-2.5 opacity-60 ml-0.5 group-hover/price:opacity-100" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right Section: Quantity & Delete Controls */}
      <div className="flex items-center justify-end sm:justify-center gap-2 sm:gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
        {/* Quantity Controls & Large Badge */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
          {!item.isBought && (
            <button
              id={`qty-minus-${item.id}`}
              type="button"
              onClick={() =>
                onUpdateQuantity(
                  item.id,
                  Math.max(0.5, item.quantity - (item.unit === 'kg' || item.unit === 'L' ? 0.5 : 1))
                )
              }
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-200 active:scale-90"
              aria-label={`Diminuir quantidade de ${item.name}`}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Large Numerals for Easy Vision */}
          <div className="px-1.5 text-center min-w-10">
            <span className={`text-emerald-700 dark:text-emerald-400 ${numberSizeClass}`}>
              {item.quantity}
            </span>
            <span className="ml-1 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 uppercase">
              {item.unit}
            </span>
          </div>

          {!item.isBought && (
            <button
              id={`qty-plus-${item.id}`}
              type="button"
              onClick={() =>
                onUpdateQuantity(
                  item.id,
                  item.quantity + (item.unit === 'kg' || item.unit === 'L' ? 0.5 : 1)
                )
              }
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-200 active:scale-90"
              aria-label={`Aumentar quantidade de ${item.name}`}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Delete Item Button */}
        <button
          id={`delete-item-${item.id}`}
          type="button"
          onClick={() => onDelete(item.id)}
          className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          aria-label={`Excluir ${item.name} da lista`}
          title="Excluir item"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
