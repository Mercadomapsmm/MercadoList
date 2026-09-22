'use client';

import React from 'react';
import { ExternalLink, Zap, Star, ShieldCheck, Truck } from 'lucide-react';

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
      className={`w-full rounded-2xl overflow-hidden border transition-all ${
        highContrast
          ? 'bg-black text-white border-2 border-yellow-400'
          : 'bg-white dark:bg-slate-900 border-[#FFE600] dark:border-amber-500/50 shadow-md hover:shadow-lg'
      }`}
    >
      {/* Mercado Livre Yellow Top Header Bar */}
      <div className="bg-[#FFE600] text-[#2D3277] px-4 py-2 flex items-center justify-between flex-wrap gap-2 font-bold text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          {/* Mercado Livre iconic handshake / brand representation */}
          <div className="flex items-center gap-1.5 font-black tracking-tight text-sm sm:text-base">
            <span className="bg-[#2D3277] text-[#FFE600] px-1.5 py-0.5 rounded text-xs font-black">
              ML
            </span>
            <span className="text-[#2D3277]">mercado</span>
            <span className="text-[#2D3277] -ml-1 font-black">livre</span>
          </div>
          <span className="hidden sm:inline-block text-[#2D3277]/40 font-normal">|</span>
          <span className="flex items-center gap-1 text-[#2D3277] bg-white/60 px-2 py-0.5 rounded-full text-[11px] font-extrabold">
            <Zap className="w-3 h-3 fill-[#2D3277] text-[#2D3277]" />
            OFERTA DO DIA
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] sm:text-xs">
          <span className="flex items-center gap-1 text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full font-black">
            <Truck className="w-3 h-3" />
            FRETE GRÁTIS
          </span>
          <span className="text-emerald-900 font-black italic flex items-center">
            <span className="text-[#00A650] font-black mr-0.5">⚡</span>FULL
          </span>
        </div>
      </div>

      {/* Main Banner Body */}
      <div className="p-3.5 sm:p-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        {/* Watch Product Image */}
        <div className="relative w-full sm:w-44 h-40 sm:h-44 shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/relogio_mercadolivre.jpg"
            alt="Relógio Masculino Luxo Esportivo Cronógrafo Aço Inoxidável"
            className="w-full h-full object-cover sm:object-contain p-1 transition-transform duration-300 group-hover:scale-105"
            referrerPolicy="no-referrer"
            onError={(e) => {
              // Fallback to high quality watch image if needed
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80';
            }}
          />
          <div className="absolute top-2 left-2 bg-[#FF7733] text-white text-[10px] font-black px-2 py-0.5 rounded shadow-xs uppercase tracking-wider">
            -54% OFF
          </div>
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
            <span>4.9</span>
          </div>
        </div>

        {/* Product Details & Call to Action */}
        <div className="flex-1 min-w-0 flex flex-col justify-between w-full space-y-2.5">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/60">
                Mais Vendido em Relógios
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                +2.400 compras realizadas
              </span>
            </div>

            <h3
              className={`font-black text-sm sm:text-base leading-snug line-clamp-2 ${
                highContrast ? 'text-white' : 'text-slate-900 dark:text-white'
              }`}
            >
              Relógio Masculino Luxo Esportivo Cronógrafo em Aço Inoxidável Pro Diver - À Prova D&apos;água
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
              Vidro de safira anti-risco, calendário automático, ponteiros fluorescentes e acabamento premium.
            </p>
          </div>

          {/* Pricing Row */}
          <div className="flex flex-wrap items-baseline gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs sm:text-sm text-slate-400 line-through">
              R$ 389,90
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                R$ 179
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                ,90
              </span>
            </div>
            <span className="text-xs font-bold text-[#00A650]">
              em 10x de R$ 17,99 sem juros
            </span>
          </div>

          {/* Bottom Action and Trust Badges */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
              <ShieldCheck className="w-4 h-4 text-[#00A650] shrink-0" />
              <span>Compra Garantida pelo Mercado Livre • Devolução grátis</span>
            </div>

            <a
              id={`buy-watch-ml-btn-${position}`}
              href="https://lista.mercadolivre.com.br/relogio-masculino-luxo-esportivo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#3483FA] hover:bg-[#2968c8] text-white font-black text-xs sm:text-sm transition-all shadow-sm active:scale-95 whitespace-nowrap"
            >
              <span>Comprar no Mercado Livre</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
