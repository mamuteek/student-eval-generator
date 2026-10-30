/**
 * Multi-Provider LLM Service for Student Evaluation Generation
 * Supports Google Gemini (v3 & v3.8), Groq (LPU Free Tier), OpenRouter (Free Tier), and Mistral AI
 */

export const LLM_PROVIDERS = [
  {
    id: 'gemini',
    name: 'Google Gemini (AI Studio)',
    badge: 'Official Google Free Tier',
    keyHelpUrl: 'https://aistudio.google.com/app/apikey',
    keyPlaceholder: 'AIzaSy...',
    helpText: 'Free tier key from Google AI Studio (no credit card required, generous daily limits).',
    models: [
      { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash (Recommended)', desc: 'State-of-the-art speed, reasoning & instruction following' },
      { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro Preview', desc: 'Deep pedagogical nuance & complex reasoning' },
      { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', desc: 'Next-gen fast preview model' },
    ]
  },
  {
    id: 'groq',
    name: 'Groq (Free LPU Cloud)',
    badge: '100% Free, Blazing Fast',
    keyHelpUrl: 'https://console.groq.com/keys',
    keyPlaceholder: 'gsk_...',
    helpText: 'Get a 100% free API key instantly at console.groq.com (no credit card required). Ultra-fast generation on Meta Llama models.',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Meta Llama 3.3 70B (Recommended for Groq)', desc: 'Flagship open intelligence, exceptional writing & reasoning' },
      { id: 'llama-3.1-8b-instant', name: 'Meta Llama 3.1 8B Instant', desc: 'Instant generation for short verbal reports' },
    ]
  },
  {
    id: 'openrouter',
    name: 'OpenRouter (Free Models)',
    badge: 'Free Models Hub',
    keyHelpUrl: 'https://openrouter.ai/keys',
    keyPlaceholder: 'sk-or-v1-...',
    helpText: 'Get a free API key at openrouter.ai/keys (no credit card required). Grants access to open models ending in :free.',
    models: [
      { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B Instruct (Free)', desc: 'High quality open model via OpenRouter free tier' },
      { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 (Free)', desc: 'Reasoning-focused open weights model' },
      { id: 'qwen/qwen-2.5-72b-instruct:free', name: 'Qwen 2.5 72B (Free)', desc: 'Nuanced multilingual teacher prose' },
    ]
  },
  {
    id: 'mistral',
    name: 'Mistral AI (La Plateforme)',
    badge: 'Free Testing Tier',
    keyHelpUrl: 'https://console.mistral.ai/api-keys/',
    keyPlaceholder: '...',
    helpText: 'Free experimentation tier key from console.mistral.ai (no credit card required).',
    models: [
      { id: 'mistral-small-latest', name: 'Mistral Small (Latest)', desc: 'Fast, balanced European language model' },
    ]
  }
];

// Backward compatibility export
export const GEMINI_MODELS = LLM_PROVIDERS.find(p => p.id === 'gemini').models;

export const CATEGORY_DEFINITIONS = [
  {
    id: 'academic',
    name: 'Academics',
    icon: '🎵',
    levels: [
      { score: 1, label: 'Needs Support', desc: 'Struggles with core concepts' },
      { score: 2, label: 'Developing', desc: 'Basic grasp, needs practice' },
      { score: 3, label: 'Proficient', desc: 'Solid, reliable understanding' },
      { score: 4, label: 'Advanced', desc: 'Thorough mastery & high accuracy' },
      { score: 5, label: 'Exemplary', desc: 'Exceptional depth & insight' },
    ],
    presetChips: ['Quick learner', 'Strong sense of rhythm', 'Grasps melody and pitch', 'Needs step-by-step guidance', 'Struggles with rhythm exercises', 'Good recall of songs and notes']
  },
  {
    id: 'effort',
    name: 'Work ethics',
    icon: '⚡',
    levels: [
      { score: 1, label: 'Minimal', desc: 'Often incomplete or hurried' },
      { score: 2, label: 'Inconsistent', desc: 'Capable but requires reminding' },
      { score: 3, label: 'Consistent', desc: 'Hardworking, reliable preparation' },
      { score: 4, label: 'Diligent', desc: 'Self-motivated, proactive' },
      { score: 5, label: 'Exemplary', desc: 'Outstanding perseverance & pride' },
    ],
    presetChips: ['Careful with musical instruments', 'Meticulous attention to detail', 'Persists through difficult pieces', 'Easily discouraged', 'Hurries through activities', 'Takes great pride in singing/playing']
  },
  {
    id: 'engagement',
    name: 'Participation',
    icon: '🙋',
    levels: [
      { score: 1, label: 'Passive', desc: 'Quiet, reluctant or distracted' },
      { score: 2, label: 'Hesitant', desc: 'Participates only when prompted' },
      { score: 3, label: 'Attentive', desc: 'Listens well, contributes regularly' },
      { score: 4, label: 'Active', desc: 'Eager participant, joins enthusiastically' },
      { score: 5, label: 'Leading', desc: 'Inspires and enriches music activities' },
    ],
    presetChips: ['Enthusiastic singer', 'Attentive and focused listener', 'Asks thoughtful questions', 'Hesitant to sing or perform solo', 'Easily distracted during group practice', 'Passionate about music lessons']
  },
  {
    id: 'social',
    name: 'Social',
    icon: '🤝',
    levels: [
      { score: 1, label: 'Challenging', desc: 'Difficulties sharing or cooperating' },
      { score: 2, label: 'Variable', desc: 'Works well with friends only' },
      { score: 3, label: 'Collaborative', desc: 'Polite, considerate, good teammate' },
      { score: 4, label: 'Supportive', desc: 'Empathetic, encourages peers' },
      { score: 5, label: 'Role Model', desc: 'Natural collaborator and ensemble leader' },
    ],
    presetChips: ['Kind and polite', 'Excellent ensemble collaborator', 'Listens respectfully to others playing', 'Patient with classmates', 'Occasionally impatient in groups', 'Respectful to teacher and peers']
  },
  {
    id: 'progress',
    name: 'Growth',
    icon: '📈',
    levels: [
      { score: 1, label: 'Declining', desc: 'Faltered compared to earlier' },
      { score: 2, label: 'Steady / Flat', desc: 'Maintaining baseline, little change' },
      { score: 3, label: 'Progressing', desc: 'Solid, expected growth' },
      { score: 4, label: 'Substantial', desc: 'Clear, noticeable leaps forward' },
      { score: 5, label: 'Breakthrough', desc: 'Dramatic musical breakthrough & confidence' },
    ],
    presetChips: ['Consistent musical growth', 'Overcame performance shyness', 'Gained notable confidence', 'Maintained high standards', 'Shows great musical expression', 'Shows great resilience']
  }
];

export async function generateStudentEvaluation(params, signal = null) {
  const {
    provider = 'gemini',
    apiKey,
    model = 'gemini-3.8-flash',
    studentName = 'The student',
    subject = 'Music',
    grade = 1.0,
    wordLimit = 120,
    tone = 'Warm, balanced, and constructive',
    perspective = 'To Parents (3rd person, referring to student by first name only)',
    categories = {},
    strengths = [],
    weaknesses = [],
    goals = [],
    refinementInstruction = null,
    previousEvaluation = ''
  } = params;

  // Fallback / Demo generator if no API key is set
  if (!apiKey || apiKey.trim() === '') {
    return generateLocalDemoEvaluation(params);
  }

  const prompt = buildEvaluationPrompt({
    studentName,
    subject,
    grade,
    wordLimit,
    tone,
    perspective,
    categories,
    strengths,
    weaknesses,
    goals,
    refinementInstruction,
    previousEvaluation
  });

  if (provider === 'groq') {
    return callOpenAICompatibleAPI({
      endpoint: 'https://api.groq.com/openai/v1/chat/completions',
      apiKey,
      model: model || 'llama-3.3-70b-versatile',
      prompt,
      signal
    });
  } else if (provider === 'openrouter') {
    return callOpenAICompatibleAPI({
      endpoint: 'https://openrouter.ai/api/v1/chat/completions',
      apiKey,
      model: model || 'meta-llama/llama-3.3-70b-instruct:free',
      prompt,
      signal,
      extraHeaders: {
        'HTTP-Referer': 'https://mamuteek.github.io/student-eval-generator/',
        'X-Title': "Mamut's Student Evaluator"
      }
    });
  } else if (provider === 'mistral') {
    return callOpenAICompatibleAPI({
      endpoint: 'https://api.mistral.ai/v1/chat/completions',
      apiKey,
      model: model || 'mistral-small-latest',
      prompt,
      signal
    });
  } else {
    // Default: Google Gemini
    return callGeminiAPI({ apiKey, model, prompt, signal });
  }
}

async function callGeminiAPI({ apiKey, model, prompt, signal }) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    }
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData?.error?.message || `Gemini API returned status ${response.status}`;
      throw new Error(message);
    }

    const data = await response.json();
    const candidate = data?.candidates?.[0];

    if (candidate?.finishReason === 'MAX_TOKENS') {
      console.warn('Gemini hit MAX_TOKENS limit.');
    }

    // Filter out internal thought parts if returned by thinking models (e.g. Gemini 2.5 / 3.8)
    const parts = candidate?.content?.parts || [];
    const nonThoughtParts = parts.filter(p => !p.thought && p.text);
    const rawText = nonThoughtParts.length > 0
      ? nonThoughtParts.map(p => p.text).join('')
      : parts.map(p => p.text || '').join('');

    if (!rawText || !rawText.trim()) {
      throw new Error('Gemini API returned an empty response. Please check your prompt or model status.');
    }

    return cleanGeneratedText(rawText);
  } catch (err) {
    if (err.name === 'AbortError' || signal?.aborted) {
      console.log('Gemini request was cancelled.');
      throw err;
    }
    console.error('Error generating evaluation via Gemini:', err);
    throw err;
  }
}

async function callOpenAICompatibleAPI({ endpoint, apiKey, model, prompt, signal, extraHeaders = {} }) {
  const requestBody = {
    model,
    messages: [
      {
        role: 'system',
        content: 'You are an expert school teacher writing an individualized verbal evaluation / report card narrative comment for a student. Return ONLY the final evaluation narrative.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 2048
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`,
        ...extraHeaders
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData?.error?.message || `API returned status ${response.status}`;
      throw new Error(message);
    }

    const data = await response.json();
    const rawText = data?.choices?.[0]?.message?.content;

    if (!rawText || !rawText.trim()) {
      throw new Error('LLM API returned an empty response. Please check your model selection or API key.');
    }

    return cleanGeneratedText(rawText);
  } catch (err) {
    if (err.name === 'AbortError' || signal?.aborted) {
      console.log('LLM request was cancelled.');
      throw err;
    }
    console.error(`Error calling ${endpoint}:`, err);
    throw err;
  }
}

function buildEvaluationPrompt(p) {
  const categoriesText = CATEGORY_DEFINITIONS.map(cat => {
    const userCat = p.categories[cat.id];
    const score = userCat?.score || 3;
    const levelObj = cat.levels.find(l => l.score === score) || cat.levels[2];
    const chips = (userCat?.chips && userCat.chips.length > 0) ? `Specific details: ${userCat.chips.join(', ')}` : '';
    return `- ${cat.name}: Level ${score}/5 (${levelObj.label} - ${levelObj.desc}). ${chips}`;
  }).join('\n');

  const strengthsStr = p.strengths.length > 0 ? p.strengths.join(', ') : 'Not specified';
  const weaknessesStr = p.weaknesses.length > 0 ? p.weaknesses.join(', ') : 'None highlighted';
  const goalsStr = p.goals.length > 0 ? p.goals.join(', ') : 'Continue current positive trajectory';

  let refinementText = '';
  if (p.refinementInstruction && p.previousEvaluation) {
    refinementText = `
THIS IS A REFINEMENT REQUEST FOR AN EXISTING EVALUATION.
Original text:
"""${p.previousEvaluation}"""

Teacher's Refinement Instruction:
${p.refinementInstruction}
Keep the core facts the same, but modify the text according to this instruction.
`;
  }

  return `
You are an expert, compassionate, and articulate school teacher writing an individualized verbal evaluation / report card narrative comment for a student.

STUDENT PROFILE:
- Student Name: ${p.studentName} (FIRST NAME ONLY. The student is a child aged 6–12. Never invent or use any surname/last name; refer to the child solely by their first name).
- Subject: ${p.subject} (Music education, singing, rhythm, listening, and ensemble activities for kids aged 6–12).
- Overall Academic Grade: ${p.grade} on a 1.0 to 5.0 scale (where 1.0 is the best / highest mark like Czech 'výborný', and 5.0 is failing / lowest mark)
- Desired Length: Approximately ${p.wordLimit} words (Strict constraint: stay within ${Math.max(30, p.wordLimit - 20)} to ${p.wordLimit + 20} words).
- Target Audience & Voice: Written to the child's parents in the third person (referring to the child solely by first name: "${p.studentName} demonstrates...", "We are delighted by ${p.studentName}'s enthusiasm...").
- Tone: Warm, constructive, encouraging, age-appropriate for 6–12 year olds.

PEDAGOGICAL ASSESSMENT PILLARS:
${categoriesText}

ADDITIONAL TEACHER OBSERVATIONS & KEYWORDS:
- Strengths: ${strengthsStr}
- Challenges: ${weaknessesStr}
- Next Steps: ${goalsStr}
${refinementText}

EVALUATION WRITING GUIDELINES:
1. Standard Pedagogical Flow:
   - Opening: Acknowledge the student's presence and overall performance in ${p.subject}.
   - Core Body: Synthesize their academic comprehension, effort, participation, and social collaboration.
   - Growth & Next Steps: Constructively and warmly address areas for improvement and state the next-step recommendation.
   - Closing: An encouraging, forward-looking concluding sentence.
2. Natural, Flowing Prose: Do NOT mechanically list the categories or output bullet points. Blend the teacher's keywords and category levels into smooth, authentic, human sentences.
3. Constructive Framing: Frame challenges as opportunities for continued growth, maintaining dignity and encouragement.
4. Structural Completeness: You must provide a complete, well-rounded narrative that brings every thought and sentence to a proper, grammatical conclusion. Never stop abruptly or leave sentences incomplete.
5. Output Format: Return ONLY the final evaluation text. No greeting header ("Dear Parents,"), no title, no meta commentary, no quotation marks.
`.trim();
}

function cleanGeneratedText(text) {
  // Remove markdown code fences or quotation wrappers if returned
  return text
    .replace(/^```[a-z]*\n?/i, '')
    .replace(/\n?```$/i, '')
    .replace(/^"|"$/g, '')
    .trim();
}

// Local mock generator for testing without an API key
function generateLocalDemoEvaluation(p) {
  const firstName = p.studentName ? p.studentName.trim().split(/\s+/)[0] : 'The student';
  const subject = p.subject || 'Music';
  const wordTarget = p.wordLimit || 120;
  
  // Extract category chips if selected
  const categoryChips = [];
  if (p.categories) {
    Object.values(p.categories).forEach(cat => {
      if (cat?.chips && Array.isArray(cat.chips)) {
        categoryChips.push(...cat.chips);
      }
    });
  }

  const strengths = p.strengths && p.strengths.length > 0 
    ? p.strengths.join(' and ') 
    : (categoryChips.length > 0 ? categoryChips.slice(0, 2).join(' and ') : 'a strong sense of rhythm and musical curiosity');

  const growth = p.weaknesses && p.weaknesses.length > 0 
    ? p.weaknesses.join(' and ') 
    : 'reading musical notation and refining fine tempo transitions';

  const goals = p.goals && p.goals.length > 0 
    ? p.goals.join(', ') 
    : 'practicing rhythm patterns and singing with confidence in small ensembles';

  const sample = `${firstName} has had a joyful and productive term in ${subject}. Demonstrating an admirable appreciation for musical activities, ${firstName} consistently participates with ${strengths}. During ensemble playing and class singing, ${firstName} is a thoughtful and respectful listener who collaborates cooperatively with peers. While making steady progress throughout the semester, continuing to work on ${growth} will help ${firstName} build even greater musical independence. For the upcoming term, ${firstName} is encouraged to focus on ${goals}. With this positive attitude and dedication, ${firstName} is well positioned for continued musical growth and enjoyment.`;

  const words = sample.split(/\s+/);
  if (words.length > wordTarget + 10) {
    return words.slice(0, wordTarget).join(' ') + '.';
  }
  return sample;
}
