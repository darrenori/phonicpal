/**
 * The child's own word deck, kept on the device.
 *
 * A word joins the deck when the child keeps it, and again whenever they finish all four steps.
 * Review uses three boxes, the paper flashcard method: a word the child remembers moves up a box
 * and comes back later, a word they don't goes back to box one and comes back today. Nothing is
 * ever deleted for a wrong answer, and no word is ever "failed".
 */

import { useSyncExternalStore } from 'react';
import { load, save } from './storage';
import { today } from './progress';

/** 1 = just kept, 2 = coming along, 3 = known by heart. */
export type Box = 1 | 2 | 3;

export interface Card {
  word: string;
  box: Box;
  /** The day this card comes back, as yyyy-mm-dd. */
  due: string;
  /** Reviews so far, and how many of those the child remembered. */
  seen: number;
  kept: number;
  added: string;
}

interface Deck {
  cards: Card[];
}

/** Days until a card in each box comes back. */
const GAP: Record<Box, number> = { 1: 1, 2: 3, 3: 7 };

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return today(d);
}

let deck: Deck = typeof window !== 'undefined' ? load<Deck>('deck', { cards: [] }) : { cards: [] };
const listeners = new Set<() => void>();

function commit(next: Deck) {
  deck = next;
  save('deck', deck);
  listeners.forEach((l) => l());
}

export function readDeck(): Card[] {
  return deck.cards;
}

export function hasCard(word: string): boolean {
  return deck.cards.some((c) => c.word === word);
}

/** Keeps a word for review. Returns true when it was new to the deck. */
export function keepWord(word: string): boolean {
  if (hasCard(word)) return false;
  const card: Card = { word, box: 1, due: today(), seen: 0, kept: 0, added: today() };
  commit({ cards: [...deck.cards, card] });
  return true;
}

export function dropWord(word: string): void {
  commit({ cards: deck.cards.filter((c) => c.word !== word) });
}

/** Records a review. Remembered moves the card up a box; not yet sends it back to box one, today. */
export function gradeCard(word: string, remembered: boolean): void {
  commit({
    cards: deck.cards.map((c) => {
      if (c.word !== word) return c;
      const box = (remembered ? Math.min(3, c.box + 1) : 1) as Box;
      return { ...c, box, due: remembered ? addDays(GAP[box]) : today(), seen: c.seen + 1, kept: c.kept + (remembered ? 1 : 0) };
    }),
  });
}

/** Cards ready for review today, shakiest first. */
export function dueCards(cards: Card[] = deck.cards): Card[] {
  const day = today();
  return cards.filter((c) => c.due <= day).sort((a, b) => a.box - b.box || a.due.localeCompare(b.due));
}

export function deckStats(cards: Card[] = deck.cards): { total: number; due: number; known: number } {
  return { total: cards.length, due: dueCards(cards).length, known: cards.filter((c) => c.box === 3).length };
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useDeck(): Card[] {
  return useSyncExternalStore(subscribe, readDeck, readDeck);
}
