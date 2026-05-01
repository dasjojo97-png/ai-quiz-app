import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function extractText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.pdf')) {
    const text = buffer.toString('latin1');
    const cleaned = text
      .replace(/[^\x20-\x7E\n\r]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return cleaned;
  }

  return buffer.toString('utf-8');
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const subject = formData.get('subject');
    const examType = formData.get('examType');
    const numQuestions = parseInt(formData.get('numQuestions')) || 5; // ✅ FIXED: default reduced to 5

    if (!file) return Response.json({ error: 'No file uploaded' }, { status: 400 });

    const extractedText = await extractText(file);
    const cleaned = extractedText.replace(/\s+/g, ' ').trim().slice(0, 4000); // ✅ FIXED: reduced from 8000 to 4000
    const hasContent = cleaned.replace(/\s/g, '').length > 100;

    const difficultyInstructions = examType === 'UPSC' ?
      'UPSC Prelims level - analytical, multi-concept, tricky options that test deep understanding. Questions should require reasoning not just memorization.' :
      examType === 'JEE' ?
      'JEE Advanced level - complex problem solving, multi-step reasoning, application of multiple concepts.' :
      examType === 'NEET' ?
      'NEET level - clinical application, mechanism-based, exception questions.' :
      examType === 'CA' ?
      'CA Final level - complex scenarios, judgement based, practical problem solving.' :
      'Advanced competitive exam level - analytical, application-based, tricky distractors.';

    const prompt = `You are a senior examiner creating ${examType} level questions on "${subject}".

${hasContent ? `Study material:\n${cleaned}\n\n` : ''}

Create exactly ${numQuestions} DIFFICULT questions at ${difficultyInstructions}

STRICT RULES:
1. NO basic definition questions
2. ALL questions must require THINKING and ANALYSIS
3. Options must be TRICKY - wrong options should be plausible
4. Mix: cause-effect, exception-based, comparison, application questions
5. Difficulty: 30% medium, 70% hard
6. Each explanation must explain WHY other options are wrong

Return ONLY a valid JSON array, nothing else:
[{"question":"Full analytical question?","optionA":"Plausible option","optionB":"Correct answer","optionC":"Tricky wrong option","optionD":"Another wrong option","correct":"B","explanation":"Detailed explanation","difficulty":"hard","topic":"Topic name"}]`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6', // ✅ FIXED: correct model name
      max_tokens: 3000,           // ✅ FIXED: reduced from 6000 to 3000
      messages: [{ role: 'user', content: prompt }],
    });

    let responseText = message.content[0].text.trim();
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Could not generate questions. Please try again.');

    const questions = JSON.parse(jsonMatch[0]);
    if (!questions.length) throw new Error('No questions generated.');

    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({ title: `${subject} Quiz`, subject, exam_type: examType })
      .select().single();

    if (quizError) throw new Error('Could not save quiz: ' + quizError.message);

    await supabase.from('questions').insert(
      questions.map(q => ({
        quiz_id: quiz.id,
        question: q.question,
        option_a: q.optionA,
        option_b: q.optionB,
        option_c: q.optionC,
        option_d: q.optionD,
        correct: q.correct,
        explanation: q.explanation,
        difficulty: q.difficulty,
        topic: q.topic,
      }))
    );

    return Response.json({ questions, quizId: quiz.id });

  } catch (err) {
    console.error('Generate error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}