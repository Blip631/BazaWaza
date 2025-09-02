import { type NextRequest, NextResponse } from "next/server"
import { SMSService } from "@/lib/sms-service"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const from = formData.get("From") as string
    const body = formData.get("Body") as string
    const to = formData.get("To") as string

    console.log(`[v0] Incoming SMS from ${from} to ${to}: "${body}"`)

    // Handle status control commands
    const response = await SMSService.handleStatusSMS(from, body)

    // Generate TwiML response
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Message>${response}</Message>
      </Response>`

    return new NextResponse(twiml, {
      headers: {
        "Content-Type": "application/xml",
      },
    })
  } catch (error) {
    console.error("[v0] SMS webhook error:", error)

    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Message>Sorry, there was an error processing your request. Please try again.</Message>
      </Response>`

    return new NextResponse(errorTwiml, {
      headers: {
        "Content-Type": "application/xml",
      },
    })
  }
}
