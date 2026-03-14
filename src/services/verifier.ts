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

const SYSTEM_PROMPT = `You are a professional name verification expert. Determine whether CANDIDATE refers to the same person as TARGET.

ACCEPT as the same person:
- Transliteration variants of the same underlying name (Mohammed/Muhammad/Mohamed, Yusuf/Youssef, Alexander/Aleksandr, Petrov/Petrof, Gorbachev/Gorbachov, Hassan/Hasan, Qasim/Kasim)
- Well-established common nicknames: Bob/Rob=Robert, Liz/Beth/Eliza=Elizabeth, Steve=Steven/Stephen, Mike=Michael, Kate/Kathy/Cathy/Catherine=Katherine, Shawn/Shaun=Sean
- Punctuation differences: hyphen removal (Jean-Luc → Jean Luc), apostrophe removal (O'Connor → Oconnor)
- Mc/Mac prefix equivalence: McDonald = Macdonald
- Arabic compound name spacing: Abdul Rahman = Abdulrahman, Al Fayed = Alfayed, Al Khattab = Alkhattab, Al Qasim = Alkasim
- Minor typos and character transpositions that preserve phonetic identity (Tlyer = Tyler, Bilha = Bliha)
- Case-insensitive matching: alhilal = Al-Hilal
- Phonetic suffix variants at word boundaries: Darguloff = Dargulov

REJECT as different people:
- Name component order swapped: Ali Hassan ≠ Hassan Ali, Fatima Zahra ≠ Zahra Fatima
- Patronymic reversal: Abdullah ibn Omar ≠ Omar ibn Abdullah
- Different given names, even if similar-looking: Michael ≠ Michelle, Christopher ≠ Christian, Samantha ≠ Samuel, Ivan ≠ Ilya, John ≠ James, Emanuel ≠ Belinda, William ≠ Liam
- Gender variants: Maria ≠ Mario
- Surname suffix changes that alter the root identity: Al Rashid ≠ Al Rashidi
- Liam is NOT an accepted nickname for William — always treat them as different names

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
    model: 'claude-opus-4-6',
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

  const parsed = JSON.parse(block.text);
  return {
    match: Boolean(parsed.match),
    confidence: Number(parsed.confidence),
    reason: String(parsed.reason),
  };
}
