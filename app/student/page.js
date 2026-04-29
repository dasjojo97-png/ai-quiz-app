'use client';
import { useState, useEffect } from 'react';

export default function StudentPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [nameSet, setNameSet] = useState(false);

  useEffect(() => {
    fetch('/api/quizzes')
      .then(r => r.json())
      .then(data => { setQuizzes(data.quizzes || []); setLoading(false); });
  }, []);

  if (!nameSet) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ background: '#fff', borderRadius: '16px', padding: '40px', border: '1px solid #e0e0e0', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎓</div>
          <h2 style={{ margin: '0 0 8px', color: '#1a1a2e' }}>Welcome, Student!</h2>
          <p style={{ color: '#888', margin: '0 0 24px', fontSize: '14px' }}>Enter your name to start</p>
          <input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #e0e0e0', fontSize: '15px', outline: 'none', boxSizing: 'border-box', marginBottom: '16px' }} />
          <button onClick={() => name.trim() && setNameSet(true)}
            style={{ width: '100%', padding: '12px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
            Continue →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#1a1a2e', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ color: '#fff', margin: 0, fontSize: '20px' }}>Hi, {name}!</h1>
        <a href="/" style={{ color: '#aaa', textDecoration: 'none', fontSize: '14px' }}>Back to home</a>
      </div>
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
        <h2 style={{ color: '#1a1a2e', marginBottom: '24px' }}>Available Quizzes</h2>
        {loading && <p style={{ color: '#888' }}>Loading quizzes...</p>}
        {!loading && quizzes.length === 0 && (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '40px', textAlign: 'center', border: '1px solid #e0e0e0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <p style={{ color: '#888' }}>No quizzes yet. Ask your teacher to create one!</p>
          </div>
        )}
        {quizzes.map(quiz => (
          <div key={quiz.id} style={{ background: '#fff', borderRadius: '14px', padding: '24px', border: '1px solid #e0e0e0', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 6px', color: '#1a1a2e', fontSize: '18px' }}>{quiz.title}</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ background: '#f0f0ff', color: '#6c63ff', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>{quiz.exam_type}</span>
                <span style={{ background: '#f0fff4', color: '#2e7d32', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>{quiz.subject}</span>
              </div>
            </div>
            <a href={`/student/quiz/${quiz.id}?name=${encodeURIComponent(name)}`}
              style={{ background: '#6c63ff', color: '#fff', padding: '10px 20px', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
              Start Quiz →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}