import { useEffect, useMemo, useState } from "react";
import { Check, Copy, LoaderCircle, RotateCcw } from "lucide-react";
import { VERSES } from "@/data/verses";
import { seekVerseLocal, verseForDay } from "@/lib/scripture";

const PROMPTS = [
  "No puedo dormir",
  "Estoy ansioso",
  "Me siento solo",
  "Estoy agotado",
  "El dinero no alcanza",
  "Pelea en casa",
  "Me pesa la culpa",
  "No sé qué decidir",
  "Extraño a alguien",
  "El trabajo me pesa",
];

type Reading = {
  verseId: string;
  ref: string;
  text: string;
  title: string;
  reflection: string;
  crisis: boolean;
};

type Memory = Reading & { problem: string; at: number };

const MEMORY_KEY = "bible-ia-memory";

export function Sanctuary() {
  const day = useMemo(() => verseForDay(), []);
  const [problem, setProblem] = useState("");
  const [reading, setReading] = useState<Reading | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [memory, setMemory] = useState<Memory[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(MEMORY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Memory[];
        if (Array.isArray(parsed)) setMemory(parsed.slice(0, 8));
      }
    } catch {
      /* ventana privada puede bloquear storage */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(MEMORY_KEY, JSON.stringify(memory.slice(0, 8)));
  }, [memory, ready]);

  async function ask(text: string, avoidIds: string[] = []) {
    const trimmed = text.trim();
    if (trimmed.length < 3 || busy) return;
    setBusy(true);
    setError("");
    setCopied(false);
    try {
      // Pequeña pausa para que se sienta la búsqueda
      await new Promise((r) => setTimeout(r, 280));
      const result = seekVerseLocal(trimmed, avoidIds);
      const next: Reading = {
        verseId: result.verse.id,
        ref: result.verse.ref,
        text: result.verse.text,
        title: result.title,
        reflection: result.reflection,
        crisis: result.crisis,
      };
      setReading(next);
      setMemory((prev) =>
        [{ ...next, problem: trimmed, at: Date.now() }, ...prev].slice(0, 8),
      );
    } catch {
      setError("No pude buscar ahora. Inténtalo otra vez.");
    } finally {
      setBusy(false);
    }
  }

  async function copyReading(current: Reading) {
    const block = `${current.ref}\n${current.text}`;
    try {
      await navigator.clipboard.writeText(block);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  const shown = reading;
  const verseCount = VERSES.length;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 py-8 sm:py-14">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="font-serif text-3xl leading-none tracking-tight text-ink">bible ia</p>
          <p className="mt-2 text-xs font-medium tracking-widest text-clay uppercase">
            for all of us
          </p>
        </div>
        <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width={44} height={44} className="size-11 shrink-0" />
      </header>

      <h1 className="font-serif text-4xl leading-tight text-balance text-ink sm:text-5xl">
        Cuéntame lo que llevas hoy.
      </h1>
      <p className="mt-3 max-w-md text-base leading-relaxed text-pretty text-clay">
        Un problema de tu día, y un versículo real de la Reina-Valera 1909. El
        texto bíblico no se inventa: sale de una biblioteca fija.
      </p>

      {shown ? (
        <article className="rise mt-8 rounded-2xl border border-line bg-paper px-5 py-6 shadow-sm sm:px-7">
          <p className="text-xs font-medium tracking-widest text-gold uppercase">{shown.title}</p>
          <blockquote className="mt-4 border-l-2 border-gold pl-4">
            <p className="font-serif text-2xl leading-snug text-pretty text-ink italic">
              {shown.text}
            </p>
            <footer className="mt-3 text-sm font-medium text-clay">{shown.ref}</footer>
          </blockquote>
          <p className="mt-5 text-base leading-relaxed text-pretty text-ink">{shown.reflection}</p>
          {shown.crisis ? (
            <p className="mt-4 rounded-xl bg-gold-soft px-4 py-3 text-sm leading-relaxed text-ink">
              Si estás en peligro o piensas en hacerte daño, busca ayuda ahora: emergencias
              de tu país o una persona de confianza. En Estados Unidos, la línea 988 está
              disponible todo el día.
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copyReading(shown)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-parchment px-4 text-sm font-medium text-ink"
            >
              {copied ? <Check className="size-4 text-gold" /> : <Copy className="size-4" />}
              {copied ? "Copiado" : "Copiar versículo"}
            </button>
            <button
              type="button"
              onClick={() => ask(problem, [shown.verseId])}
              disabled={busy}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 text-sm font-medium text-ink disabled:opacity-50"
            >
              <RotateCcw className="size-4" />
              Otro versículo
            </button>
          </div>
        </article>
      ) : (
        <article className="mt-8 rounded-2xl border border-line bg-paper/80 px-5 py-5">
          <p className="text-xs font-medium tracking-widest text-gold uppercase">Para hoy</p>
          <p className="mt-3 font-serif text-xl leading-snug text-pretty text-ink italic">
            {day.text}
          </p>
          <p className="mt-2 text-sm text-clay">{day.ref}</p>
        </article>
      )}

      <form
        className="mt-6 rounded-2xl border border-line bg-paper p-4 shadow-sm sm:p-5"
        onSubmit={(event) => {
          event.preventDefault();
          void ask(problem);
        }}
      >
        <label htmlFor="problem" className="text-sm font-medium text-ink">
          ¿Qué te está pasando?
        </label>
        <textarea
          id="problem"
          value={problem}
          maxLength={800}
          rows={4}
          placeholder="Hoy me desperté con un nudo en el pecho y no sé cómo seguir el día."
          onChange={(event) => setProblem(event.target.value)}
          className="mt-2 w-full resize-none rounded-xl border border-line bg-parchment px-3 py-3 text-base leading-relaxed text-ink outline-none placeholder:text-clay/70 focus:border-gold"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setProblem(prompt)}
              className="min-h-11 rounded-full border border-line bg-parchment px-3 text-sm text-ink"
            >
              {prompt}
            </button>
          ))}
        </div>
        {error ? <p className="mt-3 text-sm text-clay">{error}</p> : null}
        <button
          type="submit"
          disabled={busy || problem.trim().length < 3}
          className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-ink px-5 text-base font-medium text-parchment disabled:opacity-40"
        >
          {busy ? <LoaderCircle className="size-4 animate-spin" /> : null}
          {busy ? "Buscando en las Escrituras…" : "Dame un versículo"}
        </button>
      </form>

      {memory.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-sm font-medium tracking-widest text-clay uppercase">En este aparato</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {memory.map((item) => (
              <li key={item.at}>
                <button
                  type="button"
                  onClick={() => {
                    setProblem(item.problem);
                    setReading(item);
                    setCopied(false);
                  }}
                  className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-left"
                >
                  <p className="text-sm text-clay">{item.problem}</p>
                  <p className="mt-1 font-medium text-ink">{item.ref}</p>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <footer className="mt-10 text-xs leading-relaxed text-clay">
        {verseCount} pasajes de la Reina-Valera 1909, dominio público. No sustituye
        consejo pastoral, médico ni de emergencia.
      </footer>
    </main>
  );
}
