import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface ChannelContext {
  name: string;
  niche: string;
  targetAudience: string;
  tone: string;
}

@Injectable()
export class OpenAiService {
  private client: OpenAI;
  private model: string;

  constructor(private config: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.config.get<string>('OPENAI_API_KEY', ''),
    });
    this.model = this.config.get<string>('OPENAI_MODEL', 'gpt-4o-mini');
  }

  private async chat(system: string, user: string): Promise<string> {
    if (!this.config.get('OPENAI_API_KEY')) {
      return this.fallbackResponse(user);
    }

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.8,
    });

    return response.choices[0]?.message?.content || '';
  }

  async researchTrends(ctx: ChannelContext, query?: string) {
    const system = `You are a viral content trend researcher for faceless YouTube Shorts and TikTok channels targeting ${ctx.targetAudience} viewers. Respond in JSON format only.`;
    const user = `Research current trends for a ${ctx.niche} channel called "${ctx.name}".
${query ? `Focus on: ${query}` : ''}
Return JSON: { "trends": [{ "topic": "", "virality": 1-100, "reason": "", "hashtags": [] }], "summary": "", "recommendations": [""] }`;

    const raw = await this.chat(system, user);
    try {
      const parsed = JSON.parse(this.extractJson(raw));
      return parsed;
    } catch {
      return {
        trends: [
          { topic: `${ctx.niche} facts that blow minds`, virality: 85, reason: 'High curiosity gap', hashtags: ['#shorts', '#facts'] },
          { topic: `Things Americans don't know about ${ctx.niche}`, virality: 78, reason: 'Geo-targeted hook', hashtags: ['#usa', '#didyouknow'] },
        ],
        summary: raw.slice(0, 500),
        recommendations: ['Post between 6-9 PM EST', 'Use pattern interrupts every 3 seconds', 'Lead with a controversial statement'],
      };
    }
  }

  async generateCalendar(ctx: ChannelContext, days = 30) {
    const system = `You are a content calendar strategist for faceless short-form video channels targeting ${ctx.targetAudience}. Respond in JSON only.`;
    const user = `Create a ${days}-day content calendar for "${ctx.name}" in the ${ctx.niche} niche.
Tone: ${ctx.tone}. Format for YouTube Shorts and TikTok (under 60 seconds).
Return JSON: { "entries": [{ "day": 1, "title": "", "topic": "", "angle": "", "bestTime": "HH:MM EST" }] }`;

    const raw = await this.chat(system, user);
    try {
      return JSON.parse(this.extractJson(raw));
    } catch {
      return {
        entries: Array.from({ length: days }, (_, i) => ({
          day: i + 1,
          title: `${ctx.niche} Secret #${i + 1} Americans Need to Know`,
          topic: `${ctx.niche} tips for US audience`,
          angle: 'Curiosity-driven hook with fast payoff',
          bestTime: '18:00 EST',
        })),
      };
    }
  }

  async generateHook(ctx: ChannelContext, topic: string) {
    const system = `You write viral hooks for faceless YouTube Shorts and TikTok targeting ${ctx.targetAudience}. ${ctx.tone} tone.`;
    const user = `Write 5 scroll-stopping hooks (under 15 words each) for: "${topic}" in ${ctx.niche} niche.
Return JSON: { "hooks": [{ "text": "", "style": "", "score": 1-100 }] }`;

    const raw = await this.chat(system, user);
    try {
      return JSON.parse(this.extractJson(raw));
    } catch {
      return {
        hooks: [
          { text: `Nobody talks about this ${ctx.niche} trick`, style: 'curiosity', score: 88 },
          { text: `Americans are doing ${ctx.niche} completely wrong`, style: 'controversy', score: 85 },
          { text: `I tried this for 30 days and...`, style: 'story', score: 82 },
        ],
      };
    }
  }

  async generateScript(ctx: ChannelContext, topic: string, hook: string) {
    const system = `You write 45-60 second faceless video scripts for YouTube Shorts/TikTok. Target: ${ctx.targetAudience}. Tone: ${ctx.tone}. Include [VISUAL] cues.`;
    const user = `Write a complete short-form script.
Topic: ${topic}
Hook: ${hook}
Channel: ${ctx.name} (${ctx.niche})
Return JSON: { "sections": [{ "name": "", "content": "", "duration": "seconds" }], "fullScript": "", "wordCount": 0 }`;

    const raw = await this.chat(system, user);
    try {
      return JSON.parse(this.extractJson(raw));
    } catch {
      return {
        sections: [
          { name: 'Hook', content: `[VISUAL: Bold text]\n"${hook}"`, duration: '3s' },
          { name: 'Body', content: `[VISUAL: B-roll]\nHere's what most people get wrong about ${topic}...`, duration: '40s' },
          { name: 'CTA', content: `Follow for more ${ctx.niche} secrets!`, duration: '5s' },
        ],
        fullScript: `${hook}\n\nHere's what most people get wrong about ${topic}...\n\nFollow for more!`,
        wordCount: 120,
      };
    }
  }

  async generateCta(ctx: ChannelContext, topic: string) {
    const system = `You write high-converting CTAs for short-form video. Target: ${ctx.targetAudience}.`;
    const user = `Generate 3 CTAs for a ${ctx.niche} video about "${topic}".
Return JSON: { "ctas": [{ "text": "", "type": "follow|comment|share", "placement": "end|mid" }] }`;

    const raw = await this.chat(system, user);
    try {
      return JSON.parse(this.extractJson(raw));
    } catch {
      return {
        ctas: [
          { text: 'Follow for daily mind-blowing facts', type: 'follow', placement: 'end' },
          { text: 'Comment your biggest takeaway', type: 'comment', placement: 'end' },
        ],
      };
    }
  }

  async generateDescription(ctx: ChannelContext, title: string, topic: string) {
    const system = `You write SEO-optimized descriptions for YouTube Shorts and TikTok targeting ${ctx.targetAudience}.`;
    const user = `Write platform descriptions for "${title}" about ${topic} (${ctx.niche}).
Return JSON: { "youtube": "", "tiktok": "", "hashtags": [] }`;

    const raw = await this.chat(system, user);
    try {
      return JSON.parse(this.extractJson(raw));
    } catch {
      return {
        youtube: `${title}\n\nDiscover more ${ctx.niche} content! Subscribe for daily shorts.`,
        tiktok: `${title} #${ctx.niche.replace(/\s/g, '')} #shorts #fyp #usa`,
        hashtags: ['#shorts', '#fyp', '#usa', `#${ctx.niche.replace(/\s/g, '')}`],
      };
    }
  }

  async generateThumbnailPrompt(ctx: ChannelContext, title: string) {
    const system = `You write AI image generation prompts for YouTube Shorts thumbnails. High contrast, bold text, faceless style.`;
    const user = `Create 3 thumbnail prompts for: "${title}" (${ctx.niche}).
Return JSON: { "prompts": [{ "prompt": "", "style": "", "textOverlay": "" }] }`;

    const raw = await this.chat(system, user);
    try {
      return JSON.parse(this.extractJson(raw));
    } catch {
      return {
        prompts: [
          {
            prompt: `Bold YouTube Shorts thumbnail, ${ctx.niche} theme, high contrast yellow text on dark background, minimalist, no faces, 9:16 aspect ratio`,
            style: 'bold',
            textOverlay: title.slice(0, 30),
          },
        ],
      };
    }
  }

  async generateVideoPrompt(ctx: ChannelContext, script: string) {
    const system = `You write AI video generation prompts for faceless short-form content. Scene-by-scene.`;
    const user = `Create video generation prompts for this script:\n${script}\n\nNiche: ${ctx.niche}
Return JSON: { "scenes": [{ "sceneNumber": 1, "prompt": "", "duration": 5, "style": "" }] }`;

    const raw = await this.chat(system, user);
    try {
      return JSON.parse(this.extractJson(raw));
    } catch {
      return {
        scenes: [
          { sceneNumber: 1, prompt: `Cinematic b-roll, ${ctx.niche} themed, dark moody lighting, text overlay animation`, duration: 5, style: 'cinematic' },
          { sceneNumber: 2, prompt: `Fast-paced montage, ${ctx.niche} visuals, kinetic typography`, duration: 10, style: 'dynamic' },
        ],
      };
    }
  }

  async generateFeedbackInsights(feedback: { rating: number; comment?: string }[]) {
    const system = 'You analyze content feedback to improve AI generation. Respond in JSON.';
    const user = `Analyze this feedback and suggest improvements:\n${JSON.stringify(feedback)}
Return JSON: { "insights": [""], "adjustments": { "tone": "", "hookStyle": "", "topics": [] } }`;

    const raw = await this.chat(system, user);
    try {
      return JSON.parse(this.extractJson(raw));
    } catch {
      return {
        insights: ['Increase hook intensity', 'Shorten intro sections'],
        adjustments: { tone: 'more urgent', hookStyle: 'controversy', topics: [] },
      };
    }
  }

  private extractJson(text: string): string {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? match[0] : text;
  }

  private fallbackResponse(prompt: string): string {
    return `{"message": "Configure OPENAI_API_KEY for AI generation", "prompt": ${JSON.stringify(prompt.slice(0, 100))}}`;
  }
}
