 import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('attempts')
      .select('*')
      .order('score', { ascending: false });

    if (error) throw error;

    const grouped = {};
    data.forEach(attempt => {
      const key = attempt.student_id || 'anonymous';
      if (!grouped[key]) {
        grouped[key] = {
          studentName: attempt.student_name || 'Student',
          totalScore: 0,
          attempts: 0,
          bestScore: 0,
        };
      }
      grouped[key].totalScore += attempt.score || 0;
      grouped[key].attempts += 1;
      grouped[key].bestScore = Math.max(grouped[key].bestScore, attempt.score || 0);
    });

    const leaderboard = Object.values(grouped)
      .map(s => ({ ...s, avgScore: Math.round(s.totalScore / s.attempts) }))
      .sort((a, b) => b.bestScore - a.bestScore)
      .slice(0, 20);

    return Response.json({ leaderboard });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
