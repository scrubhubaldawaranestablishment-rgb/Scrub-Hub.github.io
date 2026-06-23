import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPTS: Record<string, string> = {
  coach: `You are Caleb AI, a YouTube growth coach for faceless creators. You helped build channels making $3M+. Give practical, actionable advice about niches, thumbnails, scripts, retention, and monetization. Be concise and friendly.`,
  branding: `You are a branding AI for YouTube channels. Help users create channel identity including profile picture concepts, banner designs, color palettes, and taglines. Always suggest specific colors (hex codes) and visual directions.`,
  script: `You are an expert YouTube script writer for faceless channels. Write retention-optimized scripts with hooks, pattern interrupts, B-roll cues, and CTAs. Format with clear section headers.`,
  ideas: `You are a YouTube content strategist. Generate video ideas with titles, hooks, and scores (1-100) based on search potential, title optimization, and niche trends. Return JSON array: [{title, hook, score}]`,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, type = "coach", apiKey: clientKey } = body;
    const apiKey = clientKey || process.env.OPENAI_API_KEY;

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key required. Add it in Settings." }, { status: 400 });
    }

    const system = SYSTEM_PROMPTS[type] || SYSTEM_PROMPTS.coach;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 1500,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `OpenAI error: ${res.status}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";
    return NextResponse.json({ content });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI generation failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
