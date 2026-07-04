import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Text-to-speech is not configured" },
      { status: 503 }
    );
  }

  // George — warm, gravelly British male. Override via ELEVENLABS_VOICE_ID env var.
  const voiceId = process.env.ELEVENLABS_VOICE_ID ?? "JBFqnCBsd6RMkjVDRZzb";

  try {
    const { text } = (await req.json()) as { text: string };
    if (!text) {
      return NextResponse.json(
        { error: "No text provided" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.80,
            style: 0.30,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!res.ok) {
      const body = await res.text();
      console.error(`ElevenLabs TTS error ${res.status}:`, body);
      return NextResponse.json(
        { error: "Text-to-speech failed", detail: body },
        { status: 503 }
      );
    }

    const audioBuffer = await res.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch (err) {
    console.error("TTS route error:", err);
    return NextResponse.json(
      { error: "Text-to-speech failed" },
      { status: 503 }
    );
  }
}
