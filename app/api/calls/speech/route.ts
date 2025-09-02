import { type NextRequest, NextResponse } from "next/server"
import { CallProcessor } from "@/lib/call-processor"

export async function POST(request: NextRequest) {
  try {
    const { callSid, speechResult, confidence } = await request.json()

    console.log(`[v0] Speech received for call ${callSid}: "${speechResult}" (confidence: ${confidence})`)

    // Get call processor instance
    const processor = CallProcessor.getInstance(callSid)
    if (!processor) {
      throw new Error("Call processor not found")
    }

    // Process the speech input
    const response = await processor.processSpeechInput(speechResult, confidence)

    return NextResponse.json(response)
  } catch (error) {
    console.error("[v0] Speech processing error:", error)
    return NextResponse.json({ error: "Speech processing failed" }, { status: 500 })
  }
}
