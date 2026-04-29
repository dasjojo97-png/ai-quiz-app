 'use client';
import { useState, useEffect } from 'react';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(data => { setLeaderboard(data.leaderboard || []); setLoading(false); });
  }, []);

  const medals = ['🥇', '🥈', '🥉'];
  const getBadge = (score) => {
    if (score >= 90) return { label: 'Champion', color: '#b8860b', bg: '#fff8dc' };
    if (score >= 75) return { label: 'Expert', color: '#6c63ff', bg: '#f0f0ff' };
    if (score >= 60) return { label: 'Proficient', color: '#2e7d32', bg: '#f0fff4' };
    if (score >= 40) return { label: 'Learner', color: '#aa6600', bg: '#fff8e1' };
    return { label: 'Beginner', color: '#888', bg: '#f5f5f5' };
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#1a1a2e', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ color: '#fff', margin: 0, fontSize: '20px' }}>🏆 Leaderboard</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <a href="/student" style={{ color: '#aaa', textDecoration: 'none', fontSize: '14px' }}>Take a Quiz</a>
          <a href="/" style={{ color: '#aaa', textDecoration: 'none', fontSize: '14px' }}>← Home</a>
        </div>
      </div>

      <div style={{ maxWidth: '700px', margin: '40px auto', padding: '0 20px' }}>

        {/* Top 3 podium */}
        {leaderboard.length >= 3 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '16px', marginBottom: '40px' }}>
            {[1, 0, 2].map(pos => {
              const player = leaderboard[pos];
              const heights = [140, 180, 120];
              const height = heights[[1, 0, 2].indexOf(pos)];
              const badge = getBadge(player.bestScore);
              return (
                <div key={pos} style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>{medals[pos]}</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a2e', marginBottom: '4px' }}>{player.studentName}</div>
                  <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>{player.bestScore}%</div>
                  <div style={{ background: pos === 0 ? '#ffd700' : pos === 1 ? '#c0c0c0' : '#cd7f32', height: `${height}px`, borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '18px' }}>
                    #{pos + 1}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '18px', color: '#1a1a2e' }}>All Rankings</h2>
            <span style={{ fontSize: '13px', color: '#888' }}>{leaderboard.length} students</span>
          </div>

          {loading && (
            <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>⏳</div>
              <p>Loading leaderboard...</p>
            </div>
          )}

          {!loading && leaderboard.length === 0 && (
            <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏁</div>
              <p>No scores yet! Be the first to take a quiz.</p>
              <a href="/student" style={{ color: '#6c63ff', fontWeight: '600', textDecoration: 'none' }}>Start a Quiz →</a>
            </div>
          )}

          {leaderboard.map((player, i) => {
            const badge = getBadge(player.bestScore);
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px', borderBottom: '1px solid #f5f5f5', background: i < 3 ? '#fafafa' : '#fff', transition: 'background 0.15s' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: i < 3 ? '18px' : '14px', fontWeight: '700', color: i < 3 ? '#fff' : '#888', flexShrink: 0 }}>
                  {i < 3 ? medals[i] : `#${i + 1}`}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#1a1a2e', fontSize: '15px' }}>{player.studentName}</div>
                  <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>{player.attempts} quiz{player.attempts !== 1 ? 'zes' : ''} taken</div>
                </div>

                <div style={{ textAlign: 'center', marginRight: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '2px' }}>AVG</div>
                  <div style={{ fontWeight: '600', color: '#555', fontSize: '14px' }}>{player.avgScore}%</div>
                </div>

                <div style={{ textAlign: 'center', marginRight: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '2px' }}>BEST</div>
                  <div style={{ fontWeight: '700', color: '#1a1a2e', fontSize: '18px' }}>{player.bestScore}%</div>
                </div>

                <div style={{ background: badge.bg, color: badge.color, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', flexShrink: 0 }}>
                  {badge.label}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px', paddingBottom: '40px' }}>
          <a href="/student" style={{ background: '#6c63ff', color: '#fff', padding: '12px 32px', borderRadius: '10px', textDecoration: 'none', fontSize: '15px', fontWeight: '600' }}>
            Take a Quiz to Join →
          </a>
        </div>
      </div>
    </div>
  );
}
