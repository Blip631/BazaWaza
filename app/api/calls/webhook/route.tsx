import { type NextRequest, NextResponse } from "next/server"
import { CallProcessor } from "@/lib/call-processor"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const callSid = formData.get("CallSid") as string
    const from = formData.get("From") as string
    const to = formData.get("To") as string

    console.log(`[v0] Incoming call: ${callSid} from ${from} to ${to}`)

    // Initialize call processor
    const processor = new CallProcessor(callSid, from, to)

    // Generate TwiML response for initial greeting
    const twiml = await processor.generateInitialGreeting()

    return new NextResponse(twiml, {
      headers: {
        "Content-Type": "application/xml",
      },
    })
  } catch (error) {
    console.error("[v0] Call webhook error:", error)

    // Fallback TwiML - transfer to operator
    const fallbackTwiml = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say voice="alice">I'm sorry, there's a technical issue. Let me transfer you to our operator.</Say>
        <Dial timeout="30">
          <Number>+15551234567</Number>
        </Dial>
      </Response>`

    return new NextResponse(fallbackTwiml, {
      headers: {
        "Content-Type": "application/xml",
      },
    })
  }
}
