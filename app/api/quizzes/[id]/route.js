import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request, context) {
  try {
    const params = await context.params;
    const id = params.id;
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get('difficulty');

    let query = supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', id);

    if (difficulty && difficulty !== 'all') {
      if (difficulty === 'extreme') {
        query = query.eq('difficulty', 'hard');
      } else {
        query = query.eq('difficulty', difficulty);
      }
    }

    const { data: questions, error } = await query;
    if (error) throw error;

    let finalQuestions = questions || [];

    if (difficulty === 'extreme' && finalQuestions.length > 0) {
      finalQuestions = finalQuestions.sort(() => Math.random() - 0.5).slice(0, Math.ceil(finalQuestions.length * 0.6));
    }

    return Response.json({ questions: finalQuestions });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}