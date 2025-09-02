import { type NextRequest, NextResponse } from "next/server"
import { CallProcessor } from "@/lib/call-processor"

export async function POST(request: NextRequest) {
  try {
    const { scenario } = await request.json()

    // Simulate a call scenario for testing
    const mockCallSid = `CA${Date.now()}`
    const processor = new CallProcessor(mockCallSid, "+15551234567", "+15559876543")

    const responses = []

    // Simulate conversation based on scenario
    switch (scenario) {
      case "emergency":
        responses.push(await processor.processSpeechInput("My kitchen is flooding! Water is everywhere!", 0.95))
        responses.push(await processor.processSpeechInput("Yes, it's an emergency! Water is still flowing!", 0.92))
        responses.push(await processor.processSpeechInput("123 Oak Street", 0.88))
        responses.push(await processor.processSpeechInput("Sarah Johnson", 0.94))
        break

      case "transfer":
        responses.push(
          await processor.processSpeechInput("I don't want to talk to a robot. Connect me to a real person.", 0.91),
        )
        break

      case "vague":
        responses.push(await processor.processSpeechInput("Um, I have some electrical problems", 0.85))
        responses.push(await processor.processSpeechInput("I guess it can wait until tomorrow", 0.82))
        responses.push(await processor.processSpeechInput("456 Pine Avenue", 0.89))
        responses.push(await processor.processSpeechInput("Bob Miller", 0.93))
        break

      default:
        return NextResponse.json({ error: "Invalid scenario" }, { status: 400 })
    }

    return NextResponse.json({
      callSid: mockCallSid,
      scenario,
      responses,
      message: "Call simulation completed",
    })
  } catch (error) {
    console.error("[v0] Test call error:", error)
    return NextResponse.json({ error: "Test call failed" }, { status: 500 })
  }
}
