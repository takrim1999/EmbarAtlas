import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getDb } from '../db.js';

const router = Router();

const SYSTEM_PROMPT = `You are Ember Atlas Super Intelligence (SI), a specialized research analyst for NASA microgravity combustion and fire safety research. Your role is to help aerospace researchers, engineers, and students understand NASA's fire safety experiments conducted in microgravity.

CRITICAL RULES:
1. ONLY answer based on the provided investigation data and evidence. Never invent experimental results, conditions, or findings.
2. ALWAYS cite sources using investigation IDs (e.g., [PSI-69], [PSI-25], [PSI-98], [PSI-102]).
3. CLEARLY distinguish between:
   - Investigation OBJECTIVES (what they aimed to study)
   - METHODS/APPROACH (how they studied it)
   - OBSERVED FINDINGS (actual results, if available in the data)
   - LIMITATIONS (what the data cannot tell us)
4. When asked about fire safety for lunar/Mars habitats, connect to relevant investigations but note that microgravity data does not directly validate predictions for partial gravity.
5. When evidence is insufficient, say so explicitly.
6. Use proper scientific terminology but explain concepts clearly.
7. Format responses with markdown for readability.
8. Mention specific experimental conditions (O₂ concentration, pressure, fuel type) when relevant.
9. Note that increased oxygen concentration (expected 30%+ on Moon) significantly increases flammability compared to Earth's ~21%.
10. Reference hardware relationships (CIR, MDCA, MSG) when comparing experiments.

You are helping users navigate a complex body of research to support safer human space exploration.`;

// Multi-tier model cascades
const CHAT_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite-preview', 'gemma-4-31b-it'];
const REASONING_MODELS = ['gemma-4-31b-it', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite-preview'];

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_STUDIO_API;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }
  return new GoogleGenerativeAI(apiKey);
}

async function executeModelCascade({ models, systemInstruction, prompt, chatHistory, message }) {
  const genAI = getGenAI();
  let lastError = null;

  for (const modelName of models) {
    try {
      console.log(`🤖 Attempting Super Intelligence (SI) execution with: ${modelName}`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction,
      });

      if (chatHistory) {
        const chat = model.startChat({ history: chatHistory });
        const result = await chat.sendMessage(message);
        return { text: result.response.text(), modelUsed: modelName };
      } else {
        const result = await model.generateContent(prompt);
        return { text: result.response.text(), modelUsed: modelName };
      }
    } catch (err) {
      console.warn(`⚠️ Model ${modelName} failed or unavailable (${err.message}). Cascading to next model...`);
      lastError = err;
    }
  }

  throw lastError || new Error('All Super Intelligence (SI) models in cascade failed');
}

function getInvestigationContext(investigationIds) {
  const db = getDb();
  let investigations;
  
  if (investigationIds && investigationIds.length > 0) {
    const placeholders = investigationIds.map(() => '?').join(',');
    investigations = db.prepare(
      `SELECT * FROM investigations WHERE id IN (${placeholders})`
    ).all(...investigationIds);
  } else {
    investigations = db.prepare('SELECT * FROM investigations').all();
  }
  
  return investigations.map(inv => {
    const data = db.prepare(
      'SELECT * FROM experimental_data WHERE investigation_id = ? LIMIT 10'
    ).all(inv.id);
    
    return `
### ${inv.name} (${inv.id})
**Title:** ${inv.title}
**Topic:** ${inv.topic}
**Fuel Type:** ${inv.fuel_type}
**Summary:** ${inv.summary}
**Objectives:** ${inv.objectives || 'Not specified'}
**Approach:** ${inv.approach || 'Not specified'}
**Conditions:** ${inv.conditions || 'Not specified'}
**Measurements:** ${inv.measurements || 'Not specified'}
**Hardware:** ${inv.hardware || 'Not specified'}
**Facility:** ${inv.facility || 'Not specified'}
**Gravity Regime:** ${inv.gravity_regime}
**Limitations:** ${inv.limitations || 'Not specified'}
**Safety Relevance Score:** ${inv.safety_relevance_score}/10
**Earth Applications:** ${inv.earthApplications || 'Not specified'}
**Source:** ${inv.url}
${data.length > 0 ? `**Sample Data (${data.length} rows):**\n${JSON.stringify(data.slice(0, 5), null, 2)}` : ''}
`;
  }).join('\n---\n');
}

router.post('/chat', async (req, res) => {
  try {
    const { message, sessionId, investigationIds } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const context = getInvestigationContext(investigationIds);
    
    // Get conversation history
    const db = getDb();
    const history = sessionId
      ? db.prepare(
          'SELECT role, content FROM ai_conversations WHERE session_id = ? ORDER BY created_at ASC LIMIT 20'
        ).all(sessionId)
      : [];
    
    const conversationHistory = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));
    
    const messageWithEvidence = conversationHistory.length === 0
      ? `## Investigation Evidence:\n${context}\n\n## User Question:\n${message}`
      : message;

    const { text: response, modelUsed } = await executeModelCascade({
      models: CHAT_MODELS,
      systemInstruction: SYSTEM_PROMPT,
      chatHistory: conversationHistory,
      message: messageWithEvidence,
    });
    
    // Extract cited investigation IDs from response
    const potentialIds = [...new Set(
      (response.match(/\[([A-Za-z0-9_-]+)\]/g) || []).map(m => m.slice(1, -1))
    )];
    const validIds = potentialIds.filter(id => {
      const match = db.prepare('SELECT id FROM investigations WHERE id = ?').get(id);
      return !!match;
    });
    
    // Save conversation
    const sid = sessionId || `session-${Date.now()}`;
    const insertStmt = db.prepare(
      'INSERT INTO ai_conversations (session_id, role, content, sources) VALUES (?, ?, ?, ?)'
    );
    insertStmt.run(sid, 'user', message, null);
    insertStmt.run(sid, 'assistant', response, JSON.stringify(validIds));
    
    res.json({
      response,
      sessionId: sid,
      citedInvestigations: validIds,
      modelUsed,
    });
  } catch (error) {
    console.error('Super Intelligence (SI) chat error:', error);
    if (error.message?.includes('API_KEY')) {
      return res.status(500).json({ 
        error: 'SI service not configured. Please set GEMINI_API_KEY in .env file.',
        response: 'I\'m unable to process your question right now because the SI service is not configured. Please ensure a valid Gemini API key is set in the server configuration.'
      });
    }
    res.status(500).json({ error: 'SI service error', details: error.message });
  }
});

router.post('/summarize', async (req, res) => {
  try {
    const { investigationIds } = req.body;
    
    if (!investigationIds || investigationIds.length === 0) {
      return res.status(400).json({ error: 'At least one investigation ID is required' });
    }
    
    const context = getInvestigationContext(investigationIds);
    
    const prompt = investigationIds.length === 1
      ? `Based on the following investigation data, provide a comprehensive research brief. Include: objectives, methodology, key conditions studied, measurements taken, limitations, and relevance to fire safety in space exploration. Be specific about experimental conditions.\n\n${context}`
      : `Compare the following ${investigationIds.length} investigations. Create a structured comparison covering: objectives, fuel types, experimental conditions, measurements, hardware used, and limitations. Highlight both similarities and important differences. Note any complementary findings.\n\n${context}`;
    
    // Use REASONING_MODELS cascade (Gemma 4 31B first for deep reasoning)
    const { text: summary, modelUsed } = await executeModelCascade({
      models: REASONING_MODELS,
      systemInstruction: SYSTEM_PROMPT,
      prompt,
    });
    
    res.json({
      summary,
      investigationIds,
      modelUsed,
    });
  } catch (error) {
    console.error('Super Intelligence (SI) summarize error:', error);
    res.status(500).json({ error: 'Failed to generate summary: ' + error.message });
  }
});

router.post('/insights', async (req, res) => {
  try {
    const { focus } = req.body; // 'lunar', 'mars', 'spacecraft', 'general'
    
    const context = getInvestigationContext();
    
    const focusPrompts = {
      lunar: 'Focus on fire safety implications for lunar habitats and pressurized rovers. Consider the expected 30%+ oxygen concentration at 10.2 psi or less. Note the absence of partial-gravity combustion data.',
      mars: 'Focus on fire safety implications for Mars missions and habitats. Consider extended mission duration and communication delays.',
      spacecraft: 'Focus on fire safety for spacecraft and space stations. Consider ventilation, material selection, and crew response capabilities.',
      general: 'Provide a comprehensive overview of fire safety insights from all available investigations.',
    };
    
    const prompt = `Based on all available NASA microgravity combustion research, generate key fire safety insights. ${focusPrompts[focus] || focusPrompts.general}

Structure your response as:
1. **Critical Findings** — Most important evidence-based insights
2. **Knowledge Gaps** — What we still don't know
3. **Recommendations** — Evidence-based suggestions for fire safety
4. **Research Priorities** — What should be studied next

Ground every insight in specific investigation data with citations.

${context}`;
    
    // Use REASONING_MODELS cascade (Gemma 4 31B first for deep reasoning)
    const { text: insights, modelUsed } = await executeModelCascade({
      models: REASONING_MODELS,
      systemInstruction: SYSTEM_PROMPT,
      prompt,
    });
    
    res.json({
      insights,
      focus: focus || 'general',
      modelUsed,
    });
  } catch (error) {
    console.error('Super Intelligence (SI) insights error:', error);
    res.status(500).json({ error: 'Failed to generate insights: ' + error.message });
  }
});

export default router;
