import { useMemo, useState } from 'react';
import { ArrowRight, Eye, Trash2, Volume2 } from 'lucide-react';
import { WordBar } from '../components/WordBar';
import { WordCard } from '../components/WordCard';
import { Sparky } from '../components/Sparky';
import { Hear } from '../components/Controls';
import { buildWord } from '../shared/words';
import { speak } from '../shared/speech';
import { dropWord, dueCards, gradeCard, useDeck, type Box, type Card } from '../shared/deck';
import { reward } from '../shared/progress';
import { recordWord } from '../shared/learner';
import { celebrate } from './CoinToast';
import { go } from './App';

const BOX_LABEL: Record<Box, string> = { 1: 'Just kept', 2: 'Coming along', 3: 'Known by heart' };

/** Three cubes: how far along a word is. */
function BoxDots({ box }: { box: Box }) {
  return (
    <span className="box-dots" aria-label={BOX_LABEL[box]}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={i <= box ? 'is-on' : ''} />
      ))}
    </span>
  );
}

function Review({ queue, total, onGrade }: { queue: string[]; total: number; onGrade: (word: string, remembered: boolean) => void }) {
  const [flipped, setFlipped] = useState(false);
  const word = queue[0];
  const built = useMemo(() => buildWord(word), [word]);
  if (!built) return null;

  const grade = (remembered: boolean) => {
    setFlipped(false);
    onGrade(word, remembered);
  };

  return (
    <section className="flash mat" aria-labelledby="flash-title">
      <h2 id="flash-title" className="visually-hidden">
        Review your words
      </h2>
      <p className="flash-count">
        Card <strong className="num">{total - queue.length + 1}</strong> of <strong className="num">{total}</strong>
      </p>
      <div className="flash-word">
        <WordBar word={built} split={false} size="clamp(2rem, 8vw, 4rem)" onWhole={() => speak(built.word, { rate: 0.7 })} />
      </div>

      {flipped ? (
        <>
          <WordCard word={built} />
          <p className="flash-ask">Did you remember this word?</p>
          <div className="step-actions">
            <button type="button" className="rod rod--leaf" onClick={() => grade(true)}>
              <span className="rod-label">I remember it</span>
            </button>
            <button type="button" className="rod rod--ghost" onClick={() => grade(false)}>
              <span className="rod-label">Not yet</span>
            </button>
            <button type="button" className="rod rod--surface rod--sm" onClick={() => go('words', word)}>
              <span className="rod-label">Build it again</span>
              <span className="rod-unit">
                <ArrowRight size={16} aria-hidden="true" />
              </span>
            </button>
          </div>
          <p className="step-note">“Not yet” is fine. Sparky brings the word back today, and every word comes back until it sticks.</p>
        </>
      ) : (
        <>
          <p className="flash-ask">Read the word out loud. Then check the picture.</p>
          <div className="step-actions">
            <button type="button" className="rod rod--surface" onClick={() => speak(built.word, { rate: 0.6 })}>
              <span className="rod-label">
                <Volume2 size={18} aria-hidden="true" /> Hear it
              </span>
            </button>
            <button type="button" className="rod" onClick={() => setFlipped(true)}>
              <span className="rod-label">Show the picture</span>
              <span className="rod-unit">
                <Eye size={20} aria-hidden="true" />
              </span>
            </button>
          </div>
        </>
      )}
    </section>
  );
}

/**
 * The child's own deck. Words they keep come back on a three-box schedule, with the picture
 * on the back of every card, so a review checks meaning as well as sounds.
 */
export function CardsScreen() {
  const cards = useDeck();
  const [queue, setQueue] = useState<string[]>(() => dueCards(cards).map((c) => c.word));
  const [reviewed, setReviewed] = useState(0);
  const total = useMemo(() => queue.length, []); // eslint-disable-line react-hooks/exhaustive-deps

  const known = cards.filter((c) => c.box === 3).length;
  const intro = 'These are the words you kept. Sparky brings them back until you know them by heart.';

  const onGrade = (word: string, remembered: boolean) => {
    gradeCard(word, remembered);
    // A review is a real attempt, so it is evidence for the model as well as the deck.
    const built = buildWord(word);
    if (built) recordWord(built, remembered);
    setReviewed((n) => n + 1);
    // Remembered words rest until their next turn; the others go to the back of today's pile.
    setQueue((q) => (remembered ? q.slice(1) : [...q.slice(1), word]));
    if (remembered) celebrate(reward(`card:${word}`, 1), 'for remembering');
  };

  const remove = (card: Card) => {
    if (window.confirm(`Take “${card.word}” out of My words?`)) {
      dropWord(card.word);
      setQueue((q) => q.filter((w) => w !== card.word));
    }
  };

  return (
    <div className="cards">
      <header className="screen-head">
        <h1>My words</h1>
        <p>
          {intro} <Hear text={intro} />
        </p>
      </header>

      {cards.length === 0 ? (
        <section className="cards-empty panel">
          <Sparky mood="think" size="clamp(7rem, 18vw, 10rem)" />
          <div>
            <h2>Your deck is empty for now</h2>
            <p>
              Build a word in <strong>Words</strong>, then tap <strong>Keep this word</strong>. Every word you finish is kept here on its own.
            </p>
            <button type="button" className="rod" onClick={() => go('words')}>
              <span className="rod-label">Go and build a word</span>
              <span className="rod-unit">
                <ArrowRight size={20} aria-hidden="true" />
              </span>
            </button>
          </div>
        </section>
      ) : (
        <>
          <ul className="cards-stats" aria-label="Your deck">
            <li>
              <strong className="num">{cards.length}</strong> kept
            </li>
            <li>
              <strong className="num">{queue.length}</strong> to review
            </li>
            <li>
              <strong className="num">{known}</strong> known by heart
            </li>
          </ul>

          {queue.length > 0 ? (
            <Review queue={queue} total={total} onGrade={onGrade} />
          ) : (
            <section className="flash flash--done mat">
              <Sparky mood="cheer" size="clamp(7rem, 16vw, 9rem)" />
              <h2>{reviewed > 0 ? 'All done for today!' : 'Nothing to review yet'}</h2>
              <p>
                {reviewed > 0
                  ? `You reviewed ${reviewed} ${reviewed === 1 ? 'word' : 'words'}. The ones you remembered come back in a few days.`
                  : 'Your words are resting. They come back when it’s time to practise them again.'}
              </p>
              <button type="button" className="rod rod--leaf" onClick={() => go('words')}>
                <span className="rod-label">Build a new word</span>
                <span className="rod-unit">
                  <ArrowRight size={20} aria-hidden="true" />
                </span>
              </button>
            </section>
          )}

          <section className="deck-list panel" aria-labelledby="deck-title">
            <h2 id="deck-title" className="section-title">
              Every word you kept
            </h2>
            <ul>
              {cards.map((card) => {
                const built = buildWord(card.word);
                return (
                  <li key={card.word} className="deck-row">
                    <span className="deck-pic" aria-hidden="true">
                      {built?.picture ?? '❓'}
                    </span>
                    <span className="deck-word">{card.word}</span>
                    <BoxDots box={card.box} />
                    <button type="button" className="rod rod--sm rod--surface" onClick={() => go('words', card.word)}>
                      <span className="rod-label">Practise</span>
                    </button>
                    <button type="button" className="cube cube--sm" onClick={() => remove(card)} aria-label={`Take ${card.word} out of my words`}>
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
