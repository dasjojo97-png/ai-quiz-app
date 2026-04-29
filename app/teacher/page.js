'use client';
import { useState } from 'react';

export default function TeacherPage() {
  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState('');
  const [examType, setExamType] = useState('JEE');
  const [numQuestions, setNumQuestions] = useState(10);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  async function handleUpload() {
    if (!file || !subject) { setError('Please select a file and enter a subject name.'); return; }
    setError(''); setLoading(true); setQuestions([]); setStatus('Reading your file...');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('subject', subject);
      formData.append('examType', examType);
      formData.append('numQuestions', numQuestions);
      setStatus('Claude AI is generating questions... please wait 30 seconds');
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

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#1a1a2e', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ color: '#fff', margin: 0, fontSize: '20px' }}>Teacher Dashboard</h1>
        <a href="/" style={{ color: '#aaa', textDecoration: 'none', fontSize: '14px' }}>Back to home</a>
      </div>
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid #e0e0e0', marginBottom: '24px' }}>
          <h2 style={{ margin: '0 0 24px', fontSize: '22px', color: '#1a1a2e' }}>Upload Study Material</h2>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#444', marginBottom: '8px' }}>Subject Name</label>
            <input type="text" placeholder="e.g. Physics, History..." value={subject} onChange={e => setSubject(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #e0e0e0', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#444', marginBottom: '8px' }}>Exam Type</label>
            <select value={examType} onChange={e => setExamType(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #e0e0e0', fontSize: '15px', background: '#fff' }}>
              <option>JEE</option><option>NEET</option><option>UPSC</option><option>SSC</option><option>CA</option><option>General</option>
            </select>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#444', marginBottom: '8px' }}>Number of Questions: {numQuestions}</label>
            <input type="range" min="5" max="30" value={numQuestions} onChange={e => setNumQuestions(e.target.value)} style={{ width: '100%' }} />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#444', marginBottom: '8px' }}>Upload File (PDF or TXT)</label>
            <div style={{ border: '2px dashed #d0d0d0', borderRadius: '12px', padding: '32px', textAlign: 'center', background: file ? '#f0fff4' : '#fafafa', cursor: 'pointer' }} onClick={() => document.getElementById('fileInput').click()}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>{file ? '✅' : '📄'}</div>
              <p style={{ margin: '0', fontWeight: '500', color: '#444' }}>{file ? file.name : 'Click to choose a file'}</p>
            </div>
            <input id="fileInput" type="file" accept=".pdf,.txt" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
          </div>
          {error && <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', color: '#cc0000', fontSize: '14px' }}>{error}</div>}
          {status && <div style={{ background: '#f0f4ff', border: '1px solid #c0ccff', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', color: '#3355cc', fontSize: '14px' }}>⏳ {status}</div>}
          <button onClick={handleUpload} disabled={loading} style={{ width: '100%', padding: '14px', background: loading ? '#aaa' : '#6c63ff', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Generating Questions...' : '✨ Generate Quiz with AI'}
          </button>
        </div>

        {questions.length > 0 && (
          <div>
            <h2 style={{ margin: '0 0 16px', fontSize: '22px', color: '#1a1a2e' }}>Generated Questions ({questions.length})</h2>
            {questions.map((q, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '14px', padding: '24px', border: '1px solid #e0e0e0', marginBottom: '16px' }}>
                <p style={{ fontWeight: '500', color: '#1a1a2e', margin: '0 0 14px', fontSize: '15px' }}><strong>Q{i+1}.</strong> {q.question}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                  {['A','B','C','D'].map(opt => (
                    <div key={opt} style={{ padding: '10px 14px', borderRadius: '8px', background: q.correct === opt ? '#e8f5e9' : '#f5f5f5', border: q.correct === opt ? '1.5px solid #4caf50' : '1.5px solid transparent', fontSize: '14px' }}>
                      <strong>{opt}.</strong> {getOption(q, opt)}
                    </div>
                  ))}
                </div>
                <div style={{ background: '#f0f4ff', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#3355cc' }}>
                  <strong>Explanation:</strong> {q.explanation}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}