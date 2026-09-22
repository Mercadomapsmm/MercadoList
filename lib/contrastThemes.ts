import { ContrastThemeId } from '@/types/shopping';

export interface ContrastThemeConfig {
  id: ContrastThemeId;
  name: string;
  shortLabel: string;
  description: string;
  dotColor: string;
  borderDot: string;
  bgPage: string;
  bgStickyHeader: string;
  borderStickyHeader: string;
  bgAccessibility: string;
  borderAccessibility: string;
  titleColor: string;
  accentBar: string;
  bgCard: string;
  borderCard: string;
  textPrimary: string;
  textSecondary: string;
  bgInput: string;
  borderInput: string;
  bgButtonPrimary: string;
  textButtonPrimary: string;
  bgButtonSecondary: string;
  textButtonSecondary: string;
  borderButtonSecondary: string;
}

export const CONTRAST_THEMES: Record<ContrastThemeId, ContrastThemeConfig> = {
  padrao: {
    id: 'padrao',
    name: 'Claro Padrão',
    shortLabel: 'Claro',
    description: 'Fundo claro com alta legibilidade',
    dotColor: '#FFFFFF',
    borderDot: '#94A3B8',
    bgPage: 'bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100',
    bgStickyHeader: 'bg-white/95 dark:bg-slate-950/95 backdrop-blur-md',
    borderStickyHeader: 'border-slate-200/90 dark:border-slate-800/90',
    bgAccessibility: 'bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100',
    borderAccessibility: 'border-slate-200 dark:border-slate-800',
    titleColor: 'text-emerald-600 dark:text-emerald-400 drop-shadow-sm font-black',
    accentBar: 'bg-emerald-600',
    bgCard: 'bg-white dark:bg-slate-900',
    borderCard: 'border-slate-200 dark:border-slate-800',
    textPrimary: 'text-slate-900 dark:text-white',
    textSecondary: 'text-slate-500 dark:text-slate-400',
    bgInput: 'bg-slate-50 dark:bg-slate-800',
    borderInput: 'border-slate-300 dark:border-slate-700',
    bgButtonPrimary: 'bg-emerald-600 hover:bg-emerald-700',
    textButtonPrimary: 'text-white',
    bgButtonSecondary: 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700',
    textButtonSecondary: 'text-slate-700 dark:text-slate-200',
    borderButtonSecondary: 'border-slate-300 dark:border-slate-700',
  },
  'amarelo-preto': {
    id: 'amarelo-preto',
    name: 'Amarelo & Preto',
    shortLabel: 'Amarelo',
    description: 'Preto puro com amarelo ouro de alto contraste',
    dotColor: '#FACC15',
    borderDot: '#000000',
    bgPage: 'bg-black text-yellow-300',
    bgStickyHeader: 'bg-black/98 backdrop-blur-md',
    borderStickyHeader: 'border-yellow-400',
    bgAccessibility: 'bg-black text-yellow-300',
    borderAccessibility: 'border-yellow-400/80',
    titleColor: 'text-yellow-400 drop-shadow-[0_2px_12px_rgba(250,204,21,0.6)] font-black',
    accentBar: 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]',
    bgCard: 'bg-zinc-950',
    borderCard: 'border-yellow-400',
    textPrimary: 'text-yellow-200',
    textSecondary: 'text-yellow-400/80',
    bgInput: 'bg-zinc-900',
    borderInput: 'border-yellow-400',
    bgButtonPrimary: 'bg-yellow-400 hover:bg-yellow-300',
    textButtonPrimary: 'text-black font-extrabold',
    bgButtonSecondary: 'bg-zinc-900 hover:bg-zinc-800',
    textButtonSecondary: 'text-yellow-300',
    borderButtonSecondary: 'border-yellow-400',
  },
  'azul-noturno': {
    id: 'azul-noturno',
    name: 'Azul Noturno',
    shortLabel: 'Azul',
    description: 'Azul marinho profundo com ciano elétrico e branco',
    dotColor: '#38BDF8',
    borderDot: '#0A1128',
    bgPage: 'bg-[#060c1d] text-cyan-100',
    bgStickyHeader: 'bg-[#0a142c]/98 backdrop-blur-md',
    borderStickyHeader: 'border-sky-400',
    bgAccessibility: 'bg-[#0a142c] text-sky-200',
    borderAccessibility: 'border-sky-500/80',
    titleColor: 'text-cyan-300 drop-shadow-[0_2px_12px_rgba(56,189,248,0.6)] font-black',
    accentBar: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]',
    bgCard: 'bg-[#0d1a3a]',
    borderCard: 'border-sky-400',
    textPrimary: 'text-white',
    textSecondary: 'text-sky-300',
    bgInput: 'bg-[#091228]',
    borderInput: 'border-sky-400',
    bgButtonPrimary: 'bg-sky-500 hover:bg-sky-400',
    textButtonPrimary: 'text-slate-950 font-bold',
    bgButtonSecondary: 'bg-[#10224d] hover:bg-[#162c64]',
    textButtonSecondary: 'text-sky-200',
    borderButtonSecondary: 'border-sky-500',
  },
  'verde-esmeralda': {
    id: 'verde-esmeralda',
    name: 'Verde Floresta',
    shortLabel: 'Verde',
    description: 'Verde escuro profundo com menta brilhante e branco',
    dotColor: '#34D399',
    borderDot: '#052E16',
    bgPage: 'bg-[#031d0d] text-emerald-100',
    bgStickyHeader: 'bg-[#052e16]/98 backdrop-blur-md',
    borderStickyHeader: 'border-emerald-400',
    bgAccessibility: 'bg-[#052e16] text-emerald-200',
    borderAccessibility: 'border-emerald-400/80',
    titleColor: 'text-emerald-300 drop-shadow-[0_2px_12px_rgba(52,211,153,0.6)] font-black',
    accentBar: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
    bgCard: 'bg-[#073b1d]',
    borderCard: 'border-emerald-400',
    textPrimary: 'text-white',
    textSecondary: 'text-emerald-300',
    bgInput: 'bg-[#042410]',
    borderInput: 'border-emerald-400',
    bgButtonPrimary: 'bg-emerald-500 hover:bg-emerald-400',
    textButtonPrimary: 'text-slate-950 font-bold',
    bgButtonSecondary: 'bg-[#0a4824] hover:bg-[#0d592d]',
    textButtonSecondary: 'text-emerald-200',
    borderButtonSecondary: 'border-emerald-400',
  },
  'preto-branco': {
    id: 'preto-branco',
    name: 'Preto & Branco',
    shortLabel: 'P&B',
    description: 'Preto absoluto e branco puro sem intermediários (21:1 AAA)',
    dotColor: '#FFFFFF',
    borderDot: '#000000',
    bgPage: 'bg-black text-white',
    bgStickyHeader: 'bg-black/98 backdrop-blur-md',
    borderStickyHeader: 'border-white',
    bgAccessibility: 'bg-black text-white',
    borderAccessibility: 'border-white',
    titleColor: 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.7)] font-black',
    accentBar: 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]',
    bgCard: 'bg-zinc-950',
    borderCard: 'border-2 border-white',
    textPrimary: 'text-white',
    textSecondary: 'text-zinc-300',
    bgInput: 'bg-zinc-900',
    borderInput: 'border-2 border-white',
    bgButtonPrimary: 'bg-white hover:bg-zinc-200 text-black',
    textButtonPrimary: 'text-black font-black',
    bgButtonSecondary: 'bg-zinc-900 hover:bg-zinc-800 text-white',
    textButtonSecondary: 'text-white font-bold',
    borderButtonSecondary: 'border-2 border-white',
  },
};

export const THEME_LIST = Object.values(CONTRAST_THEMES);
