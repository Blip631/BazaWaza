import { type NextRequest, NextResponse } from "next/server"
import { SMSService } from "@/lib/sms-service"

export async function POST(request: NextRequest) {
  try {
    const { scenario } = await request.json()

    // Mock SMS data for different scenarios
    const mockData = {
      emergency: {
        callerName: "Sarah Johnson",
        callerNumber: "+15550123",
        address: "123 Oak Street",
        problem: "Kitchen flooding - water everywhere, need immediate help!",
        urgency: "high" as const,
        flags: ["!! URGENT: KITCHEN FLOOD"],
        callSid: `CA${Date.now()}emergency`,
        recordingUrl: "https://api.bazawaza.com/recordings/emergency-call",
      },
      transfer: {
        callerName: "Linda Thompson",
        callerNumber: "+15550789",
        address: "789 Maple Drive",
        problem: "AC not working properly - customer requested human contact",
        urgency: "low" as const,
        flags: ["➡ TRANSFER REQUEST"],
        callSid: `CA${Date.now()}transfer`,
        recordingUrl: "https://api.bazawaza.com/recordings/transfer-call",
      },
      vague: {
        callerName: "Bob Miller",
        callerNumber: "+15550456",
        address: "456 Pine Avenue",
        problem: "Some electrical issues, not sure what exactly",
        urgency: "medium" as const,
        flags: ["⚠ VAGUE DESCRIPTION"],
        callSid: `CA${Date.now()}vague`,
        recordingUrl: "https://api.bazawaza.com/recordings/vague-call",
      },
    }

    const testData = mockData[scenario as keyof typeof mockData]
    if (!testData) {
      return NextResponse.json({ error: "Invalid scenario" }, { status: 400 })
    }

    // Send test SMS
    const result = await SMSService.sendLeadNotification(testData)

    return NextResponse.json({
      scenario,
      smsResult: result,
      testData,
      message: "Test SMS sent",
    })
  } catch (error) {
    console.error("[v0] Test SMS error:", error)
    return NextResponse.json({ error: "Test SMS failed" }, { status: 500 })
  }
}
