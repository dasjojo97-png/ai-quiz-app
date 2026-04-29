 import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(request) {
  try {
    const { quizId, answers, studentName } = await request.json();
    const { data: questions, error } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', quizId);
    if (error) throw error;

    let score = 0;
    const results = questions.map(q => {
      const studentAnswer = answers[q.id] || '';
      const isCorrect = studentAnswer === q.correct;
      if (isCorrect) score++;
      return {
        question: q.question,
        correct: q.correct,
        studentAnswer,
        isCorrect,
        explanation: q.explanation,
        topic: q.topic,
        optionA: q.option_a,
        optionB: q.option_b,
        optionC: q.option_c,
        optionD: q.option_d,
      };
    });

    const percentage = Math.round((score / questions.length) * 100);
    const weakTopics = results.filter(r => !r.isCorrect).map(r => r.topic).filter((v, i, a) => a.indexOf(v) === i);

    await supabase.from('attempts').insert({ quiz_id: quizId, score: percentage, answers });

    return Response.json({ score, total: questions.length, percentage, results, weakTopics });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
