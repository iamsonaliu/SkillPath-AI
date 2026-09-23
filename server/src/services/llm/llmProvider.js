import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { config } from '../../config/env.js';

class LLMProvider {
  constructor() {
    this.provider = config.llmProvider.toLowerCase();

    if (config.geminiApiKey) {
      const genAI = new GoogleGenerativeAI(config.geminiApiKey);
      this.geminiModel = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' },
      });
    }

    if (config.groqApiKey) {
      this.groqClient = new Groq({ apiKey: config.groqApiKey });
    }
  }

  cleanJsonString(raw) {
    if (!raw) return '';
    let cleaned = raw.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/i, '').replace(/\s*```$/, '');
    }
    return cleaned.trim();
  }

  async generateStructuredJSON(prompt, fallbackMockFn) {
    // 1. Try Gemini if configured
    if (this.provider === 'gemini' && this.geminiModel) {
      try {
        const result = await this.geminiModel.generateContent(prompt);
        const text = result.response.text();
        return JSON.parse(this.cleanJsonString(text));
      } catch (err) {
        console.warn(`[LLMProvider] Gemini error: ${err.message}. Falling back...`);
      }
    }

    // 2. Try Groq if configured
    if ((this.provider === 'groq' || !this.geminiModel) && this.groqClient) {
      try {
        const completion = await this.groqClient.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are an expert curriculum architect. Always respond in valid raw JSON with no commentary.',
            },
            { role: 'user', content: prompt },
          ],
          model: 'llama-3.3-70b-versatile',
          response_format: { type: 'json_object' },
        });
        const text = completion.choices[0]?.message?.content || '{}';
        return JSON.parse(this.cleanJsonString(text));
      } catch (err) {
        console.warn(`[LLMProvider] Groq error: ${err.message}. Falling back...`);
      }
    }

    // 3. High-Fidelity Mock Fallback (Guaranteed to satisfy schema and ensure PR-1 demo resilience)
    console.info(`[LLMProvider] Serving deterministic fallback for offline/development resilience.`);
    return fallbackMockFn();
  }
}

export const llmProvider = new LLMProvider();
