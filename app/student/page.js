'use client';
import { useState, useEffect } from 'react';

export default function StudentPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [nameSet, setNameSet] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState({});

  useEffect(() => {
    fetch('/api/quizzes')
      .then(r => r.json())
      .then(data => { setQuizzes(data.quizzes || []); setLoading(false); });
  }, []);

  const difficulties = [
    { value: 'all', label: 'All Levels', emoji: '📚', color: '#6c63ff', bg: '#f0f0ff' },
    { value: 'easy', label: 'Easy', emoji: '🟢', color: '#2e7d32', bg: '#f0fff4' },
    { value: 'medium', label: 'Medium', emoji: '🟡', color: '#aa6600', bg: '#fff8e1' },
    { value: 'hard', label: 'Hard', emoji: '🔴', color: '#c00', bg: '#fff0f0' },
    { value: 'extreme', label: 'Extreme', emoji: '💀', color: '#4a0080', bg: '#f5f0ff' },
  ];

  if (!nameSet) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ background: '#fff', borderRadius: '16px', padding: '40px', border: '1px solid #e0e0e0', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎓</div>
          <h2 style={{ margin: '0 0 8px', color: '#1a1a2e' }}>Welcome, Student!</h2>
          <p style={{ color: '#888', margin: '0 0 24px', fontSize: '14px' }}>Enter your name to start</p>
          <input type="text" placeholder="Your name" value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && name.trim() && setNameSet(true)}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #e0e0e0', fontSize: '15px', outline: 'none', boxSizing: 'border-box', marginBottom: '16px' }} />
          <button onClick={() => name.trim() && setNameSet(true)}
            style={{ width: '100%', padding: '12px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
            Let's Go →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#1a1a2e', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ color: '#fff', margin: 0, fontSize: '20px' }}>Hi, {name}! 👋</h1>
          <p style={{ color: '#aaa', margin: '2px 0 0', fontSize: '13px' }}>Choose a quiz and difficulty level</p>
        </div>
        <a href="/" style={{ color: '#aaa', textDecoration: 'none', fontSize: '14px' }}>← Home</a>
      </div>

      <div style={{ maxWidth: '860px', margin: '40px auto', padding: '0 20px' }}>
        <h2 style={{ color: '#1a1a2e', marginBottom: '24px', fontSize: '22px' }}>Available Quizzes</h2>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>⏳</div>
            <p>Loading quizzes...</p>
          </div>
        )}

        {!loading && quizzes.length === 0 && (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '60px', textAlign: 'center', border: '1px solid #e0e0e0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <p style={{ color: '#888', fontSize: '16px' }}>No quizzes yet. Ask your teacher to create one!</p>
          </div>
        )}

        {quizzes.map(quiz => {
          const diff = selectedDifficulty[quiz.id] || 'all';
          const diffInfo = difficulties.find(d => d.value === diff);
          return (
            <div key={quiz.id} style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e0e0e0', marginBottom: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ margin: '0 0 10px', color: '#1a1a2e', fontSize: '18px' }}>{quiz.title}</h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ background: '#f0f0ff', color: '#6c63ff', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>{quiz.exam_type}</span>
                  <span style={{ background: '#f0fff4', color: '#2e7d32', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>{quiz.subject}</span>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '13px', color: '#666', margin: '0 0 10px', fontWeight: '500' }}>Select Difficulty:</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {difficulties.map(d => (
                    <button key={d.value}
                      onClick={() => setSelectedDifficulty(prev => ({ ...prev, [quiz.id]: d.value }))}
                      style={{
                        padding: '8px 14px', borderRadius: '20px',
                        border: `1.5px solid ${diff === d.value ? d.color : '#e0e0e0'}`,
                        background: diff === d.value ? d.bg : '#fafafa',
                        color: diff === d.value ? d.color : '#888',
                        fontSize: '13px', fontWeight: diff === d.value ? '600' : '400',
                        cursor: 'pointer', transition: 'all 0.15s'
                      }}>
                      {d.emoji} {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {diff === 'extreme' && (
                <div style={{ background: '#f5f0ff', border: '1px solid #d0b0ff', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', fontSize: '13px', color: '#4a0080' }}>
                  💀 <strong>Extreme mode:</strong> Only the hardest questions, half the time. Are you sure?
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <a href={`/student/quiz/${quiz.id}?name=${encodeURIComponent(name)}&difficulty=${diff}`}
                  style={{
                    background: diffInfo?.color || '#6c63ff',
                    color: '#fff', padding: '11px 24px', borderRadius: '10px',
                    textDecoration: 'none', fontSize: '14px', fontWeight: '600'
                  }}>
                  {diffInfo?.emoji} Start {diffInfo?.label} Quiz →
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}