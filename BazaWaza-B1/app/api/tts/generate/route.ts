import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text, voice_style, scenario } = await request.json()

    console.log("[v0] TTS Generation Request:", { text: text.substring(0, 50) + "...", voice_style, scenario })

    // Check for required environment variables
    if (!process.env.ELEVENLABS_API_KEY) {
      console.log("[v0] ELEVENLABS_API_KEY not found - running in demo mode")

      // Return demo mode response
      return NextResponse.json({
        success: false,
        error: "DEMO_MODE",
        message: "Running in demo mode. Add ELEVENLABS_API_KEY environment variable for ElevenLabs integration.",
        demoMode: true,
      })
    }

    // In a real implementation, this would call ElevenLabs API
    console.log("[v0] Simulating ElevenLabs generation...")

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In production, this would be:
    // const audioBuffer = await generateWithElevenLabs(text, voice_style)
    // const audioUrl = await uploadToStorage(audioBuffer)

    // For now, return a placeholder response
    const audioUrl = `/audio/generated/${scenario}_${Date.now()}.mp3`

    console.log("[v0] TTS Generation completed:", audioUrl)

    return NextResponse.json({
      success: true,
      audioUrl,
      duration: estimateDuration(text),
      voice_style,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred during TTS generation"
    console.error("[v0] TTS Generation error:", errorMessage)
    return NextResponse.json(
      {
        error: errorMessage,
        success: false,
      },
      { status: 500 },
    )
  }
}

function estimateDuration(text: string): number {
  // Estimate duration based on text length (roughly 150 words per minute)
  const words = text.split(" ").length
  return Math.ceil((words / 150) * 60 * 1000) // Convert to milliseconds
}
