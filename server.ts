import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Groq / Grok API Key from environment variables (never hardcode in tracked files)
const groqApiKey =
  process.env.GROQ_API_KEY ||
  process.env.GROK_API_KEY ||
  '';

// Gemini API Key (optional fallback)
const geminiApiKey = process.env.GEMINI_API_KEY;
const ai = geminiApiKey
  ? new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Available Groq models in order of capability
const GROQ_PRIMARY_MODEL = 'openai/gpt-oss-120b';
const GROQ_FALLBACK_MODELS = ['qwen/qwen3.8-27b', 'openai/gpt-oss-20b'];

/**
 * Universal AI Caller: Executes via Groq (with model fallback) or Gemini
 */
async function callAI(
  systemPrompt: string,
  userPrompt: string,
  options: {
    responseJson?: boolean;
    chatHistory?: Array<{ role: string; content: string }>;
  } = {}
): Promise<string> {
  const { responseJson = false, chatHistory = [] } = options;

  // 1. Try Groq API first if key is available
  if (groqApiKey) {
    const modelsToTry = [GROQ_PRIMARY_MODEL, ...GROQ_FALLBACK_MODELS];

    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.map((h) => ({
        role: h.role === 'model' || h.role === 'assistant' ? 'assistant' : 'user',
        content: h.content,
      })),
      { role: 'user', content: userPrompt },
    ];

    for (const model of modelsToTry) {
      try {
        const bodyPayload: any = {
          model,
          messages,
          temperature: 0.4,
        };

        if (responseJson) {
          bodyPayload.response_format = { type: 'json_object' };
        }

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bodyPayload),
        });

        if (!res.ok) {
          const errText = await res.text();
          console.warn(`Groq model ${model} failed (${res.status}): ${errText}`);
          continue; // Try next fallback model
        }

        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          return content;
        }
      } catch (err: any) {
        console.warn(`Groq request with ${model} error:`, err.message);
      }
    }
  }

  // 2. Fallback to Gemini if configured
  if (ai) {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.4,
        responseMimeType: responseJson ? 'application/json' : 'text/plain',
      },
    });

    return response.text || '';
  }

  throw new Error('No AI service (Groq or Gemini) is currently available.');
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  const activeProvider = groqApiKey ? 'groq' : geminiApiKey ? 'gemini' : 'none';
  res.json({
    status: 'ok',
    provider: activeProvider,
    model: groqApiKey ? GROQ_PRIMARY_MODEL : 'gemini-3.8-flash',
    hasKey: Boolean(groqApiKey || geminiApiKey),
    hasGroqKey: Boolean(groqApiKey),
    hasGeminiKey: Boolean(geminiApiKey),
    timestamp: new Date().toISOString(),
  });
});

// 1. AI Chief of Staff Companion Chat
app.post(['/api/gemini/chat', '/api/ai/chat'], async (req: Request, res: Response) => {
  try {
    const { message, context, chatHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemPrompt = `You are DayFlow AI — a high-caliber Personal Chief of Staff and Intelligent Operating System for an ambitious technical specialist and builder.
Your tone is articulate, realistic, calm, and proactive.
You never invent external commitments, manager instructions, or pretend meetings exist that aren't provided.
You prioritize protected rest, cognitive focus, realistic durations, and avoiding burn-out.
When suggesting or modifying tasks, format them cleanly with title, duration, category, and priority.

User Current Context:
${JSON.stringify(context, null, 2)}

Provide actionable, empathetic, and sharp guidance. If the user asks to create, modify, or plan tasks, offer concrete steps and structured recommendations.`;

    const reply = await callAI(systemPrompt, message, {
      chatHistory,
      responseJson: false,
    });

    res.json({ reply });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate AI response' });
  }
});

// 2. Generate Daily Briefing
app.post(['/api/gemini/briefing', '/api/ai/briefing'], async (req: Request, res: Response) => {
  try {
    const { context } = req.body;

    const systemPrompt = `You are DayFlow AI Chief of Staff. Generate a crisp, motivating, 3-4 sentence morning briefing for the user based on their schedule, deadlines, and active goals.
Highlight:
1. The top core priorities today (or encourage adding first tasks if empty).
2. The key fixed time block or deep work window to protect.
3. A tip for energy or pacing.
Keep it strictly under 85 words. No fluff. Plain text with conversational flow.`;

    const userPrompt = `Current User Context: ${JSON.stringify(context)}`;
    const briefing = await callAI(systemPrompt, userPrompt, { responseJson: false });
    res.json({ briefing: briefing.trim() });
  } catch (error: any) {
    console.error('Briefing error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Replan Day / Smart Schedule Optimizer
app.post(['/api/gemini/replan', '/api/ai/replan'], async (req: Request, res: Response) => {
  try {
    const { tasks, commitments, workHours, energyLevel } = req.body;

    const systemPrompt = `You are the DayFlow Schedule Optimizer. Analyze the user's available time between fixed commitments and propose a realistic timeline of tasks for today.
Rules:
- Respect fixed commitments (do NOT overlap).
- Insert 10-15 minute buffers or meal breaks.
- Match task durations realistically.
- Return ONLY a valid JSON object with a "plan" array containing objects with:
  {
    "taskId": string,
    "title": string,
    "startTime": "HH:MM",
    "endTime": "HH:MM",
    "reason": string
  }`;

    const userPrompt = JSON.stringify({ tasks, commitments, workHours, energyLevel });
    const raw = await callAI(systemPrompt, userPrompt, { responseJson: true });

    let plan = [];
    try {
      const parsed = JSON.parse(raw);
      plan = Array.isArray(parsed) ? parsed : parsed.plan || [];
    } catch {
      plan = [];
    }
    res.json({ plan });
  } catch (error: any) {
    console.error('Replan error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Breakdown Goal / Project into Tasks
app.post(['/api/gemini/breakdown', '/api/ai/breakdown'], async (req: Request, res: Response) => {
  try {
    const { goalTitle, goalDescription, category, availableTimeMinutes } = req.body;

    const systemPrompt = `You are DayFlow AI Execution Architect. Decompose the given goal or project into 3 to 6 practical, self-contained, high-momentum micro-tasks.
Return a valid JSON object with a "tasks" array:
{
  "tasks": [
    {
      "title": string,
      "description": string,
      "estimatedMinutes": number (between 15 and 90),
      "priority": "low" | "normal" | "high" | "critical",
      "isIndependent": boolean
    }
  ]
}`;

    const userPrompt = JSON.stringify({
      goalTitle,
      goalDescription,
      category,
      availableTimeMinutes,
    });

    const raw = await callAI(systemPrompt, userPrompt, { responseJson: true });
    let tasks = [];
    try {
      const parsed = JSON.parse(raw);
      tasks = Array.isArray(parsed) ? parsed : parsed.tasks || [];
    } catch {
      tasks = [];
    }

    res.json({ tasks });
  } catch (error: any) {
    console.error('Breakdown error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 5. Notes to Structured Tasks
app.post(['/api/gemini/notes-to-tasks', '/api/ai/notes-to-tasks'], async (req: Request, res: Response) => {
  try {
    const { rawNotes } = req.body;

    const systemPrompt = `Extract clear, actionable tasks from the provided unstructured notes or meeting transcripts.
Return a valid JSON object with a "tasks" array:
{
  "tasks": [
    {
      "title": string,
      "description": string,
      "category": string (e.g. "Work & Career", "AI Research & Experiments", "Software Development", "Personal Admin", "Learning"),
      "estimatedMinutes": number,
      "priority": "normal" | "high" | "critical"
    }
  ]
}`;

    const raw = await callAI(systemPrompt, rawNotes, { responseJson: true });
    let tasks = [];
    try {
      const parsed = JSON.parse(raw);
      tasks = Array.isArray(parsed) ? parsed : parsed.tasks || [];
    } catch {
      tasks = [];
    }

    res.json({ tasks });
  } catch (error: any) {
    console.error('Notes to tasks error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 6. Test n8n Webhook connection
app.post('/api/n8n/webhook-test', async (req: Request, res: Response) => {
  try {
    const { webhookUrl, apiKey, samplePayload } = req.body;
    if (!webhookUrl) {
      return res.status(400).json({ error: 'Webhook URL is required' });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'DayFlow-AI-OS/1.0',
    };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const testResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(
        samplePayload || { event: 'dayflow.ping', timestamp: new Date().toISOString() }
      ),
    });

    res.json({
      success: testResponse.ok,
      status: testResponse.status,
      statusText: testResponse.statusText,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to dispatch to n8n webhook',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function start() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DayFlow AI Server listening on port ${PORT} with Groq AI active`);
  });
}

start();
