import { useState } from 'react';
import { verifyName } from '../services/verifier';
import type { VerificationResult } from '../types';

interface VerifierProps {
  targetName: string | null;
}

export function Verifier({ targetName }: VerifierProps) {
  const [candidate, setCandidate] = useState('');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleVerify() {
    if (!candidate.trim() || !targetName) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await verifyName(targetName, candidate.trim());
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-label">Step 2</span>
        <h2>Name Verifier</h2>
        <p className="panel-desc">Enter a candidate name to verify against the latest target.</p>
      </div>

      <div className="target-display">
        <span className="target-label">Current target:</span>
        <span className="target-value">{targetName ?? '—'}</span>
      </div>

      {!targetName && (
        <div className="result-box info">Generate a target name first (Step 1).</div>
      )}

      <div className="field">
        <label htmlFor="candidate">Candidate Name</label>
        <input
          id="candidate"
          type="text"
          placeholder="e.g. Muhammad Alfayed"
          value={candidate}
          onChange={(e) => setCandidate(e.target.value)}
          disabled={loading || !targetName}
          onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
        />
      </div>

      <button
        className="btn-primary"
        onClick={handleVerify}
        disabled={loading || !candidate.trim() || !targetName}
      >
        {loading ? 'Verifying…' : 'Verify Name'}
      </button>

      {error && <div className="result-box error">{error}</div>}

      {result && !error && (
        <div className={`result-box ${result.match ? 'match' : 'no-match'}`}>
          <div className="verdict">
            <span className="verdict-icon">{result.match ? '✓' : '✗'}</span>
            <span className="verdict-text">{result.match ? 'MATCH' : 'NO MATCH'}</span>
          </div>
          <div className="confidence-row">
            <span className="confidence-label">Confidence</span>
            <div className="confidence-bar">
              <div
                className="confidence-fill"
                style={{ width: `${Math.round(result.confidence * 100)}%` }}
              />
            </div>
            <span className="confidence-value">{Math.round(result.confidence * 100)}%</span>
          </div>
          <div className="reason">{result.reason}</div>
        </div>
      )}
    </div>
  );
}
