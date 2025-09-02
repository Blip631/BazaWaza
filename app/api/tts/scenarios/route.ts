import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Generating all demo scenario audio files...")

    const scenarios = [
      {
        id: "emergency-call",
        name: "Emergency Call (High Urgency)",
        voice_style: "professional",
        transcript: [
          {
            speaker: "ai",
            text: "Hello, this is BazaWaza AI assistant for Mike's Plumbing. How can I help you today?",
            timestamp: 0,
          },
          {
            speaker: "caller",
            text: "Oh thank God someone answered! My kitchen is flooding and water is everywhere!",
            timestamp: 3000,
          },
          {
            speaker: "ai",
            text: "I understand this is urgent. Let me help you right away. First, do you know where your main water shut-off valve is located?",
            timestamp: 6000,
          },
          {
            speaker: "caller",
            text: "Yes, I think so - it's in the basement. Should I turn it off now?",
            timestamp: 9000,
          },
          {
            speaker: "ai",
            text: "Yes, please turn off the main water supply immediately. I'm scheduling Mike for an emergency visit within the hour.",
            timestamp: 12000,
          },
        ],
      },
      {
        id: "vague-electrical",
        name: "Vague Electrical Issue",
        voice_style: "warm",
        transcript: [
          {
            speaker: "ai",
            text: "Hello, this is BazaWaza AI assistant for Mike's Electrical Services. How can I help you today?",
            timestamp: 0,
          },
          {
            speaker: "caller",
            text: "Hi, um, I'm having some weird electrical problems. The lights are doing strange things.",
            timestamp: 3000,
          },
          {
            speaker: "ai",
            text: "I'd be happy to help you with that. Can you be more specific about what the lights are doing? Are they flickering, dimming, or completely going out?",
            timestamp: 6000,
          },
          {
            speaker: "caller",
            text: "They're kind of flickering, and there's this weird buzzing sound coming from somewhere.",
            timestamp: 9000,
          },
          {
            speaker: "ai",
            text: "That could indicate a wiring issue. For safety, I recommend having Mike take a look. I'll schedule a visit and send you the details.",
            timestamp: 12000,
          },
        ],
      },
      {
        id: "transfer-request",
        name: "Transfer Request",
        voice_style: "casual",
        transcript: [
          {
            speaker: "ai",
            text: "Hello, this is BazaWaza AI assistant for Mike's HVAC Services. How can I help you today?",
            timestamp: 0,
          },
          {
            speaker: "caller",
            text: "Yeah, my AC isn't working and it's hot in here. Can you just connect me to someone who can actually help?",
            timestamp: 3000,
          },
          {
            speaker: "ai",
            text: "I understand you'd like to speak with someone directly. Let me gather some quick details first so Mike can help you more efficiently when he calls back.",
            timestamp: 6000,
          },
          {
            speaker: "caller",
            text: "This is too complicated, just connect me to a person right now!",
            timestamp: 9000,
          },
          {
            speaker: "ai",
            text: "I completely understand. I'm connecting you to Mike now, and I'll send him all the details we've discussed.",
            timestamp: 12000,
          },
        ],
      },
    ]

    const results = []

    for (const scenario of scenarios) {
      // Generate audio for each transcript item
      const audioFiles = []

      for (const item of scenario.transcript) {
        try {
          const response = await fetch(`${request.nextUrl.origin}/api/tts/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: item.text,
              voice_style: scenario.voice_style,
              scenario: `${scenario.id}_${item.speaker}_${item.timestamp}`,
            }),
          })

          const result = await response.json()
          audioFiles.push({
            speaker: item.speaker,
            timestamp: item.timestamp,
            audioUrl: result.audioUrl,
            duration: result.duration,
          })
        } catch (error) {
          console.error(`[v0] Failed to generate audio for ${scenario.id}:`, error)
        }
      }

      results.push({
        scenario: scenario.id,
        name: scenario.name,
        audioFiles,
        totalDuration: Math.max(...scenario.transcript.map((t) => t.timestamp)) + 3000,
      })
    }

    console.log("[v0] All scenario audio files generated:", results.length)

    return NextResponse.json({
      success: true,
      scenarios: results,
      message: "All demo scenario audio files generated successfully",
    })
  } catch (error) {
    console.error("[v0] Scenario generation error:", error)
    return NextResponse.json({ error: "Failed to generate scenario audio files" }, { status: 500 })
  }
}
