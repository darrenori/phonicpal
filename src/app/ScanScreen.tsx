import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Camera, ImageUp, RotateCcw, ScanText, Volume2 } from 'lucide-react';
import { WordBar } from '../components/WordBar';
import { NumberSentence } from '../components/MathBlocks';
import { Hear } from '../components/Controls';
import { buildWord } from '../shared/words';
import { looksLikeSum, parseSum } from '../shared/math';
import { speak } from '../shared/speech';
import { logScan } from '../shared/progress';
import { celebrate } from './CoinToast';
import { go } from './App';

/** One word the reader found, as a share of the picture's width and height. */
interface Found {
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

type Phase =
  | { kind: 'idle' }
  | { kind: 'reading'; image: string; progress: number }
  | { kind: 'result'; image?: string; text: string; found?: Found[]; sample?: boolean }
  | { kind: 'error'; image?: string; message: string };

const SAMPLES = [
  { label: 'A sentence', text: 'The butterfly is beautiful.' },
  { label: 'A sum', text: '8 + 5 = ?' },
  { label: 'Tricky words', text: 'elephant dinosaur umbrella' },
];

/**
 * Reads a photo inside the browser and keeps where each word sits, so the page can
 * draw an outline around every word it found and the child can tap the real thing.
 */
async function readImage(file: File, onProgress: (p: number) => void): Promise<{ text: string; found: Found[] }> {
  const [{ createWorker }, size] = await Promise.all([import('tesseract.js'), imageSize(file)]);
  const worker = await createWorker('eng', 1, {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === 'recognizing text') onProgress(0.3 + m.progress * 0.7);
      else onProgress(Math.min(0.3, m.progress * 0.3));
    },
  });
  try {
    const { data } = await worker.recognize(file, {}, { text: true, blocks: true });
    const found: Found[] = [];
    for (const block of data.blocks ?? []) {
      for (const paragraph of block.paragraphs) {
        for (const line of paragraph.lines) {
          for (const word of line.words) {
            const text = word.text.trim();
            // Skip specks and half-read marks: they would outline nothing a child can read.
            if (!text || word.confidence < 45 || !/[a-z0-9]/i.test(text)) continue;
            const { x0, y0, x1, y1 } = word.bbox;
            found.push({ text, x: x0 / size.width, y: y0 / size.height, w: (x1 - x0) / size.width, h: (y1 - y0) / size.height });
          }
        }
      }
    }
    return { text: data.text, found };
  } finally {
    await worker.terminate();
  }
}

async function imageSize(file: File): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const size = { width: bitmap.width, height: bitmap.height };
  bitmap.close();
  return size;
}

function cleanText(text: string): string {
  return text
    .replace(/[|_~^`{}[\]<>]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

function Breakdown({ text }: { text: string }) {
  const [active, setActive] = useState<{ word: string; part: number } | null>(null);
  if (looksLikeSum(text)) {
    const sum = parseSum(text);
    if (sum) {
      return (
        <div className="scan-sum">
          <h3>A sum! Here it is in blocks.</h3>
          <NumberSentence tokens={sum.tokens} size="lg" />
          <div className="step-actions">
            <button type="button" className="rod rod--lemon" onClick={() => speak(sum.spoken)}>
              <span className="rod-label">
                <Volume2 size={18} aria-hidden="true" /> Hear the sum
              </span>
            </button>
            <button type="button" className="rod rod--ghost" onClick={() => go('maths')}>
              <span className="rod-label">More maths help</span>
            </button>
          </div>
          <p className="step-note">Tap the dark symbols to hear what they mean.</p>
        </div>
      );
    }
  }
  const words = Array.from(new Set(text.toLowerCase().match(/[a-z]{2,}/g) ?? [])).slice(0, 12);
  if (!words.length) {
    return <p className="step-note">There are no words to break down yet. Type some in the box above.</p>;
  }
  return (
    <div className="scan-words">
      <h3>
        {words.length} {words.length === 1 ? 'word' : 'words'}, broken into parts
      </h3>
      <ul>
        {words.map((raw) => {
          const w = buildWord(raw);
          if (!w) return null;
          return (
            <li key={raw} className="scan-word">
              <WordBar
                word={w}
                split
                size="clamp(1.5rem, 4.2vw, 2.1rem)"
                activePart={active?.word === raw ? active.part : null}
                onPart={(i) => {
                  setActive({ word: raw, part: i });
                  speak(w.syllables[i].say, { rate: 0.7 });
                }}
                onWhole={() => speak(w.word, { rate: 0.7 })}
              />
              <button type="button" className="rod rod--sm rod--surface" onClick={() => go('words', w.word)}>
                <span className="rod-label">Practise</span>
                <span className="rod-unit">
                  <ArrowRight size={16} aria-hidden="true" />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ScanScreen() {
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' });
  const [typed, setTyped] = useState('');
  const [dragging, setDragging] = useState(false);
  const [outlines, setOutlines] = useState(true);
  const [picked, setPicked] = useState<number | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const imageUrl = useRef<string | null>(null);

  useEffect(() => () => {
    if (imageUrl.current) URL.revokeObjectURL(imageUrl.current);
  }, []);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPhase({ kind: 'error', message: 'That file is not a picture. Choose a photo (JPG or PNG) of your homework.' });
      return;
    }
    if (imageUrl.current) URL.revokeObjectURL(imageUrl.current);
    const url = URL.createObjectURL(file);
    imageUrl.current = url;
    setPicked(null);
    setPhase({ kind: 'reading', image: url, progress: 0 });
    try {
      const read = await readImage(file, (p) => setPhase((cur) => (cur.kind === 'reading' ? { ...cur, progress: p } : cur)));
      const text = cleanText(read.text);
      if (!/[a-z0-9]/i.test(text)) {
        setPhase({ kind: 'error', image: url, message: 'I couldn’t find any words in that picture. Try a closer photo in good light, with the page flat.' });
        return;
      }
      setPhase({ kind: 'result', image: url, text, found: read.found });
      celebrate(logScan(), 'for scanning');
    } catch {
      setPhase({
        kind: 'error',
        image: url,
        message: 'The picture reader could not start. It needs the internet the first time. You can type the words instead.',
      });
    }
  };

  const applyText = (text: string, sample = false) => {
    const clean = cleanText(text);
    if (!clean) return;
    setPhase({ kind: 'result', text: clean, sample });
    if (!sample) celebrate(logScan(), 'for scanning');
  };

  const intro = 'Take a photo of a word or a sum from your homework. Upside will break it into blocks.';
  const reading = phase.kind === 'reading';

  return (
    <div className="scan">
      <header className="screen-head">
        <h1>Snap &amp; scan</h1>
        <p>
          {intro} <Hear text={intro} />
        </p>
      </header>

      <div className="scan-grid">
        <section
          className={`scan-drop ghost ${dragging ? 'is-dragging' : ''}`}
          aria-label="Add a picture"
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files[0]);
          }}
          onPaste={(e) => handleFile(Array.from(e.clipboardData.files)[0])}
        >
          {phase.kind === 'reading' || ((phase.kind === 'result' || phase.kind === 'error') && phase.image) ? (
            <figure className="scan-photo">
              <div className="scan-shot">
                <img src={(phase as { image: string }).image} alt="Your homework photo" />
                {phase.kind === 'result' && outlines && phase.found && (
                  <div className="ocr-layer">
                    {phase.found.map((f, i) => (
                      <button
                        key={`${f.text}-${i}`}
                        type="button"
                        className={`ocr-box ${picked === i ? 'is-picked' : ''}`}
                        style={{ left: `${f.x * 100}%`, top: `${f.y * 100}%`, width: `${f.w * 100}%`, height: `${f.h * 100}%` }}
                        onClick={() => {
                          setPicked(i);
                          speak(f.text, { rate: 0.7 });
                        }}
                        aria-label={`Hear ${f.text}`}
                      />
                    ))}
                  </div>
                )}
              </div>
              {reading && (
                <figcaption>
                  <span className="scan-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(phase.progress * 100)} aria-label="Reading your picture">
                    {Array.from({ length: 10 }, (_, i) => (
                      <span key={i} className={i < Math.round(phase.progress * 10) ? 'is-on' : ''} />
                    ))}
                  </span>
                  Reading your picture…
                </figcaption>
              )}
            </figure>
          ) : (
            <div className="scan-empty">
              <Camera size={40} strokeWidth={1.8} aria-hidden="true" />
              <p>Put your homework page here</p>
            </div>
          )}

          {phase.kind === 'result' && phase.found && phase.found.length > 0 && (
            <div className="scan-outline-bar">
              <button type="button" className="rod rod--sm rod--surface" aria-pressed={outlines} onClick={() => setOutlines((o) => !o)}>
                <span className="rod-label">
                  <ScanText size={16} aria-hidden="true" /> {outlines ? 'Hide the outlines' : `Outline the ${phase.found.length} words`}
                </span>
              </button>
              {picked !== null && phase.found[picked] && (
                <span className="scan-picked">
                  <strong>{phase.found[picked].text}</strong>
                  <button type="button" className="rod rod--sm" onClick={() => go('words', phase.found![picked].text)}>
                    <span className="rod-label">Practise it</span>
                    <span className="rod-unit">
                      <ArrowRight size={16} aria-hidden="true" />
                    </span>
                  </button>
                </span>
              )}
            </div>
          )}
          {phase.kind === 'result' && phase.found && phase.found.length > 0 && (
            <p className="step-note">Every word Sparky found has a box around it. Tap a box to hear that word.</p>
          )}

          <div className="scan-actions">
            <button type="button" className="rod" onClick={() => cameraRef.current?.click()} disabled={reading}>
              <span className="rod-label">Take a photo</span>
              <span className="rod-unit">
                <Camera size={20} aria-hidden="true" />
              </span>
            </button>
            <button type="button" className="rod rod--surface" onClick={() => fileRef.current?.click()} disabled={reading}>
              <span className="rod-label">
                <ImageUp size={18} aria-hidden="true" /> Choose a picture
              </span>
            </button>
          </div>
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
          <p className="scan-privacy">Your picture is read inside this browser. It is not uploaded anywhere.</p>
        </section>

        <section className="scan-side">
          <form
            className="field"
            onSubmit={(e) => {
              e.preventDefault();
              applyText(typed);
            }}
          >
            <label htmlFor="scan-type">No camera? Type it instead</label>
            <div className="picker-type-row">
              <input id="scan-type" className="input" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="A word, a sentence, or a sum like 7 + 6" autoComplete="off" />
              <button type="submit" className="cube cube--lg cube--cobalt" aria-label="Break it down" disabled={!typed.trim()}>
                <ArrowRight size={20} aria-hidden="true" />
              </button>
            </div>
          </form>
          <div className="scan-samples">
            <span className="field-label">Or try a sample page</span>
            <div className="tiles">
              {SAMPLES.map((s) => (
                <button key={s.label} type="button" className="tile" onClick={() => applyText(s.text, true)}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      {phase.kind === 'error' && (
        <div className="notice" role="alert">
          <p>{phase.message}</p>
          <button type="button" className="rod rod--sm rod--ghost" onClick={() => setPhase({ kind: 'idle' })}>
            <span className="rod-label">
              <RotateCcw size={16} aria-hidden="true" /> Start again
            </span>
          </button>
        </div>
      )}

      {phase.kind === 'result' && (
        <section className="scan-result" aria-labelledby="scan-result-title">
          <div className="field">
            <label id="scan-result-title" htmlFor="scan-text">
              {phase.sample ? 'Sample page. Here is what it says:' : 'Here is what I read. Fix anything I got wrong:'}
            </label>
            <textarea
              id="scan-text"
              className="input scan-text"
              value={phase.text}
              rows={2}
              onChange={(e) => setPhase({ ...phase, text: e.target.value })}
            />
          </div>
          <Breakdown text={phase.text} />
        </section>
      )}
    </div>
  );
}
