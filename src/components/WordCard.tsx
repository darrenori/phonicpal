import { Hear } from './Controls';
import type { Word } from '../shared/words';
import './wordcard.css';

/**
 * What the word means, with a picture. Decoding a word and knowing it are two different
 * skills, so every practice word carries its meaning and an example sentence. The picture
 * is a plain text character drawn by the device's own emoji font: nothing is generated.
 */
export function WordCard({ word, size = 'md', showWord = false }: { word: Word; size?: 'sm' | 'md'; showWord?: boolean }) {
  const known = Boolean(word.meaning);
  const spoken = known ? `${word.word}. ${word.meaning}${word.sentence ? ` ${word.sentence}` : ''}` : word.word;
  return (
    <figure className={`wordcard wordcard--${size}`}>
      <span className="wordcard-pic" role="img" aria-label={known ? `Picture for ${word.word}` : `No picture for ${word.word} yet`}>
        {word.picture ?? '❓'}
      </span>
      <figcaption>
        {showWord && <strong className="wordcard-word">{word.word}</strong>}
        {known ? (
          <>
            <p className="wordcard-meaning">
              {word.meaning} <Hear text={spoken} label={`Hear what ${word.word} means`} />
            </p>
            {word.sentence && <p className="wordcard-sentence">{word.sentence}</p>}
          </>
        ) : (
          <p className="wordcard-meaning">
            Sparky doesn’t have a picture for this word yet. Ask a grown-up what it means, then say it out loud together.{' '}
            <Hear text={`I don't have a picture for ${word.word} yet. Ask a grown-up what it means.`} label="Hear this" />
          </p>
        )}
      </figcaption>
    </figure>
  );
}
