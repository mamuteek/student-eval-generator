/**
 * Multi-Provider LLM Service for Student Evaluation Generation
 * Supports Google Gemini (v3 & v3.8), Groq (LPU Free Tier), and OpenRouter (Auto Free Router)
 */

export const LLM_PROVIDERS = [
  {
    id: 'gemini',
    name: 'Google Gemini (AI Studio)',
    badge: 'Official Google Free Tier',
    keyHelpUrl: 'https://aistudio.google.com/app/apikey',
    keyPlaceholder: 'AIzaSy...',
    helpText: 'Free tier key from Google AI Studio.',
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
    helpText: '100% free API key instantly at console.groq.com (no credit card required). Active free model with 14,400 requests/day.',
    models: [
      { id: 'llama-3.1-8b-instant', name: 'Meta Llama 3.1 8B Instant (Active Free Tier)', desc: '100% active free tier on Groq, ultra-fast 560+ tokens/sec' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B (32K Context)', desc: 'High-quality open mixture-of-experts model' },
      { id: 'gemma2-9b-it', name: 'Google Gemma 2 9B IT', desc: 'Crisp and reliable student evaluation narrative' },
    ]
  },
  {
    id: 'openrouter',
    name: 'OpenRouter (Free Models)',
    badge: 'Auto Free Router',
    keyHelpUrl: 'https://openrouter.ai/keys',
    keyPlaceholder: 'sk-or-v1-...',
    helpText: 'Free API key at openrouter.ai/keys (no credit card required). Uses openrouter/free to automatically route to active free models.',
    models: [
      { id: 'openrouter/free', name: 'OpenRouter Auto Free (Recommended)', desc: 'Intelligently routes to currently active free open models ($0.00)' },
      { id: 'google/gemma-4-31b-it:free', name: 'Google Gemma 4 31B (Free)', desc: 'High capability open model hosted for free' },
      { id: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free', name: 'NVIDIA Nemotron Reasoning (Free)', desc: 'NVIDIA reasoning open model' },
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
    gender = 'Female',
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
    gender,
    subject: 'Music',
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

  // Sanitize model selections in case old deprecated IDs were saved in localStorage
  let activeModel = model;
  if (provider === 'groq') {
    if (!activeModel || activeModel === 'llama-3.3-70b-versatile') {
      activeModel = 'llama-3.1-8b-instant';
    }
  } else if (provider === 'openrouter') {
    if (!activeModel || activeModel.includes('llama-3.3-70b-instruct')) {
      activeModel = 'openrouter/free';
    }
  }

  if (provider === 'groq') {
    return callOpenAICompatibleAPI({
      endpoint: 'https://api.groq.com/openai/v1/chat/completions',
      apiKey,
      model: activeModel,
      prompt,
      signal
    });
  } else if (provider === 'openrouter') {
    return callOpenAICompatibleAPI({
      endpoint: 'https://openrouter.ai/api/v1/chat/completions',
      apiKey,
      model: activeModel,
      prompt,
      signal,
      extraHeaders: {
        'HTTP-Referer': 'https://mamuteek.github.io/student-eval-generator/',
        'X-Title': "Mamut's Student Evaluator"
      }
    });
  } else {
    // Default: Google Gemini
    return callGeminiAPI({ apiKey, model: activeModel || 'gemini-3.8-flash', prompt, signal });
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
  const isMale = (p.gender || '').toLowerCase() === 'male';
  const pronouns = isMale ? 'he / him / his / himself' : 'she / her / hers / herself';
  const subjectPronoun = isMale ? 'he' : 'she';
  const possessivePronoun = isMale ? 'his' : 'her';

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
- Student Gender: ${p.gender || 'Female'} (CRITICAL GRAMMAR RULE: Use ${pronouns} pronouns strictly throughout the evaluation. For example: "${p.studentName} showed great enthusiasm when ${subjectPronoun} practiced...", "in ${possessivePronoun} ensemble work...").
- Subject: Music (Music education, singing, rhythm, listening, instruments, and ensemble activities for kids aged 6–12).
- Overall Academic Grade: ${p.grade} on a 1.0 to 5.0 scale (where 1.0 is the best / highest mark like Czech 'výborný', and 5.0 is failing / lowest mark)
- Desired Length: Approximately ${p.wordLimit} words (Strict constraint: stay within ${Math.max(30, p.wordLimit - 20)} to ${p.wordLimit + 20} words).
- Target Audience & Voice: Written to the child's parents in the third person (referring to the child by first name and using accurate ${p.gender || 'Female'} pronouns).
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
   - Opening: Acknowledge the student's presence and overall performance in Music class.
   - Core Body: Synthesize their musical comprehension, effort, participation, and social collaboration.
   - Growth & Next Steps: Constructively and warmly address areas for improvement and state the next-step recommendation.
   - Closing: An encouraging, forward-looking concluding sentence.
2. Natural, Flowing Prose: Do NOT mechanically list the categories or output bullet points. Blend the teacher's keywords and category levels into smooth, authentic, human sentences.
3. Pronoun and Grammar Accuracy: Maintain strict consistency with the student's gender (${p.gender || 'Female'}). Use only ${pronouns}.
4. Constructive Framing: Frame challenges as opportunities for continued growth, maintaining dignity and encouragement.
5. Structural Completeness: You must provide a complete, well-rounded narrative that brings every thought and sentence to a proper, grammatical conclusion. Never stop abruptly or leave sentences incomplete.
6. Output Format: Return ONLY the final evaluation text. No greeting header ("Dear Parents,"), no title, no meta commentary, no quotation marks.
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
  const wordTarget = p.wordLimit || 120;
  const isMale = (p.gender || '').toLowerCase() === 'male';
  const subjPronoun = isMale ? 'he' : 'she';
  const subjPronounCap = isMale ? 'He' : 'She';
  const objPronoun = isMale ? 'him' : 'her';
  const possPronoun = isMale ? 'his' : 'her';

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

  const sample = `${firstName} has had a joyful and productive term in Music. Demonstrating an admirable appreciation for musical activities, ${subjPronoun} consistently participates with ${strengths}. During ensemble playing and class singing, ${firstName} is a thoughtful and respectful listener who collaborates cooperatively with ${possPronoun} peers. While making steady progress throughout the semester, continuing to work on ${growth} will help ${objPronoun} build even greater musical independence. For the upcoming term, ${firstName} is encouraged to focus on ${goals}. With ${possPronoun} positive attitude and dedication, ${subjPronoun} is well positioned for continued musical growth and enjoyment.`;

  const words = sample.split(/\s+/);
  if (words.length > wordTarget + 10) {
    return words.slice(0, wordTarget).join(' ') + '.';
  }
  return sample;
}
