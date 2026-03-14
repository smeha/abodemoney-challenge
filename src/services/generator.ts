import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function generateName(prompt: string): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 100,
    system:
      'You are a name generator. Given a user prompt, generate exactly one name string that satisfies the requirements. Return ONLY the name itself — no explanations, no quotes, no punctuation other than what is part of the name.',
    messages: [{ role: 'user', content: prompt }],
  });

  const block = response.content[0];
  if (block.type !== 'text') throw new Error('Unexpected response type from generator');
  return block.text.trim();
}
