import { Blocks, Boxes, Image as ImageIcon, Network, Puzzle, Ruler, Waves } from 'lucide-react';
import { WordCard } from '../components/WordCard';
import { ShapeLegend } from '../components/WordBar';
import { PART_MEANING, partsOf, relatives } from '../shared/graph';
import { LENSES, LENS_BLURB, LENS_LABEL, type Lens } from '../shared/learner';
import { speak } from '../shared/speech';
import type { Word } from '../shared/words';

const LENS_ICON: Record<Lens, typeof Waves> = {
  sounds: Waves,
  chunks: Boxes,
  parts: Puzzle,
  shape: Ruler,
  picture: ImageIcon,
  family: Blocks,
};

/**
 * Ways in. The same word, shown six ways, because one representation is never enough:
 * different views carry different information and support different reasoning about the
 * same thing (Ainsworth's DeFT framework). The child picks; Upside remembers which view
 * their successes came after, and suggests it, but never locks them into it.
 */
export function LensBar({ lens, onLens, onMap }: { lens: Lens; onLens: (l: Lens) => void; onMap: () => void }) {
  return (
    <div className="lens-bar" role="group" aria-label="Ways to see this word">
      <span className="lens-title">Ways in</span>
      {LENSES.map((l) => {
        const Icon = LENS_ICON[l];
        return (
          <button key={l} type="button" className="lens" aria-pressed={lens === l} onClick={() => onLens(l)} title={LENS_BLURB[l]}>
            <Icon size={18} strokeWidth={2.2} aria-hidden="true" />
            <span>{LENS_LABEL[l]}</span>
          </button>
        );
      })}
      <button type="button" className="lens lens--map" onClick={onMap}>
        <Network size={18} strokeWidth={2.2} aria-hidden="true" />
        <span>Word map</span>
      </button>
    </div>
  );
}

/** What each lens draws under the word on the mat. */
export function LensPanel({ lens, word, onWord }: { lens: Lens; word: Word; onWord: (w: string) => void }) {
  if (lens === 'sounds') {
    const sounds = word.syllables.flatMap((s) => s.sounds);
    return (
      <div className="lens-panel">
        <p className="lens-note">{sounds.length} sounds. Tap one to hear it.</p>
        <div className="lens-sounds">
          {sounds.map((sound, i) => (
            <button key={`${sound.grapheme}-${i}`} type="button" className="lens-sound" onClick={() => speak(`${sound.say}. As in ${sound.key}.`, { rate: 0.7 })}>
              <span className="lens-sound-face">{sound.grapheme}</span>
              <span className="lens-sound-key">{sound.key}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (lens === 'chunks') {
    return (
      <div className="lens-panel">
        <p className="lens-note">
          {word.syllables.length} {word.syllables.length === 1 ? 'beat' : 'beats'}. Tap a chunk to hear it, and clap along.
        </p>
        <div className="lens-chunks">
          {word.syllables.map((syllable, i) => (
            <button key={i} type="button" className="lens-chunk" onClick={() => speak(syllable.say, { rate: 0.7 })}>
              {syllable.text}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (lens === 'parts') {
    const parts = partsOf(word.word);
    if (!parts.length) {
      return (
        <div className="lens-panel">
          <p className="lens-note">This word is one whole part. It isn’t built from smaller words.</p>
        </div>
      );
    }
    return (
      <div className="lens-panel">
        <p className="lens-note">This word is built from {parts.length} parts. Tap a part to hear it.</p>
        <div className="lens-parts">
          {parts.map((part, i) => (
            <button key={`${part}-${i}`} type="button" className="lens-part" onClick={() => speak(PART_MEANING[part] ? `${part}. ${PART_MEANING[part]}.` : part, { rate: 0.75 })}>
              <strong>{part}</strong>
              {PART_MEANING[part] && <span>{PART_MEANING[part]}</span>}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (lens === 'shape') {
    return (
      <div className="lens-panel">
        <p className="lens-note">Tall letters stand up, small letters sit on the line, hanging letters drop below it.</p>
        <ShapeLegend />
      </div>
    );
  }

  if (lens === 'picture') {
    return (
      <div className="lens-panel">
        <WordCard word={word} />
      </div>
    );
  }

  // family: the rhyming words that share this word's ending.
  const families = relatives(word.word, 'rime');
  if (!families.length) {
    return (
      <div className="lens-panel">
        <p className="lens-note">No rhyming family in the word bank yet. Try the sounds or the word parts.</p>
      </div>
    );
  }
  return (
    <div className="lens-panel">
      {families.map(({ through, words }) => (
        <div key={through.id} className="lens-family">
          <p className="lens-note">
            Words that end in <strong>{through.label}</strong> and rhyme. Change the front, keep the ending.
          </p>
          <div className="lens-family-row">
            <span className="lens-rime">{through.label}</span>
            {words.map((w) => (
              <button key={w} type="button" className="lens-cousin" onClick={() => onWord(w)}>
                {w}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
