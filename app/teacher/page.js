'use client';
import { useState } from 'react';

const TEACHER_PASSWORD = 'teacher123';

export default function TeacherPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [wrongPassword, setWrongPassword] = useState(false);
  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState('');
  const [examType, setExamType] = useState('UPSC');
  const [numQuestions, setNumQuestions] = useState(10);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  function handleLogin() {
    if (password === TEACHER_PASSWORD) {
      setAuthenticated(true);
      setWrongPassword(false);
    } else {
      setWrongPassword(true);
    }
  }

  const fileIcons = { pdf: '📄', txt: '📝', docx: '📃', mp3: '🎵', mp4: '🎬', wav: '🎵', m4a: '🎵' };
  function getFileIcon(name) {
    const ext = name?.split('.').pop()?.toLowerCase();
    return fileIcons[ext] || '📁';
  }

  async function handleUpload() {
    if (!file || !subject) { setError('Please select a file and enter a subject name.'); return; }
    setError(''); setLoading(true); setQuestions([]);
    const ext = file.name.split('.').pop().toLowerCase();
    if (['mp3', 'mp4', 'wav', 'm4a'].includes(ext)) {
      setStatus('Transcribing audio/video with Whisper AI... this takes 1-2 minutes');
    } else {
      setStatus('Reading file content...');
    }
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('subject', subject);
      formData.append('examType', examType);
      formData.append('numQuestions', numQuestions);
      setTimeout(() => { if (loading) setStatus('Claude AI is generating tough ' + examType + ' level questions...'); }, 5000);
      const res = await fetch('/api/generate', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setQuestions(data.questions); setStatus('');
    } catch (err) { setError(err.message); setStatus(''); }
    finally { setLoading(false); }
  }

  function getOption(q, letter) {
    return q['option' + letter] || q['option' + letter.toLowerCase()] || q['option_' + letter.toLowerCase()] || '';
  }

  if (!authenticated) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ background: '#fff', borderRadius: '20px', padding: '48px 40px', border: '1px solid #e0e0e0', width: '100%', maxWidth: '420px', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
          <div style={{ width: '72px', height: '72px', background: '#1a1a2e', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 24px' }}>👨‍🏫</div>
          <h2 style={{ margin: '0 0 8px', color: '#1a1a2e', fontSize: '24px', fontWeight: '700' }}>Teacher Login</h2>
          <p style={{ color: '#888', margin: '0 0 32px', fontSize: '14px' }}>Enter your teacher password to access the dashboard</p>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={e => { setPassword(e.target.value); setWrongPassword(false); }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: `1.5px solid ${wrongPassword ? '#ff4444' : '#e0e0e0'}`, fontSize: '15px', outline: 'none', boxSizing: 'border-box', marginBottom: '12px', textAlign: 'center', letterSpacing: '4px' }}
          />

          {wrongPassword && (
            <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: '10px', padding: '10px', marginBottom: '12px', color: '#cc0000', fontSize: '13px' }}>
              ❌ Wrong password. Please try again.
            </div>
          )}

          <button onClick={handleLogin}
            style={{ width: '100%', padding: '14px', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginBottom: '16px' }}>
            Login to Dashboard →
          </button>

          <a href="/" style={{ color: '#aaa', textDecoration: 'none', fontSize: '13px' }}>← Back to home</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#1a1a2e', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ color: '#fff', margin: 0, fontSize: '20px', fontWeight: '600' }}>Teacher Dashboard</h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button onClick={() => setAuthenticated(false)}
            style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
            Logout
          </button>
          <a href="/" style={{ color: '#aaa', textDecoration: 'none', fontSize: '14px' }}>← Home</a>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid #e0e0e0', marginBottom: '24px' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: '22px', color: '#1a1a2e' }}>Upload Study Material</h2>
          <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#888' }}>Upload any file — AI will read it and generate tough exam questions</p>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#444', marginBottom: '8px' }}>Subject Name</label>
            <input type="text" placeholder="e.g. Indian Polity, Organic Chemistry..." value={subject}
              onChange={e => setSubject(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #e0e0e0', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#444', marginBottom: '8px' }}>Exam Type</label>
            <select value={examType} onChange={e => setExamType(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #e0e0e0', fontSize: '15px', background: '#fff', outline: 'none' }}>
              <option value="UPSC">UPSC — Civil Services</option>
              <option value="JEE">JEE — Engineering</option>
              <option value="NEET">NEET — Medical</option>
              <option value="SSC">SSC — Staff Selection</option>
              <option value="CA">CA — Chartered Accountancy</option>
              <option value="General">General — Custom</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#444', marginBottom: '8px' }}>
              Number of Questions: <strong>{numQuestions}</strong>
            </label>
            <input type="range" min="5" max="30" step="1" value={numQuestions}
              onChange={e => setNumQuestions(parseInt(e.target.value))} style={{ width: '100%' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#aaa', marginTop: '4px' }}>
              <span>5 questions</span><span>30 questions</span>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#444', marginBottom: '8px' }}>Upload File</label>
            <div style={{ border: '2px dashed #d0d0d0', borderRadius: '12px', padding: '32px', textAlign: 'center', background: file ? '#f0fff4' : '#fafafa', cursor: 'pointer' }}
              onClick={() => document.getElementById('fileInput').click()}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>{file ? getFileIcon(file.name) : '📂'}</div>
              <p style={{ margin: '0 0 6px', fontWeight: '500', color: '#333', fontSize: '15px' }}>
                {file ? file.name : 'Click to choose a file'}
              </p>
              <p style={{ margin: '0', fontSize: '13px', color: '#aaa' }}>
                {file ? `${(file.size / 1024).toFixed(0)} KB selected` : 'PDF · DOCX · TXT · MP3 · MP4 · WAV supported'}
              </p>
            </div>
            <input id="fileInput" type="file" accept=".pdf,.txt,.docx,.mp3,.mp4,.wav,.m4a,.webm"
              style={{ display: 'none' }} onChange={e => { setFile(e.target.files[0]); setError(''); }} />
          </div>

          <div style={{ background: '#f0f4ff', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#3355cc' }}>
            <strong>Questions generated:</strong> Analytical, reasoning-based, tricky options — {examType} level difficulty. No basic definitions.
          </div>

          {error && <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', color: '#cc0000', fontSize: '14px' }}>{error}</div>}
          {status && <div style={{ background: '#f0f4ff', border: '1px solid #c0ccff', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', color: '#3355cc', fontSize: '14px' }}>⏳ {status}</div>}

          <button onClick={handleUpload} disabled={loading}
            style={{ width: '100%', padding: '15px', background: loading ? '#aaa' : '#6c63ff', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? '⏳ Generating Questions...' : '✨ Generate Quiz with AI'}
          </button>
        </div>

        {questions.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '22px', color: '#1a1a2e' }}>Generated Questions ({questions.length})</h2>
              <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '500' }}>✅ Saved to Database</span>
            </div>
            {questions.map((q, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '14px', padding: '24px', border: '1px solid #e0e0e0', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#6c63ff', background: '#f0f0ff', padding: '3px 10px', borderRadius: '20px' }}>Q{i + 1} — {q.topic}</span>
                  <span style={{ fontSize: '12px', background: q.difficulty === 'hard' ? '#fff0f0' : q.difficulty === 'medium' ? '#fff8e1' : '#f0fff4', color: q.difficulty === 'hard' ? '#c00' : q.difficulty === 'medium' ? '#aa6600' : '#2e7d32', padding: '3px 10px', borderRadius: '20px', marginLeft: '8px' }}>
                    {q.difficulty}
                  </span>
                </div>
                <p style={{ fontWeight: '500', color: '#1a1a2e', margin: '0 0 16px', lineHeight: '1.7', fontSize: '15px' }}>{q.question}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                  {['A', 'B', 'C', 'D'].map(opt => (
                    <div key={opt} style={{ padding: '10px 14px', borderRadius: '8px', background: q.correct === opt ? '#e8f5e9' : '#f5f5f5', border: q.correct === opt ? '1.5px solid #4caf50' : '1.5px solid transparent', fontSize: '14px', color: '#333' }}>
                      <strong style={{ color: q.correct === opt ? '#2e7d32' : '#555' }}>{opt}.</strong> {getOption(q, opt)}
                    </div>
                  ))}
                </div>
                <div style={{ background: '#f0f4ff', borderRadius: '8px', padding: '12px 14px', fontSize: '13px', color: '#3355cc', lineHeight: '1.6' }}>
                  <strong>Explanation:</strong> {q.explanation}
                </div>
              </div>
            ))}
            <div style={{ textAlign: 'center', marginTop: '8px', marginBottom: '40px' }}>
              <a href="/student" style={{ background: '#1a1a2e', color: '#fff', padding: '12px 32px', borderRadius: '10px', textDecoration: 'none', fontSize: '15px', fontWeight: '600' }}>
                Go to Student Page →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}