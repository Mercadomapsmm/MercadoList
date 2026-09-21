import { CategoryId, ShoppingItem, UnitType } from '@/types/shopping';
import { detectCategory } from './categories';

// Number words to digits in Portuguese
const NUMBER_WORDS: Record<string, number> = {
  'zero': 0,
  'um': 1,
  'uma': 1,
  'dois': 2,
  'duas': 2,
  'três': 3,
  'tres': 3,
  'quatro': 4,
  'cinco': 5,
  'seis': 6,
  'sete': 7,
  'oito': 8,
  'nove': 9,
  'dez': 10,
  'onze': 11,
  'doze': 12,
  'quinze': 15,
  'vinte': 20,
  'trinta': 30,
  'quarenta': 40,
  'cinquenta': 50,
  'cem': 100,
  'cento': 100,
  'duzentos': 200,
  'quinhentos': 500,
};

export interface ParsedVoiceItem {
  name: string;
  quantity: number;
  unit: UnitType;
  category: CategoryId;
}

/**
 * Parses natural Portuguese voice transcript into individual shopping items.
 * Example: "adicionar 2 quilos de arroz, uma dúzia de ovos e detergente"
 */
export function parseSpokenShoppingText(rawText: string): ParsedVoiceItem[] {
  if (!rawText || !rawText.trim()) return [];

  let clean = rawText.toLowerCase().trim();

  // Remove command prefixes
  const prefixes = [
    /^adicionar\s+/i,
    /^adicione\s+/i,
    /^colocar\s+/i,
    /^coloque\s+/i,
    /^comprar\s+/i,
    /^compre\s+/i,
    /^preciso de\s+/i,
    /^anotar\s+/i,
    /^anote\s+/i,
    /^anota aí\s+/i,
    /^bota aí\s+/i,
    /^bota\s+/i,
  ];

  for (const p of prefixes) {
    clean = clean.replace(p, '');
  }

  // Split items on " e ", commas, semicolons, or " mais "
  // Be careful with phrases like "creme de leite e queijo"
  // First normalize separators
  clean = clean.replace(/\s+e\s+(mais\s+)?/g, ' , ');
  clean = clean.replace(/\s+além de\s+/g, ' , ');
  clean = clean.replace(/\s+também\s+/g, ' , ');

  const rawTokens = clean
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0);

  const results: ParsedVoiceItem[] = [];

  for (const token of rawTokens) {
    const parsed = parseSingleVoicePhrase(token);
    if (parsed && parsed.name.trim().length > 0) {
      results.push(parsed);
    }
  }

  return results;
}

function parseSingleVoicePhrase(phrase: string): ParsedVoiceItem | null {
  let str = phrase.trim();
  if (!str) return null;

  let quantity = 1;
  let unit: UnitType = 'un';

  // Check special compound quantities:
  // "meio quilo" -> 500 g
  if (/^meio\s+quilo(\s+de)?\s+/i.test(str)) {
    quantity = 500;
    unit = 'g';
    str = str.replace(/^meio\s+quilo(\s+de)?\s+/i, '');
  } else if (/^meia\s+dúzia(\s+de)?\s+/i.test(str) || /^meia\s+duzia(\s+de)?\s+/i.test(str)) {
    quantity = 6;
    unit = 'un';
    str = str.replace(/^meia\s+d[uú]zia(\s+de)?\s+/i, '');
  } else {
    // Regex for numeric quantity or word quantity at start
    // e.g. "2 quilos de batata", "uma caixa de bombom", "3 leites"
    const match = str.match(/^(\d+(?:[.,]\d+)?|[a-záéíóúãõç]+)\s+/i);
    if (match) {
      const candidate = match[1].toLowerCase();
      let foundNum: number | null = null;

      if (/^\d+(?:[.,]\d+)?$/.test(candidate)) {
        foundNum = parseFloat(candidate.replace(',', '.'));
      } else if (candidate in NUMBER_WORDS) {
        foundNum = NUMBER_WORDS[candidate];
      }

      if (foundNum !== null && !isNaN(foundNum) && foundNum > 0) {
        quantity = foundNum;
        str = str.substring(match[0].length).trim();
      }
    }

    // Now look for unit in next token
    // e.g. "quilos de", "kg de", "litros de", "caixas de", "pacotes de", "dúzias de"
    const unitPatterns: { regex: RegExp; unit: UnitType }[] = [
      { regex: /^(quilos?|kg)(\s+de)?\s+/i, unit: 'kg' },
      { regex: /^(gramas?|g)(\s+de)?\s+/i, unit: 'g' },
      { regex: /^(litros?|l)(\s+de)?\s+/i, unit: 'L' },
      { regex: /^(ml|mililitros?)(\s+de)?\s+/i, unit: 'ml' },
      { regex: /^(caixas?|cx)(\s+de)?\s+/i, unit: 'cx' },
      { regex: /^(pacotes?|pct)(\s+de)?\s+/i, unit: 'pct' },
      { regex: /^(d[úu]zias?|dz)(\s+de)?\s+/i, unit: 'dz' },
      { regex: /^(garrafas?|gf)(\s+de)?\s+/i, unit: 'garrafa' },
      { regex: /^(latas?|lt)(\s+de)?\s+/i, unit: 'lata' },
      { regex: /^(unidades?|un)(\s+de)?\s+/i, unit: 'un' },
    ];

    for (const p of unitPatterns) {
      if (p.regex.test(str)) {
        unit = p.unit;
        str = str.replace(p.regex, '').trim();
        break;
      }
    }
  }

  // Remove optional leading "de " or "da " or "do "
  str = str.replace(/^(de|da|do|dos|das)\s+/i, '').trim();

  // Capitalize first letter of item name
  const name = str.charAt(0).toUpperCase() + str.slice(1);
  if (!name) return null;

  const category = detectCategory(name);

  return {
    name,
    quantity,
    unit,
    category,
  };
}

// Text to Speech List Reader - Fala somente os produtos
export function speakListItems(items: ShoppingItem[], speed: number = 1.0) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  window.speechSynthesis.cancel();

  const toBuy = items.filter(i => !i.isBought);

  let textToSay = '';
  if (toBuy.length === 0) {
    textToSay = 'Nenhum produto a comprar.';
  } else {
    // Fala exclusivamente os nomes dos produtos
    textToSay = toBuy.map(i => i.name).join('. ') + '.';
  }

  const utterance = new SpeechSynthesisUtterance(textToSay);
  utterance.lang = 'pt-BR';
  utterance.rate = speed;
  utterance.pitch = 1.0;

  // Find a Portuguese voice if available
  const voices = window.speechSynthesis.getVoices();
  const ptVoice = voices.find(v => v.lang.includes('pt-BR') || v.lang.includes('pt_BR')) ||
                  voices.find(v => v.lang.startsWith('pt'));
  if (ptVoice) {
    utterance.voice = ptVoice;
  }

  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}
