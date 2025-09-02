import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const callSid = searchParams.get("callSid")

  if (!callSid) {
    return NextResponse.json({ error: "Call SID required" }, { status: 400 })
  }

  // Mock call status - in production this would query actual call state
  const mockStatus = {
    callSid,
    status: "in-progress",
    duration: 45,
    currentStep: "gathering_problem_details",
    transcript: [
      {
        speaker: "ai",
        text: "Hello, this is BazaWaza AI assistant for Mike's Plumbing. How can I help you today?",
        timestamp: Date.now() - 30000,
      },
      {
        speaker: "caller",
        text: "Hi, I have a plumbing emergency. My kitchen sink is overflowing!",
        timestamp: Date.now() - 25000,
      },
      {
        speaker: "ai",
        text: "I understand this is urgent. Let me help you right away. First, can you turn off the water supply under the sink?",
        timestamp: Date.now() - 20000,
      },
    ],
  }

  return NextResponse.json(mockStatus)
}
