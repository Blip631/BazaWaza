import { type NextRequest, NextResponse } from "next/server"

interface TTSRequest {
  text: string
  voice_style: "professional" | "warm" | "casual"
  speaker: "ai" | "caller"
}

// ElevenLabs voice configurations for different styles (AI only)
const AI_VOICE_CONFIGS = {
  professional: {
    voice_id: "21m00Tcm4TlvDq8ikWAM", // Rachel - professional female voice
    stability: 0.75,
    similarity_boost: 0.75,
    style: 0.0,
    use_speaker_boost: true,
  },
  warm: {
    voice_id: "EXAVITQu4vr4xnSDxMaL", // Bella - warm, empathetic voice
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.25,
    use_speaker_boost: true,
  },
  casual: {
    voice_id: "pNInz6obpgDQGcFmaJgB", // Adam - friendly, casual voice
    stability: 0.4,
    similarity_boost: 0.85,
    style: 0.35,
    use_speaker_boost: true,
  },
}

// Customer voice remains consistent regardless of AI voice style
const CUSTOMER_VOICE_CONFIG = {
  voice_id: "pqHfZKP75CvOlQylNhV4", // Bill - consistent customer voice
  stability: 0.6,
  similarity_boost: 0.8,
  style: 0.15,
  use_speaker_boost: true,
}

export async function POST(request: NextRequest) {
  try {
    const { text, voice_style, speaker }: TTSRequest = await request.json()

    // Check for ElevenLabs API key
    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "ElevenLabs API key not configured" }, { status: 500 })
    }

    const voiceConfig = speaker === "ai" ? AI_VOICE_CONFIGS[voice_style] : CUSTOMER_VOICE_CONFIG

    console.log(`[v0] Generating TTS for ${speaker} with ${speaker === "ai" ? voice_style : "consistent"} voice`)

    // Call ElevenLabs API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceConfig.voice_id}`, {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: voiceConfig.stability,
          similarity_boost: voiceConfig.similarity_boost,
          style: voiceConfig.style,
          use_speaker_boost: voiceConfig.use_speaker_boost,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] ElevenLabs API error:", errorText)
      return NextResponse.json({ error: "TTS generation failed" }, { status: 500 })
    }

    // Return audio data
    const audioBuffer = await response.arrayBuffer()

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error("[v0] TTS generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
