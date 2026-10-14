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

// Initialize GoogleGenAI server-side with telemetry header
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

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(geminiApiKey),
    timestamp: new Date().toISOString(),
  });
});

// Helper for calling Gemini safely
async function callGemini(systemPrompt: string, userPrompt: string, responseJson = false): Promise<string> {
  if (!ai) {
    throw new Error('Gemini API key is not configured on the server.');
  }

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

// 1. AI Chief of Staff Companion Chat
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { message, context, chatHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'AI is running in offline mode. Please configure GEMINI_API_KEY in server secrets.',
      });
    }

    const systemPrompt = `You are DayFlow AI — a high-caliber Personal Chief of Staff and Intelligent Operating System for an ambitious technical specialist and builder.
Your tone is articulate, realistic, calm, and proactive.
You never invent external commitments, manager instructions, or pretend meetings exist that aren't provided.
You prioritize protected rest, cognitive focus, realistic durations, and avoiding burn-out.
When suggesting or modifying tasks, format them cleanly with title, duration, category, and priority.

User Context:
${JSON.stringify(context, null, 2)}

Provide actionable, empathetic, and sharp guidance. If the user asks to create, modify, or plan tasks, offer concrete steps and structured recommendations.`;

    const contents = [
      ...chatHistory.map((h: { role: string; content: string }) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.5,
      },
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate AI response' });
  }
});

// 2. Generate Daily Briefing
app.post('/api/gemini/briefing', async (req: Request, res: Response) => {
  try {
    const { context } = req.body;
    if (!ai) {
      return res.status(503).json({ error: 'AI unavailable' });
    }

    const systemPrompt = `You are DayFlow AI Chief of Staff. Generate a crisp, motivating, 3-4 sentence morning briefing for the user based on their today's schedule, deadlines, and active goals.
Highlight:
1. The top 1-2 core priorities today.
2. The key fixed time block to protect.
3. A tip for energy or pacing.
Keep it strictly under 85 words. No fluff. Plain text with conversational flow.`;

    const userPrompt = `Context: ${JSON.stringify(context)}`;
    const briefing = await callGemini(systemPrompt, userPrompt, false);
    res.json({ briefing: briefing.trim() });
  } catch (error: any) {
    console.error('Briefing error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Replan Day / Smart Schedule Optimizer
app.post('/api/gemini/replan', async (req: Request, res: Response) => {
  try {
    const { tasks, commitments, workHours, energyLevel } = req.body;
    if (!ai) {
      return res.status(503).json({ error: 'AI unavailable' });
    }

    const systemPrompt = `You are the DayFlow Schedule Optimizer. Analyze the user's available time between fixed commitments and propose a realistic timeline of tasks for the rest of today.
Rules:
- Respect fixed commitments (do NOT overlap).
- Insert 10-15 minute buffers or meal breaks.
- Match task durations realistically.
- Return ONLY valid JSON array with objects:
  {
    "taskId": string,
    "title": string,
    "startTime": "HH:MM",
    "endTime": "HH:MM",
    "reason": string
  }`;

    const userPrompt = JSON.stringify({ tasks, commitments, workHours, energyLevel });
    const raw = await callGemini(systemPrompt, userPrompt, true);
    let plan = [];
    try {
      plan = JSON.parse(raw);
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
app.post('/api/gemini/breakdown', async (req: Request, res: Response) => {
  try {
    const { goalTitle, goalDescription, category, availableTimeMinutes } = req.body;
    if (!ai) {
      return res.status(503).json({ error: 'AI unavailable' });
    }

    const systemPrompt = `You are DayFlow AI Execution Architect. Decompose the given goal or project into 3 to 6 practical, self-contained, high-momentum micro-tasks.
Return JSON array of tasks:
[
  {
    "title": string,
    "description": string,
    "estimatedMinutes": number (between 15 and 90),
    "priority": "low" | "normal" | "high" | "critical",
    "isIndependent": boolean
  }
]`;

    const userPrompt = JSON.stringify({ goalTitle, goalDescription, category, availableTimeMinutes });
    const raw = await callGemini(systemPrompt, userPrompt, true);
    const tasks = JSON.parse(raw);
    res.json({ tasks });
  } catch (error: any) {
    console.error('Breakdown error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 5. Notes to Structured Tasks
app.post('/api/gemini/notes-to-tasks', async (req: Request, res: Response) => {
  try {
    const { rawNotes } = req.body;
    if (!ai) {
      return res.status(503).json({ error: 'AI unavailable' });
    }

    const systemPrompt = `Extract clear, actionable tasks from the provided unstructured notes or meeting transcripts.
Return JSON array:
[
  {
    "title": string,
    "description": string,
    "category": string (e.g. "Work and Career", "AI Research and Experiments", "Software Development", "Personal Administration", "Learning and Study"),
    "estimatedMinutes": number,
    "priority": "normal" | "high" | "critical"
  }
]`;

    const raw = await callGemini(systemPrompt, rawNotes, true);
    const tasks = JSON.parse(raw);
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
      body: JSON.stringify(samplePayload || { event: 'dayflow.ping', timestamp: new Date().toISOString() }),
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
    console.log(`DayFlow AI Server listening on port ${PORT}`);
  });
}

start();
