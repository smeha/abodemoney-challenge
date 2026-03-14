import { useState } from 'react';
import { Generator } from './components/Generator';
import { Verifier } from './components/Verifier';
import './App.css';

function App() {
  const [targetName, setTargetName] = useState<string | null>(null);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Name Verification</h1>
        <p>Generate a target name, then verify candidates against it.</p>
      </header>
      <main className="app-main">
        <Generator onNameGenerated={setTargetName} />
        <div className="divider" />
        <Verifier targetName={targetName} />
      </main>
    </div>
  );
}

export default App;
