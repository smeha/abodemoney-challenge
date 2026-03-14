/**
 * Verifier service — black-box isolated from the generator.
 * It receives ONLY the target name string and the candidate name string.
 * No generator context, chat history, or shared LLM state is used.
 */
import Anthropic from '@anthropic-ai/sdk';
import type { VerificationResult } from '../types';

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

const SYSTEM_PROMPT = `You are a professional name verification expert used in identity matching systems. Determine whether CANDIDATE refers to the same person as TARGET.

MATCH when name components correspond via these acceptable variation types:
1. Transliteration variants — different romanizations of the same phonetic name (Arabic, Slavic, and other script transliterations commonly produce spelling variants across cultures)
2. Universally recognized nicknames — only accept nickname forms that are a direct, unambiguous shortening of the formal name root and universally understood as such in English. Do NOT accept names that have diverged into independent given names in modern usage.
3. Punctuation and casing — hyphens, apostrophes, and capitalization differences are insignificant
4. Name prefix equivalence — common prefix spelling variants (e.g. Mc/Mac) refer to the same root
5. Compound name fusion — a fused token and its spaced equivalent are the same component (e.g. a prefix-name written as one word vs two)
6. Keyboard/transcription errors — ask "could this candidate have been produced by typing the target carelessly?" If yes, accept it. Adjacent-letter transpositions, dropped letters, or added letters are all acceptable. There is no limit on how many components contain such errors — each component is judged independently. A letter that is silent or weakly pronounced (e.g. the 'h' in Johnson/Jonson) carries no phonetic weight and its omission is always a typo.

NO MATCH when:
1. Name component order differs — the sequence of components carries semantic identity and reordering indicates a different person
2. Given names are substantively different, even if visually or phonetically similar, share a prefix, or share the same last name
3. A suffix or extra component changes the surname's root identity
4. The nickname mapping is ambiguous, culturally specific, or not universally established in English-speaking contexts

Return ONLY valid JSON with no other text:
{"match": boolean, "confidence": number, "reason": "string"}
- match: true if same person, false otherwise
- confidence: 0.0 to 1.0
- reason: concise explanation, 20 words or fewer`;

export async function verifyName(
  targetName: string,
  candidateName: string
): Promise<VerificationResult> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 150,
    temperature: 0,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `TARGET: ${targetName}\nCANDIDATE: ${candidateName}`,
      },
    ],
  });

  const block = response.content[0];
  if (block.type !== 'text') throw new Error('Unexpected response type from verifier');

  let parsed: Record<string, unknown>;
  try {
    const raw = block.text.replace(/^```json\s*/i, '').replace(/```\s*$/,'').trim();
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Verifier returned invalid JSON: ${block.text}`);
  }
  return {
    match: Boolean(parsed.match),
    confidence: Number(parsed.confidence),
    reason: String(parsed.reason),
  };
}
