'use client';

import React from 'react';
import { Check, Trash2, Plus, Minus, DollarSign } from 'lucide-react';
import { ShoppingItem, FontSizeOption } from '@/types/shopping';
import { CATEGORIES } from '@/lib/categories';

interface ItemRowProps {
  item: ShoppingItem;
  onToggleBought: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateQuantity: (id: string, newQty: number) => void;
  fontSize: FontSizeOption;
  highContrast: boolean;
}

export const ItemRow: React.FC<ItemRowProps> = ({
  item,
  onToggleBought,
  onDelete,
  onUpdateQuantity,
  fontSize,
  highContrast,
}) => {
  const cat = CATEGORIES[item.category] || CATEGORIES.outros;

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

  return (
    <div
      id={`item-row-${item.id}`}
      className={`group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all duration-150 ${
        item.isBought
          ? highContrast
            ? 'bg-zinc-900/80 border-zinc-700 text-zinc-400 opacity-75'
            : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-slate-500 dark:text-slate-400'
          : highContrast
          ? 'bg-black border-2 border-white text-white hover:border-yellow-400'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-xs hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700'
      }`}
    >
      {/* Left section: Large Checkbox + Info */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 pr-2">
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
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform active:scale-90 focus:outline-none focus:ring-4 focus:ring-emerald-400 ${
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
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`truncate transition-all ${nameSizeClass} ${
                item.isBought ? 'line-through opacity-70' : ''
              }`}
            >
              {item.name}
            </span>

            {/* Category Pill without icons */}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-semibold ${cat.bgColor} ${cat.color} ${cat.borderColor}`}
            >
              <span>{cat.name}</span>
            </span>
          </div>

          {/* Subtext: Price / Notes */}
          {item.estimatedPrice !== undefined && item.estimatedPrice > 0 && (
            <div className={`flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400 mt-0.5 ${subTextSizeClass}`}>
              <DollarSign className="w-3.5 h-3.5" />
              <span>
                Total est.: R$ {(item.estimatedPrice * item.quantity).toFixed(2).replace('.', ',')}
              </span>
              <span className="text-xs text-slate-500 font-normal">
                (R$ {item.estimatedPrice.toFixed(2).replace('.', ',')}/{item.unit})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right Section: Quantity & Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Quantity Controls & Large Badge */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
          {!item.isBought && (
            <button
              id={`qty-minus-${item.id}`}
              type="button"
              onClick={() => onUpdateQuantity(item.id, Math.max(0.5, item.quantity - (item.unit === 'kg' || item.unit === 'L' ? 0.5 : 1)))}
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-200 active:scale-90"
              aria-label={`Diminuir quantidade de ${item.name}`}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Large Numerals for Easy Vision */}
          <div className="px-1.5 text-center">
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
              onClick={() => onUpdateQuantity(item.id, item.quantity + (item.unit === 'kg' || item.unit === 'L' ? 0.5 : 1))}
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
