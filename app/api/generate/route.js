import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function extractText(file) {
  const fileName = file.name.toLowerCase();
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (fileName.endsWith('.pdf')) {
    try {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      return data.text;
    } catch (e) {
      console.error('PDF parse error:', e);
      return buffer.toString('latin1').replace(/[^\x20-\x7E\n]/g, ' ');
    }
  }

  if (fileName.endsWith('.docx')) {
    try {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (e) {
      return buffer.toString('utf-8');
    }
  }

  if (fileName.endsWith('.mp3') || fileName.endsWith('.mp4') || 
      fileName.endsWith('.wav') || fileName.endsWith('.m4a') ||
      fileName.endsWith('.webm')) {
    try {
      const OpenAI = require('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const { toFile } = require('openai');
      const audioFile = await toFile(buffer, file.name, { type: file.type });
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
      });
      return transcription.text;
    } catch (e) {
      console.error('Audio transcription error:', e);
      throw new Error('Could not transcribe audio/video file. Please check your OpenAI API key.');
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

    let extractedText = '';
    try {
      extractedText = await extractText(file);
    } catch (e) {
      return Response.json({ error: e.message }, { status: 400 });
    }

    const cleaned = extractedText.replace(/\s+/g, ' ').trim().slice(0, 8000);
    const hasContent = cleaned.length > 100;

    const difficultyInstructions = examType === 'UPSC' ? 
      `UPSC Prelims level - analytical, multi-concept, tricky options that test deep understanding. Questions should require reasoning not just memorization. Include questions on implications, exceptions, comparisons and applications.` :
      examType === 'JEE' ? 
      `JEE Advanced level - complex problem solving, multi-step reasoning, application of multiple concepts together.` :
      examType === 'NEET' ?
      `NEET level - clinical application, mechanism-based, exception questions, compare and contrast between similar concepts.` :
      examType === 'CA' ?
      `CA Final level - complex scenarios, judgement based, multi-standard application, practical problem solving.` :
      `Advanced competitive exam level - analytical, application-based, tricky distractors.`;

    const prompt = `You are a senior examiner creating ${examType} level questions on "${subject}". 

${hasContent ? `Study material:\n${cleaned}\n\n` : ''}

Create exactly ${numQuestions} DIFFICULT questions at ${difficultyInstructions}

STRICT RULES:
1. NO basic definition questions like "What is X?" or "Who founded Y?"
2. ALL questions must require THINKING and ANALYSIS not just memory
3. Options must be TRICKY - wrong options should be plausible and close to correct
4. Mix question types: cause-effect, exception-based ("Which is NOT correct"), comparison, application, implication
5. Difficulty: 30% medium, 70% hard
6. Each explanation must explain WHY other options are wrong too

Return ONLY a valid JSON array, nothing else:
[{
  "question": "Full analytical question here?",
  "optionA": "Plausible but wrong option",
  "optionB": "Correct answer",
  "optionC": "Tricky wrong option",  
  "optionD": "Another plausible wrong option",
  "correct": "B",
  "explanation": "Detailed explanation of why B is correct AND why A, C, D are wrong",
  "difficulty": "hard",
  "topic": "Specific topic name"
}]`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 6000,
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