import { useState } from 'react';
import { generateName } from '../services/generator';

interface GeneratorProps {
  onNameGenerated: (name: string) => void;
}

export function Generator({ onNameGenerated }: GeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [generatedName, setGeneratedName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const name = await generateName(prompt.trim());
      setGeneratedName(name);
      onNameGenerated(name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-label">Step 1</span>
        <h2>Target Name Generator</h2>
        <p className="panel-desc">Provide a prompt to generate the target name.</p>
      </div>

      <div className="field">
        <label htmlFor="gen-prompt">Prompt</label>
        <textarea
          id="gen-prompt"
          rows={4}
          placeholder='e.g. "Generate a random Arabic name with Al and ibn, no longer than 5 words."'
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
        />
      </div>

      <button className="btn-primary" onClick={handleGenerate} disabled={loading || !prompt.trim()}>
        {loading ? 'Generating…' : 'Generate Name'}
      </button>

      {error && <div className="result-box error">{error}</div>}

      {generatedName && !error && (
        <div className="result-box success">
          <div className="result-label">Generated Target Name</div>
          <div className="result-name">{generatedName}</div>
        </div>
      )}
    </div>
  );
}
