'use client';
import { useState } from 'react';

export default function FlashcardsPage() {
  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState('');
  const [numCards, setNumCards] = useState(15);
  const [loading, setLoading] = useState(false);
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState({});
  const [current, setCurrent] = useState(0);
  const [mode, setMode] = useState('grid');
  const [known, setKnown] = useState({});
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  async function handleGenerate() {
    if (!file || !subject) { setError('Please select a file and enter a subject.'); return; }
    setError(''); setLoading(true); setFlashcards([]); setFlipped({}); setKnown({});
    setStatus('Reading file and generating flashcards...');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('subject', subject);
      formData.append('numCards', numCards);
      const res = await fetch('/api/flashcards', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setFlashcards(data.flashcards);
      setStatus('');
    } catch (err) { setError(err.message); setStatus(''); }
    finally { setLoading(false); }
  }

  const toggleFlip = (i) => setFlipped(prev => ({ ...prev, [i]: !prev[i] }));
  const toggleKnown = (i) => setKnown(prev => ({ ...prev, [i]: !prev[i] }));
  const knownCount = Object.values(known).filter(Boolean).length;

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#1a1a2e', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ color: '#fff', margin: 0, fontSize: '20px' }}>🎴 Flashcard Generator</h1>
        <a href="/" style={{ color: '#aaa', textDecoration: 'none', fontSize: '14px' }}>← Home</a>
      </div>

      <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>

        <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid #e0e0e0', marginBottom: '32px' }}>
          <h2 style={{ margin: '0 0 20px', color: '#1a1a2e' }}>Generate Flashcards from File</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#444', marginBottom: '8px' }}>Subject Name</label>
              <input type="text" placeholder="e.g. Indian Polity, Chemistry..." value={subject}
                onChange={e => setSubject(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e0e0e0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#444', marginBottom: '8px' }}>Number of Cards: {numCards}</label>
              <input type="range" min="5" max="30" value={numCards} onChange={e => setNumCards(parseInt(e.target.value))} style={{ width: '100%', marginTop: '8px' }} />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#444', marginBottom: '8px' }}>Upload File</label>
            <div style={{ border: '2px dashed #d0d0d0', borderRadius: '12px', padding: '24px', textAlign: 'center', background: file ? '#f0fff4' : '#fafafa', cursor: 'pointer' }}
              onClick={() => document.getElementById('fcFileInput').click()}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>{file ? '✅' : '📂'}</div>
              <p style={{ margin: 0, fontWeight: '500', color: '#444', fontSize: '14px' }}>{file ? file.name : 'Click to choose PDF or TXT file'}</p>
            </div>
            <input id="fcFileInput" type="file" accept=".pdf,.txt,.docx" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
          </div>

          {error && <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: '10px', padding: '12px', marginBottom: '12px', color: '#c00', fontSize: '14px' }}>{error}</div>}
          {status && <div style={{ background: '#f0f4ff', border: '1px solid #c0ccff', borderRadius: '10px', padding: '12px', marginBottom: '12px', color: '#3355cc', fontSize: '14px' }}>⏳ {status}</div>}

          <button onClick={handleGenerate} disabled={loading}
            style={{ width: '100%', padding: '14px', background: loading ? '#aaa' : '#6c63ff', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? '⏳ Generating Flashcards...' : '🎴 Generate Flashcards with AI'}
          </button>
        </div>

        {flashcards.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ margin: '0 0 4px', color: '#1a1a2e' }}>{flashcards.length} Flashcards — {subject}</h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>✅ Known: {knownCount} / {flashcards.length}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setMode('grid')} style={{ padding: '8px 16px', borderRadius: '20px', border: `1.5px solid ${mode === 'grid' ? '#6c63ff' : '#e0e0e0'}`, background: mode === 'grid' ? '#f0f0ff' : '#fff', color: mode === 'grid' ? '#6c63ff' : '#888', cursor: 'pointer', fontSize: '13px' }}>Grid View</button>
                <button onClick={() => { setMode('study'); setCurrent(0); }} style={{ padding: '8px 16px', borderRadius: '20px', border: `1.5px solid ${mode === 'study' ? '#6c63ff' : '#e0e0e0'}`, background: mode === 'study' ? '#f0f0ff' : '#fff', color: mode === 'study' ? '#6c63ff' : '#888', cursor: 'pointer', fontSize: '13px' }}>Study Mode</button>
              </div>
            </div>

            {knownCount === flashcards.length && (
              <div style={{ background: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: '12px', padding: '16px', textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
                <p style={{ margin: 0, fontWeight: '600', color: '#2e7d32' }}>You know all the cards! Great job!</p>
              </div>
            )}

            {mode === 'study' && (
              <div>
                <div style={{ background: '#e0e0e0', borderRadius: '4px', height: '5px', marginBottom: '24px' }}>
                  <div style={{ background: '#6c63ff', height: '100%', borderRadius: '4px', width: `${((current + 1) / flashcards.length) * 100}%`, transition: 'width 0.3s' }} />
                </div>
                <p style={{ textAlign: 'center', color: '#888', fontSize: '13px', marginBottom: '16px' }}>Card {current + 1} of {flashcards.length} — Click card to flip</p>

                <div onClick={() => toggleFlip(current)} style={{ cursor: 'pointer', marginBottom: '24px' }}>
                  <div style={{ background: flipped[current] ? '#1a1a2e' : '#6c63ff', borderRadius: '16px', padding: '60px 40px', textAlign: 'center', minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s', boxShadow: '0 8px 32px rgba(108,99,255,0.2)' }}>
                    <div style={{ fontSize: '12px', color: flipped[current] ? '#aaa' : 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                      {flipped[current] ? 'ANSWER' : 'QUESTION'}
                    </div>
                    <p style={{ color: '#fff', fontSize: '20px', fontWeight: '500', margin: 0, lineHeight: '1.6' }}>
                      {flipped[current] ? flashcards[current].definition : flashcards[current].term}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '16px' }}>
                  <button onClick={() => { toggleKnown(current); setCurrent(c => Math.min(flashcards.length - 1, c + 1)); setFlipped({}); }}
                    style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: '#2e7d32', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                    ✅ I Know This
                  </button>
                  <button onClick={() => { setCurrent(c => Math.min(flashcards.length - 1, c + 1)); setFlipped({}); }}
                    style={{ padding: '12px 24px', borderRadius: '10px', border: '1.5px solid #e0e0e0', background: '#fff', color: '#444', fontSize: '14px', cursor: 'pointer' }}>
                    ⏭ Skip
                  </button>
                  <button onClick={() => { setCurrent(c => Math.max(0, c - 1)); setFlipped({}); }}
                    style={{ padding: '12px 24px', borderRadius: '10px', border: '1.5px solid #e0e0e0', background: '#fff', color: '#444', fontSize: '14px', cursor: 'pointer' }}>
                    ← Back
                  </button>
                </div>
              </div>
            )}

            {mode === 'grid' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                {flashcards.map((card, i) => (
                  <div key={i} onClick={() => toggleFlip(i)}
                    style={{ background: flipped[i] ? '#1a1a2e' : '#fff', borderRadius: '14px', padding: '24px', border: `1.5px solid ${known[i] ? '#4caf50' : flipped[i] ? '#1a1a2e' : '#e0e0e0'}`, cursor: 'pointer', transition: 'all 0.2s', minHeight: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: flipped[i] ? '#aaa' : '#6c63ff', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', fontWeight: '600' }}>
                        {flipped[i] ? 'ANSWER' : 'TERM'}
                      </div>
                      <p style={{ margin: 0, color: flipped[i] ? '#fff' : '#1a1a2e', fontWeight: flipped[i] ? '400' : '500', fontSize: '14px', lineHeight: '1.6' }}>
                        {flipped[i] ? card.definition : card.term}
                      </p>
                    </div>
                    <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: flipped[i] ? '#666' : '#aaa' }}>Click to flip</span>
                      <button onClick={e => { e.stopPropagation(); toggleKnown(i); }}
                        style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '10px', border: `1px solid ${known[i] ? '#4caf50' : '#e0e0e0'}`, background: known[i] ? '#e8f5e9' : 'transparent', color: known[i] ? '#2e7d32' : '#888', cursor: 'pointer' }}>
                        {known[i] ? '✅ Known' : 'Mark known'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}