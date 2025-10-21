import dotenv from 'dotenv';
dotenv.config();

class OllamaService {
  constructor() {
    this.apiUrl = process.env.OLLAMA_API_URL || 'http://127.0.0.1:11434/api/generate';
    this.model = process.env.OLLAMA_MODEL || 'gemma3n:e4b';
    console.log('🤖 Ollama Config:', {
      apiUrl: this.apiUrl,
      model: this.model
    });
  }

  async testConnection() {
    try {
      const baseUrl = this.apiUrl.replace('/api/generate', '');
      const response = await fetch(`${baseUrl}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Ollama connected. Available models:', data.models?.map(m => m.name));
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Ollama connection failed:', error.message);
      return false;
    }
  }

  async generateSummary(entries, month, year) {
    const prompt = this.buildPrompt(entries, month, year);
    
    console.log('🤖 Calling Ollama API...');
    console.log('📍 URL:', this.apiUrl);
    console.log('🧠 Model:', this.model);
    
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Ollama API error response:', errorText);
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Ollama response received');
      return this.parseSummary(data.response);
    } catch (error) {
      console.error('❌ Error calling Ollama API:', error);
      
      // Return a friendly fallback
      if (error.cause?.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to Ollama. Please make sure Ollama is running (ollama serve)');
      }
      throw error;
    }
  }

  buildPrompt(entries, month, year) {
    const entriesText = entries.map(e => 
      `Date: ${e.date}\n${e.content}`
    ).join('\n\n---\n\n');

    return `Analyze the following journal entries from ${month} ${year} and provide a summary of positives and negatives.

Entries:
${entriesText}

Summarize concisely in this exact JSON format only — no extra text:

{
  "positives": ["...", "..."],
  "negatives": ["...", "..."]
}

Guidelines:
- Extract short, specific, factual points per category.
- Be emotionally insightful but not repetitive or speculative.
- Focus only on what clearly appears in the entry.
- If no clear positives exist, leave "positives": [].
- If no clear negatives exist, leave "negatives": [].
- Use minimal, clear language (max ~12 words per point).
- Do not infer or balance emotions — reflect only what’s written.`;
  }

  parseSummary(response) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          positives: parsed.positives || [],
          negatives: parsed.negatives || []
        };
      }
      
      // Fallback: manual parsing
      return this.manualParse(response);
    } catch (error) {
      console.error('Error parsing Ollama response:', error);
      return this.manualParse(response);
    }
  }

  manualParse(response) {
    const positives = [];
    const negatives = [];
    
    const lines = response.split('\n');
    let currentSection = null;
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.toLowerCase().includes('positive')) {
        currentSection = 'positives';
      } else if (trimmed.toLowerCase().includes('negative')) {
        currentSection = 'negatives';
      } else if (trimmed && (trimmed.startsWith('-') || trimmed.startsWith('•') || /^\d+\./.test(trimmed))) {
        const point = trimmed.replace(/^[-•\d.]\s*/, '').trim();
        if (point && currentSection === 'positives') {
          positives.push(point);
        } else if (point && currentSection === 'negatives') {
          negatives.push(point);
        }
      }
    }
    
    return { positives, negatives };
  }
}

export default new OllamaService();