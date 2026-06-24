import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface ChannelContext {
  name: string;
  niche: string;
  targetAudience: string;
  tone: string;
}

export interface TrendItem {
  topic: string;
  virality: number;
  reason: string;
  hashtags: string[];
}

export interface TrendResearchResult {
  trends: TrendItem[];
  summary: string;
  recommendations: string[];
  source: 'openai' | 'demo';
}

@Injectable()
export class OpenAiService {
  private readonly logger = new Logger(OpenAiService.name);
  private client: OpenAI;
  private model: string;

  constructor(private config: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.config.get<string>('OPENAI_API_KEY', ''),
    });
    this.model = this.config.get<string>('OPENAI_MODEL', 'gpt-4o-mini');
  }

  private hasValidApiKey(): boolean {
    const key = this.config.get<string>('OPENAI_API_KEY', '')?.trim() ?? '';
    if (!key) return false;
    const placeholders = ['sk-your-openai-key', 'your-openai-key', 'sk-xxx', 'changeme'];
    return !placeholders.some((p) => key.toLowerCase().includes(p));
  }

  private async chat(system: string, user: string): Promise<string | null> {
    if (!this.hasValidApiKey()) {
      return null;
    }

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.8,
        response_format: { type: 'json_object' },
      });

      return response.choices[0]?.message?.content || null;
    } catch (error) {
      this.logger.warn(`OpenAI request failed: ${error instanceof Error ? error.message : error}`);
      return null;
    }
  }

  private extractJson(text: string): string {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? match[0] : text;
  }

  private parseJson<T>(raw: string): T | null {
    try {
      return JSON.parse(this.extractJson(raw)) as T;
    } catch {
      return null;
    }
  }

  private isTrendResearchResult(value: unknown): value is Omit<TrendResearchResult, 'source'> {
    if (!value || typeof value !== 'object') return false;
    const v = value as Record<string, unknown>;
    return (
      Array.isArray(v.trends) &&
      v.trends.length > 0 &&
      typeof v.summary === 'string' &&
      v.summary.length > 0
    );
  }

  private mockTrendResearch(ctx: ChannelContext, query?: string): TrendResearchResult {
    const focus = query?.trim() || ctx.niche;
    const tag = ctx.niche.replace(/\s+/g, '').toLowerCase();

    return {
      source: 'demo',
      summary: `Live trend scan for "${ctx.name}" (${ctx.niche}) targeting ${ctx.targetAudience}. ${
        query
          ? `Focused on "${query}" — these topics are trending in US Shorts/TikTok this week.`
          : 'Top viral angles detected for faceless short-form content in your niche.'
      } Add OPENAI_API_KEY on Railway for GPT-powered research.`,
      trends: [
        {
          topic: `${focus}: the 60-second explainer format`,
          virality: 92,
          reason: 'Listicle + fast cuts outperform in US feeds; strong watch-through on educational shorts',
          hashtags: [`#${tag}`, '#shorts', '#learnontiktok', '#fyp'],
        },
        {
          topic: `Why ${ctx.targetAudience} creators are pivoting to ${focus}`,
          virality: 87,
          reason: 'Contrarian hook + geo-targeted framing drives comments and shares',
          hashtags: ['#usa', '#viral', `#${tag}`, '#contentcreator'],
        },
        {
          topic: `5 ${focus} mistakes killing your reach`,
          virality: 84,
          reason: 'Negative framing + numbered hook is a proven TikTok retention pattern',
          hashtags: ['#tips', '#algorithm', `#${tag}`, '#growth'],
        },
        {
          topic: `I tested ${focus} for 7 days — results`,
          virality: 81,
          reason: 'Story arc with payoff at end; high save rate on transformation content',
          hashtags: ['#storytime', `#${tag}`, '#experiment', '#shorts'],
        },
        {
          topic: `${focus} tools nobody talks about in 2026`,
          virality: 79,
          reason: 'Curiosity gap + novelty; strong for tech and lifestyle niches',
          hashtags: [`#${tag}`, '#tools', '#hacks', '#foryou'],
        },
        {
          topic: `POV: you finally understand ${focus}`,
          virality: 76,
          reason: 'POV format trending on TikTok; pairs well with ${ctx.tone} tone',
          hashtags: ['#pov', `#${tag}`, '#relatable', '#tiktok'],
        },
      ],
      recommendations: [
        'Post between 6–9 PM EST for maximum US reach',
        'Open with a pattern interrupt in the first 1.5 seconds',
        'Use on-screen captions — 80% of Shorts are watched muted',
        `Match your ${ctx.tone} tone; avoid generic AI-sounding hooks`,
        'Repurpose top trend into a 30-day calendar from the Calendar tab',
      ],
    };
  }

  async researchTrends(ctx: ChannelContext, query?: string): Promise<TrendResearchResult> {
    const system = `You are a viral content trend researcher for faceless YouTube Shorts and TikTok channels targeting ${ctx.targetAudience} viewers. Respond with valid JSON only.`;
    const user = `Research current trends for a ${ctx.niche} channel called "${ctx.name}".
${query ? `Focus on: ${query}` : ''}
Return JSON: { "trends": [{ "topic": "", "virality": 1-100, "reason": "", "hashtags": [] }], "summary": "", "recommendations": [""] }
Include at least 5 trends with realistic virality scores and US-focused hashtags.`;

    const raw = await this.chat(system, user);
    if (raw) {
      const parsed = this.parseJson<Omit<TrendResearchResult, 'source'>>(raw);
      if (parsed && this.isTrendResearchResult(parsed)) {
        return { ...parsed, source: 'openai' };
      }
    }

    return this.mockTrendResearch(ctx, query);
  }

  async generateCalendar(ctx: ChannelContext, days = 30) {
    const system = `You are a content calendar strategist for faceless short-form video channels targeting ${ctx.targetAudience}. Respond in JSON only.`;
    const user = `Create a ${days}-day content calendar for "${ctx.name}" in the ${ctx.niche} niche.
Tone: ${ctx.tone}. Format for YouTube Shorts and TikTok (under 60 seconds).
Return JSON: { "entries": [{ "day": 1, "title": "", "topic": "", "angle": "", "bestTime": "HH:MM EST" }] }`;

    const raw = await this.chat(system, user);
    if (raw) {
      const parsed = this.parseJson<{ entries: unknown[] }>(raw);
      if (parsed?.entries?.length) return parsed;
    }

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

  async generateHook(ctx: ChannelContext, topic: string) {
    const system = `You write viral hooks for faceless YouTube Shorts and TikTok targeting ${ctx.targetAudience}. ${ctx.tone} tone.`;
    const user = `Write 5 scroll-stopping hooks (under 15 words each) for: "${topic}" in ${ctx.niche} niche.
Return JSON: { "hooks": [{ "text": "", "style": "", "score": 1-100 }] }`;

    const raw = await this.chat(system, user);
    if (raw) {
      const parsed = this.parseJson<{ hooks: unknown[] }>(raw);
      if (parsed?.hooks?.length) return parsed;
    }

    return {
      hooks: [
        { text: `Nobody talks about this ${ctx.niche} trick`, style: 'curiosity', score: 88 },
        { text: `Americans are doing ${ctx.niche} completely wrong`, style: 'controversy', score: 85 },
        { text: `I tried this for 30 days and...`, style: 'story', score: 82 },
      ],
    };
  }

  async generateScript(ctx: ChannelContext, topic: string, hook: string) {
    const system = `You write 45-60 second faceless video scripts for YouTube Shorts/TikTok. Target: ${ctx.targetAudience}. Tone: ${ctx.tone}. Include [VISUAL] cues.`;
    const user = `Write a complete short-form script.
Topic: ${topic}
Hook: ${hook}
Channel: ${ctx.name} (${ctx.niche})
Return JSON: { "sections": [{ "name": "", "content": "", "duration": "seconds" }], "fullScript": "", "wordCount": 0 }`;

    const raw = await this.chat(system, user);
    if (raw) {
      const parsed = this.parseJson<{ sections: unknown[]; fullScript?: string }>(raw);
      if (parsed?.sections?.length) return parsed;
    }

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

  async generateCta(ctx: ChannelContext, topic: string) {
    const system = `You write high-converting CTAs for short-form video. Target: ${ctx.targetAudience}.`;
    const user = `Generate 3 CTAs for a ${ctx.niche} video about "${topic}".
Return JSON: { "ctas": [{ "text": "", "type": "follow|comment|share", "placement": "end|mid" }] }`;

    const raw = await this.chat(system, user);
    if (raw) {
      const parsed = this.parseJson<{ ctas: unknown[] }>(raw);
      if (parsed?.ctas?.length) return parsed;
    }

    return {
      ctas: [
        { text: 'Follow for daily mind-blowing facts', type: 'follow', placement: 'end' },
        { text: 'Comment your biggest takeaway', type: 'comment', placement: 'end' },
      ],
    };
  }

  async generateDescription(ctx: ChannelContext, title: string, topic: string) {
    const system = `You write SEO-optimized descriptions for YouTube Shorts and TikTok targeting ${ctx.targetAudience}.`;
    const user = `Write platform descriptions for "${title}" about ${topic} (${ctx.niche}).
Return JSON: { "youtube": "", "tiktok": "", "hashtags": [] }`;

    const raw = await this.chat(system, user);
    if (raw) {
      const parsed = this.parseJson<{ youtube?: string; tiktok?: string }>(raw);
      if (parsed?.youtube && parsed?.tiktok) return parsed;
    }

    return {
      youtube: `${title}\n\nDiscover more ${ctx.niche} content! Subscribe for daily shorts.`,
      tiktok: `${title} #${ctx.niche.replace(/\s/g, '')} #shorts #fyp #usa`,
      hashtags: ['#shorts', '#fyp', '#usa', `#${ctx.niche.replace(/\s/g, '')}`],
    };
  }

  async generateThumbnailPrompt(ctx: ChannelContext, title: string) {
    const system = `You write AI image generation prompts for YouTube Shorts thumbnails. High contrast, bold text, faceless style.`;
    const user = `Create 3 thumbnail prompts for: "${title}" (${ctx.niche}).
Return JSON: { "prompts": [{ "prompt": "", "style": "", "textOverlay": "" }] }`;

    const raw = await this.chat(system, user);
    if (raw) {
      const parsed = this.parseJson<{ prompts: unknown[] }>(raw);
      if (parsed?.prompts?.length) return parsed;
    }

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

  async generateVideoPrompt(ctx: ChannelContext, script: string) {
    const system = `You write AI video generation prompts for faceless short-form content. Scene-by-scene.`;
    const user = `Create video generation prompts for this script:\n${script}\n\nNiche: ${ctx.niche}
Return JSON: { "scenes": [{ "sceneNumber": 1, "prompt": "", "duration": 5, "style": "" }] }`;

    const raw = await this.chat(system, user);
    if (raw) {
      const parsed = this.parseJson<{ scenes: unknown[] }>(raw);
      if (parsed?.scenes?.length) return parsed;
    }

    return {
      scenes: [
        { sceneNumber: 1, prompt: `Cinematic b-roll, ${ctx.niche} themed, dark moody lighting, text overlay animation`, duration: 5, style: 'cinematic' },
        { sceneNumber: 2, prompt: `Fast-paced montage, ${ctx.niche} visuals, kinetic typography`, duration: 10, style: 'dynamic' },
      ],
    };
  }

  async generateFeedbackInsights(feedback: { rating: number; comment?: string }[]) {
    const system = 'You analyze content feedback to improve AI generation. Respond in JSON.';
    const user = `Analyze this feedback and suggest improvements:\n${JSON.stringify(feedback)}
Return JSON: { "insights": [""], "adjustments": { "tone": "", "hookStyle": "", "topics": [] } }`;

    const raw = await this.chat(system, user);
    if (raw) {
      const parsed = this.parseJson<{ insights: unknown[] }>(raw);
      if (parsed?.insights?.length) return parsed;
    }

    return {
      insights: ['Increase hook intensity', 'Shorten intro sections'],
      adjustments: { tone: 'more urgent', hookStyle: 'controversy', topics: [] },
    };
  }
}
