/**
 * Verifier test suite — 30 cases from the challenge spec.
 *
 * Requires VITE_ANTHROPIC_API_KEY to be set in a .env file.
 * Each test makes a real API call; timeout is set to 30 s per test.
 */
import { describe, it, expect } from 'vitest';
import { verifyName } from '../services/verifier';

const MATCH_CASES = [
  { id: 1,  target: 'Tyler Bliha',            candidate: 'Tlyer Bilha',           rationale: 'Minor transposition and misspelling in both names' },
  { id: 2,  target: 'Al-Hilal',               candidate: 'alhilal',               rationale: 'Hyphen and casing differences only' },
  { id: 3,  target: 'Dargulov',               candidate: 'Darguloff',             rationale: 'Common phonetic suffix variation (v vs ff)' },
  { id: 4,  target: 'Bob Ellensworth',        candidate: 'Robert Ellensworth',    rationale: 'Common nickname vs formal name' },
  { id: 5,  target: 'Mohammed Al Fayed',      candidate: 'Muhammad Alfayed',      rationale: 'Spacing and transliteration variance' },
  { id: 6,  target: "Sarah O'Connor",         candidate: 'Sara Oconnor',          rationale: 'Apostrophe removal and vowel simplification' },
  { id: 7,  target: 'Jonathon Smith',         candidate: 'Jonathan Smith',        rationale: 'Common spelling variant of first name' },
  { id: 8,  target: 'Abdul Rahman ibn Saleh', candidate: 'Abdulrahman ibn Saleh', rationale: 'Spacing variation within compound name' },
  { id: 9,  target: 'Al Hassan Al Saud',      candidate: 'Al-Hasan Al Saud',      rationale: 'Minor consonant simplification and hyphenation' },
  { id: 10, target: 'Katherine McDonald',     candidate: 'Catherine Macdonald',   rationale: 'Phonetic first name and Mc/Mac variation' },
  { id: 11, target: 'Yusuf Al Qasim',         candidate: 'Youssef Alkasim',       rationale: 'Transliteration differences in Arabic-derived names' },
  { id: 12, target: 'Steven Johnson',         candidate: 'Stephen Jonson',        rationale: 'Phonetic spelling differences in both names' },
  { id: 13, target: 'Alexander Petrov',       candidate: 'Aleksandr Petrof',      rationale: 'Slavic transliteration and phonetic variation' },
  { id: 14, target: 'Jean-Luc Picard',        candidate: 'Jean Luc Picard',       rationale: 'Hyphen removal' },
  { id: 15, target: 'Mikhail Gorbachov',      candidate: 'Mikhail Gorbachev',     rationale: 'Alternate transliteration endings' },
  { id: 16, target: 'Elizabeth Turner',       candidate: 'Liz Turner',            rationale: 'Common nickname shortening' },
  { id: 17, target: 'Omar ibn Al Khattab',    candidate: 'Omar Ibn Alkhattab',    rationale: 'Case, spacing, and compound-name variance' },
  { id: 18, target: "Sean O'Brien",           candidate: 'Shawn Obrien',          rationale: 'Phonetic first name and punctuation removal' },
] as const;

const NO_MATCH_CASES = [
  { id: 19, target: 'Emanuel Oscar',          candidate: 'Belinda Oscar',         rationale: 'Same last name but entirely different first name' },
  { id: 20, target: 'Michael Thompson',       candidate: 'Michelle Thompson',     rationale: 'Similar-looking but distinct first names' },
  { id: 21, target: 'Ali Hassan',             candidate: 'Hassan Ali',            rationale: 'Token order swap changes identity' },
  { id: 22, target: 'John Smith',             candidate: 'James Smith',           rationale: 'Different common first names' },
  { id: 23, target: 'Abdullah ibn Omar',      candidate: 'Omar ibn Abdullah',     rationale: 'Reversal of patronymic meaning' },
  { id: 24, target: 'Maria Gonzalez',         candidate: 'Mario Gonzalez',        rationale: 'Gendered name difference' },
  { id: 25, target: 'Christopher Nolan',      candidate: 'Christian Nolan',       rationale: 'Similar prefix but distinct names' },
  { id: 26, target: 'Ahmed Al Rashid',        candidate: 'Ahmed Al Rashidi',      rationale: 'Different surname root' },
  { id: 27, target: 'Samantha Lee',           candidate: 'Samuel Lee',            rationale: 'Different first name despite shared root' },
  { id: 28, target: 'Ivan Petrov',            candidate: 'Ilya Petrov',           rationale: 'Distinct given names in same cultural group' },
  { id: 29, target: 'Fatima Zahra',           candidate: 'Zahra Fatima',          rationale: 'Name order inversion changes identity' },
  { id: 30, target: 'William Carter',         candidate: 'Liam Carter',           rationale: 'Nickname not universally equivalent without explicit mapping' },
] as const;

describe('Name Verifier — Expected Matches', () => {
  for (const { id, target, candidate, rationale } of MATCH_CASES) {
    it(`#${id}: "${target}" ↔ "${candidate}" — ${rationale}`, async () => {
      const result = await verifyName(target, candidate);
      expect(result.match, `Expected MATCH but got NO MATCH.\nReason: ${result.reason}`).toBe(true);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.reason).toBeTruthy();
    });
  }
});

describe('Name Verifier — Expected Non-Matches', () => {
  for (const { id, target, candidate, rationale } of NO_MATCH_CASES) {
    it(`#${id}: "${target}" ≠ "${candidate}" — ${rationale}`, async () => {
      const result = await verifyName(target, candidate);
      expect(result.match, `Expected NO MATCH but got MATCH.\nReason: ${result.reason}`).toBe(false);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.reason).toBeTruthy();
    });
  }
});
