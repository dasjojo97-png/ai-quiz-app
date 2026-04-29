'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

export default function QuizPage() {
  const params = useParams();
  const id = params?.id;
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Student';

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/quizzes/${id}`)
      .then(r => r.json())
      .then(data => {
        const qs = data.questions || [];
        setQuestions(qs);
        setTimeLeft(qs.length * 60);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleSubmit = useCallback(async () => {
    if (submitted) return;
    setSubmitted(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: id, answers, studentName: name }),
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    }
  }, [id, answers, name, submitted]);

  useEffect(() => {
    if (timeLeft <= 0 && !submitted) { handleSubmit(); return; }
    if (submitted) return;
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, submitted, handleSubmit]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'sans-serif', fontSize: '18px', color: '#888' }}>
      Loading quiz...
    </div>
  );

  if (questions.length === 0) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <div>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
        <p style={{ color: '#888' }}>No questions found for this quiz.</p>
        <a href="/student" style={{ color: '#6c63ff' }}>Go back</a>
      </div>
    </div>
  );

  if (submitted && results) {
    const pct = results.percentage || 0;
    const grade = pct >= 80 ? '🏆 Excellent!' : pct >= 60 ? '👍 Good job!' : pct >= 40 ? '📚 Keep studying!' : '💪 Don\'t give up!';
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9fa', fontFamily: 'sans-serif' }}>
        <div style={{ background: '#1a1a2e', padding: '16px 32px' }}>
          <h1 style={{ color: '#fff', margin: 0, fontSize: '20px' }}>Quiz Results — {name}</h1>
        </div>
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '40px', border: '1px solid #e0e0e0', textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>{grade.split(' ')[0]}</div>
            <h2 style={{ margin: '0 0 8px', fontSize: '28px', color: '#1a1a2e' }}>{results.score}/{results.total} Correct</h2>
            <div style={{ fontSize: '48px', fontWeight: '700', color: pct >= 60 ? '#2e7d32' : '#c00', margin: '8px 0' }}>{pct}%</div>
            <p style={{ color: '#888', margin: '0 0 16px' }}>{grade.split(' ').slice(1).join(' ')}</p>
            {results.weakTopics?.length > 0 && (
              <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: '12px', padding: '16px', textAlign: 'left', marginTop: '16px' }}>
                <p style={{ margin: '0 0 8px', fontWeight: '600', color: '#856404' }}>📌 Topics to improve:</p>
                {results.weakTopics.map((t, i) => <p key={i} style={{ margin: '4px 0', color: '#856404', fontSize: '14px' }}>• {t}</p>)}
              </div>
            )}
          </div>
          <h3 style={{ color: '#1a1a2e', marginBottom: '16px' }}>Question Review</h3>
          {results.results?.map((r, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: `1px solid ${r.isCorrect ? '#c8e6c9' : '#ffcdd2'}`, marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <p style={{ margin: 0, fontWeight: '500', color: '#1a1a2e', flex: 1 }}><strong>Q{i + 1}.</strong> {r.question}</p>
                <span style={{ marginLeft: '12px', fontSize: '20px' }}>{r.isCorrect ? '✅' : '❌'}</span>
              </div>
              {!r.isCorrect && <p style={{ margin: '4px 0', fontSize: '13px', color: '#c00' }}>Your answer: {r.studentAnswer || 'Not answered'}</p>}
              <p style={{ margin: '4px 0', fontSize: '13px', color: '#2e7d32' }}>Correct: {r.correct} — {r['option' + r.correct] || r['optionA']}</p>
              <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#555', background: '#f5f5f5', padding: '8px', borderRadius: '6px' }}>{r.explanation}</p>
            </div>
          ))}
          <div style={{ textAlign: 'center', marginTop: '24px', paddingBottom: '40px' }}>
            <a href="/student" style={{ background: '#6c63ff', color: '#fff', padding: '12px 32px', borderRadius: '10px', textDecoration: 'none', fontSize: '15px', fontWeight: '600' }}>Take Another Quiz</a>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#1a1a2e', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ color: '#fff', margin: 0, fontSize: '18px' }}>Question {current + 1} of {questions.length}</h1>
        <div style={{ background: timeLeft < 60 ? '#c00' : '#6c63ff', color: '#fff', padding: '6px 16px', borderRadius: '20px', fontWeight: '600', fontSize: '16px' }}>
          ⏱ {mins}:{secs.toString().padStart(2, '0')}
        </div>
      </div>

      <div style={{ maxWidth: '700px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ background: '#e0e0e0', borderRadius: '4px', height: '6px', marginBottom: '32px' }}>
          <div style={{ background: '#6c63ff', height: '100%', borderRadius: '4px', width: `${((current + 1) / questions.length) * 100}%`, transition: 'width 0.3s' }} />
        </div>

        <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid #e0e0e0', marginBottom: '24px' }}>
          <p style={{ fontSize: '18px', fontWeight: '500', color: '#1a1a2e', margin: '0 0 28px', lineHeight: '1.6' }}>{q?.question}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['A', 'B', 'C', 'D'].map(opt => {
              const optText = q?.['option_' + opt.toLowerCase()] || q?.['option' + opt] || '';
              const selected = answers[q?.id] === opt;
              return (
                <button key={opt} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                  style={{ padding: '14px 20px', borderRadius: '10px', border: selected ? '2px solid #6c63ff' : '1.5px solid #e0e0e0', background: selected ? '#f0f0ff' : '#fafafa', textAlign: 'left', fontSize: '15px', cursor: 'pointer', color: '#1a1a2e', fontWeight: selected ? '600' : '400', transition: 'all 0.15s' }}>
                  <strong>{opt}.</strong> {optText}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
          <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
            style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1.5px solid #e0e0e0', background: '#fff', fontSize: '15px', cursor: current === 0 ? 'not-allowed' : 'pointer', color: '#444', opacity: current === 0 ? 0.5 : 1 }}>
            ← Previous
          </button>
          {current < questions.length - 1 ? (
            <button onClick={() => setCurrent(c => c + 1)}
              style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#6c63ff', color: '#fff', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
              Next →
            </button>
          ) : (
            <button onClick={handleSubmit}
              style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#2e7d32', color: '#fff', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
              Submit Quiz ✓
            </button>
          )}
        </div>
        <p style={{ textAlign: 'center', color: '#aaa', fontSize: '13px', marginTop: '16px' }}>
          {Object.keys(answers).length} of {questions.length} answered
        </p>
      </div>
    </div>
  );
}