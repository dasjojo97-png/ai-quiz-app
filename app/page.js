'use client';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: '#f8f9fa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: '20px' }}>

      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '42px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 12px' }}>AI Quiz Generator</h1>
        <p style={{ fontSize: '18px', color: '#666', margin: '0' }}>For UPSC · JEE · NEET · SSC · CA aspirants</p>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>

        <a href="/teacher" style={{ textDecoration: 'none' }}>
          <div style={{ background: '#fff', border: '2px solid #e0e0e0', borderRadius: '16px', padding: '40px 48px', textAlign: 'center', cursor: 'pointer', minWidth: '220px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👨‍🏫</div>
            <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#1a1a2e', margin: '0 0 8px' }}>I am a Teacher</h2>
            <p style={{ fontSize: '14px', color: '#888', margin: '0' }}>Upload files · Generate quizzes</p>
          </div>
        </a>

        <a href="/student" style={{ textDecoration: 'none' }}>
          <div style={{ background: '#fff', border: '2px solid #e0e0e0', borderRadius: '16px', padding: '40px 48px', textAlign: 'center', cursor: 'pointer', minWidth: '220px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎓</div>
            <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#1a1a2e', margin: '0 0 8px' }}>I am a Student</h2>
            <p style={{ fontSize: '14px', color: '#888', margin: '0' }}>Take quizzes · View results</p>
          </div>
        </a>

        <a href="/flashcards" style={{ textDecoration: 'none' }}>
          <div style={{ background: '#fff', border: '2px solid #e0e0e0', borderRadius: '16px', padding: '40px 48px', textAlign: 'center', cursor: 'pointer', minWidth: '220px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎴</div>
            <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#1a1a2e', margin: '0 0 8px' }}>Flashcards</h2>
            <p style={{ fontSize: '14px', color: '#888', margin: '0' }}>Study smart · Flip cards</p>
          </div>
        </a>

        <a href="/leaderboard" style={{ textDecoration: 'none' }}>
          <div style={{ background: '#fff', border: '2px solid #e0e0e0', borderRadius: '16px', padding: '40px 48px', textAlign: 'center', cursor: 'pointer', minWidth: '220px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏆</div>
            <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#1a1a2e', margin: '0 0 8px' }}>Leaderboard</h2>
            <p style={{ fontSize: '14px', color: '#888', margin: '0' }}>Top scorers · Rankings</p>
          </div>
        </a>

      </div>

      <p style={{ marginTop: '48px', fontSize: '13px', color: '#bbb' }}>Powered by Claude AI</p>
    </main>
  );
}