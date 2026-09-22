'use client';

import React from 'react';
import { ExternalLink, Zap, Star, Truck } from 'lucide-react';

interface MercadoLivreBannerProps {
  position?: 'top' | 'bottom';
  highContrast?: boolean;
}

export const MercadoLivreBanner: React.FC<MercadoLivreBannerProps> = ({
  position = 'top',
  highContrast = false,
}) => {
  return (
    <div
      id={`mercado-livre-banner-${position}`}
      aria-label="Anúncio Mercado Livre: Relógio Masculino em Oferta"
      className={`w-full rounded-xl overflow-hidden border transition-all animate-gentle-blink ${
        highContrast
          ? 'bg-black text-white border-2 border-yellow-400'
          : 'bg-white dark:bg-slate-900 border-[#FFE600] dark:border-amber-500/40 shadow-xs hover:shadow-sm'
      }`}
    >
      {/* Mercado Livre Compact Header Strip */}
      <div className="bg-[#FFE600] text-[#2D3277] px-3 py-1 flex items-center justify-between gap-2 font-bold text-[10px] sm:text-xs">
        <div className="flex items-center gap-1.5">
          <span className="bg-[#2D3277] text-[#FFE600] px-1 py-0.5 rounded text-[10px] font-black">
            ML
          </span>
          <span className="text-[#2D3277] font-black tracking-tight">mercado livre</span>
          <span className="hidden sm:inline text-[#2D3277]/40">|</span>
          <span className="hidden sm:inline-flex items-center gap-0.5 text-[#2D3277] bg-white/70 px-1.5 py-0.5 rounded text-[10px] font-extrabold animate-pulse">
            <Zap className="w-2.5 h-2.5 fill-[#2D3277] text-[#2D3277]" />
            OFERTA DO DIA
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px] sm:text-[11px]">
          <span className="flex items-center gap-0.5 text-emerald-800 bg-emerald-100/90 px-1.5 py-0.5 rounded-full font-black">
            <Truck className="w-2.5 h-2.5" />
            FRETE GRÁTIS
          </span>
          <span className="text-emerald-900 font-black italic">
            <span className="text-[#00A650] font-black mr-0.5">⚡</span>FULL
          </span>
        </div>
      </div>

      {/* Main Banner Compact Body (60% menor) */}
      <div className="p-2 sm:p-2.5 flex items-center gap-2.5 sm:gap-3.5">
        {/* Watch Product Thumbnail */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/relogio_mercadolivre.jpg"
            alt="Relógio Masculino Luxo Cronógrafo"
            className="w-full h-full object-cover sm:object-contain p-0.5 transition-transform duration-200 group-hover:scale-105"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=400&q=80';
            }}
          />
          <div className="absolute top-1 left-1 bg-[#FF7733] text-white text-[8px] font-black px-1 rounded uppercase">
            -54%
          </div>
        </div>

        {/* Product Details Compact */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[9px] font-extrabold text-amber-700 dark:text-amber-400 uppercase bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-900/60">
              Mais Vendido
            </span>
            <div className="flex items-center gap-0.5 text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              <span>4.9</span>
            </div>
          </div>

          <h3
            className={`font-bold text-xs sm:text-sm truncate ${
              highContrast ? 'text-white' : 'text-slate-900 dark:text-white'
            }`}
            title="Relógio Masculino Luxo Esportivo Cronógrafo Aço Inoxidável Pro Diver"
          >
            Relógio Masculino Luxo Esportivo Cronógrafo Aço Inox
          </h3>

          <div className="flex items-baseline gap-1.5 flex-wrap text-xs">
            <span className="text-[10px] text-slate-400 line-through">R$ 389,90</span>
            <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-white">
              R$ 179,90
            </span>
            <span className="text-[10px] font-bold text-[#00A650] hidden sm:inline">
              10x R$ 17,99 sem juros
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0 flex items-center">
          <a
            id={`buy-watch-ml-btn-${position}`}
            href="https://lista.mercadolivre.com.br/relogio-masculino-luxo-esportivo"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg bg-[#3483FA] hover:bg-[#2968c8] text-white font-black text-xs transition-all shadow-xs active:scale-95 whitespace-nowrap"
          >
            <span>Ver no ML</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
