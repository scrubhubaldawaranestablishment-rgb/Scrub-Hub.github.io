import { NextRequest, NextResponse } from "next/server";
import { parseYouTubeUrl } from "@/lib/youtube-parser";
import { analyzeYouTubeUrl } from "@/lib/youtube-api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = body.url as string;
    const clientApiKey = body.apiKey as string | undefined;

    if (!url?.trim()) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const parsed = parseYouTubeUrl(url);
    const apiKey = clientApiKey || process.env.YOUTUBE_API_KEY;

    const result = await analyzeYouTubeUrl(parsed, apiKey);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
