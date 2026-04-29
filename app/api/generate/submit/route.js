import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { quizId, answers, studentName, questionIds } = await request.json();

    console.log('questionIds received:', questionIds);
    console.log('answers received:', answers);

    const idsToFetch = (questionIds && questionIds.length > 0)
      ? questionIds
      : Object.keys(answers);

    console.log('idsToFetch:', idsToFetch);

    if (idsToFetch.length === 0) {
      return Response.json({ score: 0, total: 0, percentage: 0, results: [], weakTopics: [] });
    }

    const { data: questions, error } = await supabase
      .from('questions')
      .select('*')
      .in('id', idsToFetch);

    if (error) throw error;

    let score = 0;
    const results = (questions || []).map(q => {
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

    const total = idsToFetch.length;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    const weakTopics = results
      .filter(r => !r.isCorrect)
      .map(r => r.topic)
      .filter((v, i, a) => v && a.indexOf(v) === i);

    await supabase.from('attempts').insert({
      quiz_id: quizId,
      score: percentage,
      answers,
      student_name: studentName,
    });

    return Response.json({ score, total, percentage, results, weakTopics });

  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
