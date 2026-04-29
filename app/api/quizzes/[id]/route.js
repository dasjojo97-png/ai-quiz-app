import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request, context) {
  try {
    const params = await context.params;
    const id = params.id;
    
    const { data: questions, error } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', id);
    
    if (error) throw error;
    return Response.json({ questions: questions || [] });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}