import { VERSE_BY_ID, VERSES, type Verse } from "@/data/verses";

const CRISIS =
  /suicid|quiero morirme|no quiero vivir|hacerme dano|autolesi|matarme|quitarme la vida|no quiero seguir viviendo/i;

export function fold(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export function isCrisis(problem: string): boolean {
  return CRISIS.test(fold(problem));
}

function hash(value: string): number {
  let h = 0;
  for (const char of value) h = (h * 33 + char.charCodeAt(0)) >>> 0;
  return h;
}

const DAY_IDS = [
  "jua-14-27",
  "sal-23",
  "mat-11-28",
  "fil-4-6",
  "isa-41-10",
  "lam-3-22",
  "jer-29-11",
  "sal-121",
  "1pe-5-7",
  "jua-3-16",
];

export function verseForDay(date = new Date()): Verse {
  const key = date.toISOString().slice(0, 10);
  const id = DAY_IDS[hash(key) % DAY_IDS.length]!;
  return VERSE_BY_ID[id]!;
}

export function pickVerse(problem: string, avoidIds: string[] = []): Verse {
  if (isCrisis(problem)) return VERSE_BY_ID["sal-34-18"]!;

  const folded = fold(problem);
  const avoid = new Set(avoidIds);
  let best: Verse | null = null;
  let bestScore = 0;

  for (const verse of VERSES) {
    if (avoid.has(verse.id)) continue;
    let score = 0;
    for (const theme of verse.themes) {
      if (theme.length < 4) continue;
      if (folded.includes(fold(theme))) score += theme.length;
    }
    if (score > bestScore) {
      best = verse;
      bestScore = score;
    }
  }

  if (best && bestScore > 0) return best;

  const pool = VERSES.filter((verse) => !avoid.has(verse.id));
  const source = pool.length > 0 ? pool : VERSES;
  return source[hash(folded || "paz") % source.length]!;
}

export function catalogReflection(verse: Verse): { title: string; reflection: string } {
  const title = verse.hint.charAt(0).toUpperCase() + verse.hint.slice(1);
  return {
    title,
    reflection: `Esto acompaña lo que contaste: ${verse.hint}. El pasaje es de la Reina-Valera 1909, tal cual, no una frase inventada. No cambia el día de golpe, pero te recuerda que no lo cargas a solas.`,
  };
}

export type SeekResult = {
  verse: { id: string; ref: string; text: string };
  title: string;
  reflection: string;
  crisis: boolean;
};

/** Busca un versículo según el problema (sin servidor; todo en el navegador). */
export function seekVerseLocal(problem: string, avoidIds: string[] = []): SeekResult {
  const crisis = isCrisis(problem);
  const verse = pickVerse(problem, avoidIds);
  const copy = catalogReflection(verse);
  return {
    verse: { id: verse.id, ref: verse.ref, text: verse.text },
    title: copy.title,
    reflection: crisis
      ? "Lo que escribiste importa, y no tienes que pasarlo a solas. Si estás en peligro o piensas en hacerte daño, busca ayuda humana ahora: emergencias de tu país, o una persona de confianza. En Estados Unidos puedes llamar o escribir al 988. Este versículo es compañía, no un reemplazo de esa ayuda."
      : copy.reflection,
    crisis,
  };
}
