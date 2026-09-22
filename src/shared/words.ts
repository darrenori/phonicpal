import { soundFor, splitSounds, type SoundInfo, type Viseme } from './sounds';
import { syllabify } from './syllables';

export type Level = 'K2' | 'P1–P2' | 'P3–P4' | 'P5–P6';
export const LEVELS: Level[] = ['K2', 'P1–P2', 'P3–P4', 'P5–P6'];

export interface SoundUnit extends SoundInfo {
  grapheme: string;
}

export interface Syllable {
  text: string;
  say: string;
  sounds: SoundUnit[];
}

export interface Word {
  word: string;
  level: Level;
  topic: string;
  syllables: Syllable[];
  sentence?: string;
  /** A picture for the word, so meaning comes with the sounds. */
  picture?: string;
  /** What the word means, in words a young reader already knows. */
  meaning?: string;
  /** True when the breakdown came from the heuristic splitter, not the checked bank. */
  guessed?: boolean;
}

const VISEMES = new Set<Viseme>(['lips', 'bite', 'tongue', 'round', 'smile', 'open', 'tap', 'back', 'hiss', 'push', 'curl']);

/**
 * Parses a sound spec such as "b u t" or "ph a~uh n t".
 * A unit may override its sound as grapheme~say~keyword~viseme.
 */
function parseSounds(spec: string, syllableIndex: number, syllableCount: number): SoundUnit[] {
  const units = spec.split(' ');
  return units.map((unit, i) => {
    const [grapheme, say, key, viseme] = unit.split('~');
    const isFinalUnit = i === units.length - 1;
    const base = soundFor(grapheme, {
      final: isFinalUnit && i > 0,
      wordFinal: isFinalUnit && syllableIndex === syllableCount - 1,
    });
    // An overridden sound needs its own keyword; the lazy "uh" vowel is always "about".
    const fallbackKey = say ? (say === 'uh' ? 'about' : grapheme) : base.key;
    return {
      grapheme,
      say: say ?? base.say,
      key: key ?? fallbackKey,
      viseme: viseme && VISEMES.has(viseme as Viseme) ? (viseme as Viseme) : say === 'uh' ? 'open' : base.viseme,
    };
  });
}

type Row = [word: string, level: Level, topic: string, syllables: string, say: string, sounds: string, sentence: string];

// Hand-checked breakdowns. Syllables split on "|"; sound units split on spaces within each syllable.
const ROWS: Row[] = [
  ['cat', 'K2', 'Animals', 'cat', 'cat', 'c a t', 'The cat naps in the sun.'],
  ['sun', 'K2', 'Nature', 'sun', 'sun', 's u n', 'The sun is hot today.'],
  ['fish', 'K2', 'Animals', 'fish', 'fish', 'f i sh', 'A fish swims in the pond.'],
  ['frog', 'K2', 'Animals', 'frog', 'frog', 'f r o g', 'The frog jumps on a log.'],
  ['duck', 'K2', 'Animals', 'duck', 'duck', 'd u ck', 'The duck says quack.'],
  ['ship', 'K2', 'Things', 'ship', 'ship', 'sh i p', 'The ship sails on the sea.'],
  ['bed', 'K2', 'Home', 'bed', 'bed', 'b e d', 'I read a book in my bed.'],
  ['jam', 'K2', 'Food', 'jam', 'jam', 'j a m', 'I like jam on my bread.'],

  ['rabbit', 'P1–P2', 'Animals', 'rab|bit', 'rab|bit', 'r a b|b i t', 'The rabbit hops in the grass.'],
  ['pencil', 'P1–P2', 'School', 'pen|cil', 'pen|sil', 'p e n|c~sss~city~hiss i l', 'My pencil needs to be sharpened.'],
  ['garden', 'P1–P2', 'Home', 'gar|den', 'gar|dun', 'g ar|d e~uh n', 'We grow long beans in the garden.'],
  ['rocket', 'P1–P2', 'Things', 'rock|et', 'rock|it', 'r o ck|e~ih~insect~smile t', 'The rocket zooms up to the moon.'],
  ['dragon', 'P1–P2', 'Animals', 'drag|on', 'drag|un', 'd r a g|o~uh n', 'Sparky is a friendly dragon.'],
  ['happy', 'P1–P2', 'Feelings', 'hap|py', 'hap|pee', 'h a p|p y', 'I feel happy when I read.'],
  ['window', 'P1–P2', 'Home', 'win|dow', 'win|doe', 'w i n|d ow', 'Rain taps on the window.'],
  ['basket', 'P1–P2', 'Things', 'bas|ket', 'bas|kit', 'b a s|k e~ih~insect~smile t', 'Put the eggs in the basket.'],
  ['sandwich', 'P1–P2', 'Food', 'sand|wich', 'sand|witch', 's a n d|w i ch', 'I made an egg sandwich.'],
  ['jumping', 'P1–P2', 'Actions', 'jump|ing', 'jump|ing', 'j u m p|i ng', 'The children are jumping rope.'],

  ['butterfly', 'P3–P4', 'Animals', 'but|ter|fly', 'but|tur|fly', 'b u t|t er|f l y', 'A butterfly lands on a flower.'],
  ['elephant', 'P3–P4', 'Animals', 'el|e|phant', 'el|uh|funt', 'e l|e~uh|ph a~uh n t', 'The elephant has a long trunk.'],
  ['dinosaur', 'P3–P4', 'Animals', 'di|no|saur', 'die|no|sor', 'd i~eye~ice~open|n o~oh~go~round|s aur~or~dinosaur~round', 'A dinosaur skeleton stands in the museum.'],
  ['together', 'P3–P4', 'Feelings', 'to|geth|er', 'tuh|geth|er', 't o~uh|g e th|er', 'We read the story together.'],
  ['umbrella', 'P3–P4', 'Things', 'um|brel|la', 'um|brel|luh', 'u m|b r e l|l a~uh', 'Bring an umbrella when it rains.'],
  ['computer', 'P3–P4', 'School', 'com|pu|ter', 'kum|pew|tur', 'c o~uh m|p u~yoo~music~round|t er', 'We type stories on the computer.'],
  ['yesterday', 'P3–P4', 'Time', 'yes|ter|day', 'yes|tur|day', 'y e s|t er|d ay', 'Yesterday we went to the zoo.'],
  ['beautiful', 'P3–P4', 'Feelings', 'beau|ti|ful', 'byoo|tih|full', 'b eau~yoo~beautiful~round|t i|f u~uh l', 'The sunset looks beautiful.'],
  ['important', 'P3–P4', 'School', 'im|por|tant', 'im|por|tunt', 'i m|p or|t a~uh n t', 'Sleep is important for your brain.'],
  ['library', 'P3–P4', 'School', 'li|brar|y', 'lie|brair|ee', 'l i~eye~ice~open|b r ar~air~bear~open|y', 'We borrow books from the library.'],

  ['adventure', 'P5–P6', 'Stories', 'ad|ven|ture', 'ad|ven|cher', 'a d|v e n|ture', 'Every book is a new adventure.'],
  ['experiment', 'P5–P6', 'Science', 'ex|per|i|ment', 'ex|pair|ih|ment', 'e x|p e r|i|m e~uh n t', 'Our science experiment made bubbles.'],
  ['photograph', 'P5–P6', 'Things', 'pho|to|graph', 'foe|tuh|graf', 'ph o~oh~go~round|t o~uh|g r a ph', 'Grandma keeps an old photograph.'],
  ['temperature', 'P5–P6', 'Science', 'tem|per|a|ture', 'tem|pur|uh|cher', 't e m|p er|a~uh|ture', 'The temperature is thirty-two degrees.'],
  ['disappear', 'P5–P6', 'Stories', 'dis|ap|pear', 'dis|uh|peer', 'd i s|a~uh p|p ear~eer~hear~smile', 'The magician made the coin disappear.'],
  ['imagination', 'P5–P6', 'Stories', 'i|mag|i|na|tion', 'ih|madge|ih|nay|shun', 'i|m a g~juh~giraffe~push|i|n a~ay~cake~smile|tion', 'Use your imagination to draw a dragon.'],
  ['responsible', 'P5–P6', 'Feelings', 're|spon|si|ble', 'rih|spon|sih|bul', 'r e~ih~insect~smile|s p o n|s i~uh|b le', 'I am responsible for feeding the fish.'],
  ['environment', 'P5–P6', 'Science', 'en|vi|ron|ment', 'en|vie|run|ment', 'e n|v i~eye~ice~open|r o~uh n|m e~uh n t', 'We keep our environment clean.'],
];

/**
 * A picture and a plain-words meaning for every word in the bank. Children with dyslexia often
 * decode a word correctly and still miss what it means, so meaning travels with the sounds.
 * The pictures are plain text characters, drawn by the device's own emoji font.
 */
const MEANINGS: Record<string, [picture: string, meaning: string]> = {
  cat: ['🐱', 'A furry pet that says meow.'],
  sun: ['☀️', 'The big star that gives us light and heat.'],
  fish: ['🐟', 'An animal that lives in water and swims.'],
  frog: ['🐸', 'A green animal that hops and says ribbit.'],
  duck: ['🦆', 'A bird that swims and says quack.'],
  ship: ['🚢', 'A very big boat that carries people over the sea.'],
  bed: ['🛏️', 'Where you sleep at night.'],
  jam: ['🍓', 'Sweet fruit spread you put on bread.'],
  rabbit: ['🐰', 'A soft animal with long ears that hops.'],
  pencil: ['✏️', 'You hold it to write and draw.'],
  garden: ['🌻', 'A place outside where plants grow.'],
  rocket: ['🚀', 'It flies up into space.'],
  dragon: ['🐉', 'A make-believe animal that flies and breathes fire.'],
  happy: ['😄', 'The good feeling when something nice happens.'],
  window: ['🪟', 'The glass in a wall that you see through.'],
  basket: ['🧺', 'You carry things in it.'],
  sandwich: ['🥪', 'Food tucked between two slices of bread.'],
  jumping: ['🤸', 'Pushing off the ground with both feet.'],
  butterfly: ['🦋', 'An insect with big colourful wings.'],
  elephant: ['🐘', 'A huge grey animal with a long trunk.'],
  dinosaur: ['🦕', 'A giant animal that lived long, long ago.'],
  together: ['🤝', 'With other people, not alone.'],
  umbrella: ['☂️', 'You hold it over your head to stay dry.'],
  computer: ['💻', 'A machine for typing, drawing and playing.'],
  yesterday: ['📅', 'The day before today.'],
  beautiful: ['🌈', 'So lovely that you want to keep looking.'],
  important: ['⭐', 'Something that matters a lot.'],
  library: ['📚', 'A quiet place full of books you can borrow.'],
  adventure: ['🗺️', 'An exciting trip where something new happens.'],
  experiment: ['🧪', 'A test you do to find out what happens.'],
  photograph: ['📷', 'A picture taken with a camera.'],
  temperature: ['🌡️', 'How hot or cold something is.'],
  disappear: ['🎩', 'To go away, so nobody can see it any more.'],
  imagination: ['💭', 'The pictures you make up inside your head.'],
  responsible: ['🐠', 'Looking after something, and doing what you promised.'],
  environment: ['🌍', 'The world around us: air, water, plants and animals.'],
};

export const WORD_BANK: Word[] = ROWS.map(([word, level, topic, syl, say, sounds, sentence]) => {
  const texts = syl.split('|');
  const says = say.split('|');
  const soundSpecs = sounds.split('|');
  const [picture, meaning] = MEANINGS[word] ?? [];
  return {
    word,
    level,
    topic,
    sentence,
    picture,
    meaning,
    syllables: texts.map((text, i) => ({
      text,
      say: says[i] ?? text,
      sounds: parseSounds(soundSpecs[i] ?? text.split('').join(' '), i, texts.length),
    })),
  };
});

/** Finds a word in the bank, or builds a best-guess breakdown for any other word. */
export function buildWord(raw: string): Word | null {
  const clean = raw.toLowerCase().replace(/[^a-z]/g, '');
  if (!clean) return null;
  const known = WORD_BANK.find((w) => w.word === clean);
  if (known) return known;
  const parts = syllabify(clean);
  return {
    word: clean,
    level: 'P3–P4',
    topic: 'Your words',
    guessed: true,
    syllables: parts.map((text, i) => {
      const units = splitSounds(text, i === parts.length - 1);
      return {
        text,
        say: text,
        sounds: units.map((grapheme, u) => ({
          grapheme,
          ...soundFor(grapheme, { final: u === units.length - 1 && u > 0, wordFinal: u === units.length - 1 && i === parts.length - 1 }),
        })),
      };
    }),
  };
}
