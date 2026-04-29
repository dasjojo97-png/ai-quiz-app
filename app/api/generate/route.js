import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function extractText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.pdf')) {
    try {
      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.js');
      const loadingTask = pdfjsLib.getDocument({ data: buffer });
      const pdf = await loadingTask.promise;
      let text = '';
      for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ') + '\n';
      }
      return text;
    } catch (e) {
      return buffer.toString('latin1').replace(/[^\x20-\x7E\n]/g, ' ');
    }
  }
  return buffer.toString('utf-8');
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const subject = formData.get('subject');
    const examType = formData.get('examType');
    const numQuestions = parseInt(formData.get('numQuestions')) || 10;

    if (!file) return Response.json({ error: 'No file uploaded' }, { status: 400 });

    const rawText = await extractText(file);
    const cleaned = rawText.replace(/\s+/g, ' ').trim().slice(0, 5000);
    const hasContent = cleaned.length > 200;

    const prompt = `You are an expert teacher creating ${examType} exam questions about "${subject}".

${hasContent ? `Use this study material:\n${cleaned}\n\n` : ''}Generate exactly ${numQuestions} MCQ questions. Each question MUST have 4 complete answer options.

IMPORTANT: Return ONLY valid JSON array. No markdown, no explanation, just the array:
[{"question":"Full question here?","optionA":"First option","optionB":"Second option","optionC":"Third option","optionD":"Fourth option","correct":"A","explanation":"Why this is correct","difficulty":"medium","topic":"Topic name"}]`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    });

    let responseText = message.content[0].text.trim();
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Could not parse questions. Please try again.');

    const questions = JSON.parse(jsonMatch[0]);
    if (!questions.length) throw new Error('No questions generated. Please try again.');

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