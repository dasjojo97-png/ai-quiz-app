import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function extractText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.pdf')) {
    try {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      return data.text;
    } catch (e) {
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
  return buffer.toString('utf-8');
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const subject = formData.get('subject');
    const numCards = parseInt(formData.get('numCards')) || 15;

    if (!file) return Response.json({ error: 'No file uploaded' }, { status: 400 });

    let extractedText = await extractText(file);
    const cleaned = extractedText.replace(/\s+/g, ' ').trim().slice(0, 10000);
    const hasContent = cleaned.length > 200;

    const prompt = `You are a senior faculty member and exam expert for UPSC, JEE, NEET, SSC and CA exams. 

${hasContent ? `Here is the study material to create flashcards from:\n\n${cleaned}\n\n` : `Create flashcards about ${subject} from your expert knowledge.\n\n`}

Create exactly ${numCards} HIGH-VALUE flashcards on "${subject}" that are CRITICAL for competitive exams.

STRICT RULES:
1. ONLY include facts, concepts, dates, formulas, or definitions that are VERY LIKELY to appear in exams
2. NO basic or obvious facts — every card must be something a student might not know
3. TERMS should be specific: names, acts, articles, formulas, years, mechanisms, clauses — not generic topics
4. DEFINITIONS should be precise, complete and exam-ready — include specific numbers, dates, exceptions where relevant
5. Prioritize: constitutional articles, landmark cases, important acts, specific data points, scientific mechanisms, formulas, exceptions to rules, comparisons between similar concepts
6. If the material has specific data (Article numbers, Section numbers, dates, statistics, names) — USE THEM
7. Each card should be a standalone fact a student can memorize and recall in an exam

Return ONLY a valid JSON array, nothing else:
[
  {
    "term": "Article 356 of Indian Constitution",
    "definition": "President's Rule (Direct Central Government control) imposed in a state when constitutional machinery fails. Originally no time limit, but 44th Amendment (1978) limited it to 6 months, extendable to 3 years with Parliament approval every 6 months. Used 100+ times — S.R. Bommai case (1994) made it subject to judicial review.",
    "topic": "Indian Polity"
  }
]`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 6000,
      messages: [{ role: 'user', content: prompt }],
    });

    let responseText = message.content[0].text.trim();
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Could not generate flashcards. Please try again.');

    const flashcards = JSON.parse(jsonMatch[0]);

    await supabase.from('flashcards').insert(
      flashcards.map(f => ({
        term: f.term,
        definition: f.definition,
        quiz_id: null,
      }))
    );

    return Response.json({ flashcards, subject });

  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .order('id', { ascending: false })
      .limit(50);

    if (error) throw error;
    return Response.json({ flashcards: data });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
