interface CallState {
  callSid: string
  from: string
  to: string
  currentStep:
    | "greeting"
    | "problem_identification"
    | "urgency_assessment"
    | "location_gathering"
    | "contact_confirmation"
    | "summary"
    | "transfer"
  collectedData: {
    problem?: string
    urgency?: "high" | "medium" | "low"
    location?: string
    callerName?: string
    callerNumber?: string
    emergencyKeywords?: string[]
    transferRequested?: boolean
  }
  transcript: Array<{ speaker: "ai" | "caller"; text: string; timestamp: number }>
  startTime: number
  analyticsCallId?: string
  performanceTimers: Map<string, number>
}

export class CallProcessor {
  private static instances = new Map<string, CallProcessor>()
  private state: CallState

  constructor(callSid: string, from: string, to: string) {
    this.state = {
      callSid,
      from,
      to,
      currentStep: "greeting",
      collectedData: {
        callerNumber: from,
      },
      transcript: [],
      startTime: Date.now(),
      performanceTimers: new Map(),
    }

    this.state.analyticsCallId = analytics.trackCallStart("user-" + to.replace(/\D/g, ""))
    console.log(`[v0] Started analytics tracking for call ${callSid} with ID ${this.state.analyticsCallId}`)

    CallProcessor.instances.set(callSid, this)
  }

  static getInstance(callSid: string): CallProcessor | undefined {
    return CallProcessor.instances.get(callSid)
  }

  async generateInitialGreeting(): Promise<string> {
    const ttsTimer = startPerformanceTimer("tts-generation")

    const greeting = "Hello, this is BazaWaza AI assistant for Mike's Plumbing. How can I help you today?"

    this.addToTranscript("ai", greeting)

    const ttsDuration = logPerformance("tts-generation", ttsTimer)
    if (this.state.analyticsCallId) {
      analytics.trackCallLatency(this.state.analyticsCallId, "tts", ttsDuration)
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Gather
          input="speech"
          action="/api/calls/speech"
          method="POST"
          speechTimeout="3"
          speechModel="experimental_conversations"
        >
          <Say voice="alice">${greeting}</Say>
        </Gather>
        <Say voice="alice">I didn't catch that. Let me transfer you to our operator.</Say>
        <Dial timeout="30">
          <Number>+15551234567</Number>
        </Dial>
      </Response>`
  }

  async processSpeechInput(speechText: string, confidence: number): Promise<any> {
    const sttTimer = startPerformanceTimer("stt-processing")
    const nluTimer = startPerformanceTimer("nlu-processing")

    this.addToTranscript("caller", speechText)

    const sttDuration = logPerformance("stt-processing", sttTimer, { confidence })
    if (this.state.analyticsCallId) {
      analytics.trackCallLatency(this.state.analyticsCallId, "stt", sttDuration)
    }

    if (this.detectTransferRequest(speechText)) {
      const result = await this.handleTransferRequest()
      const nluDuration = logPerformance("nlu-processing", nluTimer, { action: "transfer_request" })
      if (this.state.analyticsCallId) {
        analytics.trackCallLatency(this.state.analyticsCallId, "nlu", nluDuration)
      }
      return result
    }

    let result
    switch (this.state.currentStep) {
      case "greeting":
        result = await this.handleProblemIdentification(speechText)
        break
      case "problem_identification":
        result = await this.handleUrgencyAssessment(speechText)
        break
      case "urgency_assessment":
        result = await this.handleLocationGathering(speechText)
        break
      case "location_gathering":
        result = await this.handleContactConfirmation(speechText)
        break
      case "contact_confirmation":
        result = await this.handleCallSummary()
        break
      default:
        result = await this.handleUnexpectedInput(speechText)
    }

    const nluDuration = logPerformance("nlu-processing", nluTimer, {
      step: this.state.currentStep,
      action: "conversation_flow",
    })
    if (this.state.analyticsCallId) {
      analytics.trackCallLatency(this.state.analyticsCallId, "nlu", nluDuration)
    }

    return result
  }

  private detectTransferRequest(text: string): boolean {
    const transferKeywords = [
      "human",
      "person",
      "agent",
      "operator",
      "real person",
      "speak to someone",
      "transfer",
      "connect me",
    ]
    const lowerText = text.toLowerCase()
    return transferKeywords.some((keyword) => lowerText.includes(keyword))
  }

  private detectEmergencyKeywords(text: string): string[] {
    const emergencyKeywords = [
      "emergency",
      "urgent",
      "flooding",
      "flood",
      "burst",
      "leak",
      "water everywhere",
      "no water",
      "sewage",
      "backup",
      "overflow",
      "gas smell",
      "electrical",
      "shock",
      "fire",
      "smoke",
      "burning",
      "sparks",
      "no power",
      "carbon monoxide",
    ]

    const lowerText = text.toLowerCase()
    return emergencyKeywords.filter((keyword) => lowerText.includes(keyword))
  }

  private async handleProblemIdentification(speechText: string): Promise<any> {
    this.state.collectedData.problem = speechText
    this.state.collectedData.emergencyKeywords = this.detectEmergencyKeywords(speechText)
    this.state.currentStep = "problem_identification"

    const isEmergency = this.state.collectedData.emergencyKeywords.length > 0

    let response: string
    if (isEmergency) {
      response =
        "I understand this sounds urgent. To help prioritize this properly, is there any immediate danger or is water actively flowing where it shouldn't be?"
    } else {
      response =
        "I can help with that. To understand the urgency, is this something that needs immediate attention today, or can it wait until regular business hours?"
    }

    this.addToTranscript("ai", response)
    this.state.currentStep = "urgency_assessment"

    return this.generateTwiMLResponse(response)
  }

  private async handleUrgencyAssessment(speechText: string): Promise<any> {
    const lowerText = speechText.toLowerCase()

    if (
      lowerText.includes("emergency") ||
      lowerText.includes("urgent") ||
      lowerText.includes("immediate") ||
      lowerText.includes("flooding") ||
      lowerText.includes("danger") ||
      this.state.collectedData.emergencyKeywords?.length > 0
    ) {
      this.state.collectedData.urgency = "high"
    } else if (lowerText.includes("today") || lowerText.includes("soon") || lowerText.includes("asap")) {
      this.state.collectedData.urgency = "medium"
    } else {
      this.state.collectedData.urgency = "low"
    }

    const response = "Got it. Can you give me your address so I can let Mike know where to come?"
    this.addToTranscript("ai", response)
    this.state.currentStep = "location_gathering"

    return this.generateTwiMLResponse(response)
  }

  private async handleLocationGathering(speechText: string): Promise<any> {
    this.state.collectedData.location = speechText

    const response = "Perfect. And can I get your name please?"
    this.addToTranscript("ai", response)
    this.state.currentStep = "contact_confirmation"

    return this.generateTwiMLResponse(response)
  }

  private async handleContactConfirmation(speechText: string): Promise<any> {
    this.state.collectedData.callerName = speechText

    const response = `Thank you ${speechText}. I'm sending all your details to Mike right now, and he'll call you back within ${this.state.collectedData.urgency === "high" ? "5 minutes" : "15 minutes"}. Is this number ${this.state.from} the best number to reach you?`
    this.addToTranscript("ai", response)
    this.state.currentStep = "summary"

    return this.generateTwiMLResponse(response)
  }

  private async handleCallSummary(): Promise<any> {
    await this.generateLeadSummary()

    const response = "Perfect. Mike has all your information and will be in touch shortly. Thank you for calling!"
    this.addToTranscript("ai", response)

    if (this.state.analyticsCallId) {
      const urgencyLevel =
        this.state.collectedData.urgency === "high"
          ? "emergency"
          : this.state.collectedData.urgency === "medium"
            ? "high"
            : "medium"
      const leadQuality = this.state.collectedData.problem && this.state.collectedData.location ? "qualified" : "vague"

      analytics.trackCallEnd(this.state.analyticsCallId, "completed", urgencyLevel as any, leadQuality as any)
      console.log(`[v0] Call ${this.state.callSid} completed successfully with analytics tracking`)
    }

    return this.generateTwiMLResponse(response, true)
  }

  private async handleTransferRequest(): Promise<any> {
    this.state.collectedData.transferRequested = true

    const response =
      "I understand you'd like to speak with someone directly. Let me connect you with Mike right away. Please hold on."
    this.addToTranscript("ai", response)

    await this.generateLeadSummary()

    if (this.state.analyticsCallId) {
      analytics.trackCallEnd(this.state.analyticsCallId, "transferred", "medium", "unqualified")
      console.log(`[v0] Call ${this.state.callSid} transferred with analytics tracking`)
    }

    return {
      twiml: `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say voice="alice">${response}</Say>
          <Dial timeout="30">
            <Number>+15551234567</Number>
          </Dial>
          <Say voice="alice">I'm sorry, Mike is not available right now. He'll call you back within 15 minutes.</Say>
        </Response>`,
    }
  }

  private async handleUnexpectedInput(speechText: string): Promise<any> {
    const response = "I'm sorry, I didn't quite understand that. Could you please repeat what you need help with?"
    this.addToTranscript("ai", response)

    return this.generateTwiMLResponse(response)
  }

  private generateTwiMLResponse(message: string, hangup = false): any {
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Gather
          input="speech"
          action="/api/calls/speech"
          method="POST"
          speechTimeout="3"
          speechModel="experimental_conversations"
        >
          <Say voice="alice">${message}</Say>
        </Gather>
        ${hangup ? "<Hangup/>" : '<Say voice="alice">I didn\'t catch that. Let me transfer you to our operator.</Say><Dial timeout="30"><Number>+15551234567</Number></Dial>'}
      </Response>`

    return { twiml }
  }

  private addToTranscript(speaker: "ai" | "caller", text: string) {
    this.state.transcript.push({
      speaker,
      text,
      timestamp: Date.now(),
    })
  }

  private async generateLeadSummary() {
    const summary = {
      callSid: this.state.callSid,
      callerName: this.state.collectedData.callerName || "Unknown",
      callerNumber: this.state.from,
      address: this.state.collectedData.location || "Not provided",
      problem: this.state.collectedData.problem || "Not specified",
      urgency: this.state.collectedData.urgency || "medium",
      flags: this.generateFlags(),
      transcript: this.state.transcript,
      duration: Date.now() - this.state.startTime,
      timestamp: new Date().toISOString(),
    }

    console.log("[v0] Generated lead summary:", summary)

    try {
      const smsResult = await SMSService.sendLeadNotification({
        callerName: summary.callerName,
        callerNumber: summary.callerNumber,
        address: summary.address,
        problem: summary.problem,
        urgency: summary.urgency,
        flags: summary.flags,
        callSid: summary.callSid,
        recordingUrl: `https://api.bazawaza.com/recordings/${summary.callSid}`,
      })

      if (smsResult.success) {
        console.log(`[v0] SMS notification sent successfully after ${smsResult.attempts} attempts`)
      } else {
        console.error(`[v0] SMS notification failed: ${smsResult.error}`)

        if (this.state.analyticsCallId) {
          analytics.trackCallEnd(
            this.state.analyticsCallId,
            "failed",
            this.state.collectedData.urgency === "high" ? "emergency" : "medium",
            "qualified",
          )
        }
      }
    } catch (error) {
      console.error("[v0] Error sending SMS notification:", error)

      if (this.state.analyticsCallId) {
        analytics.trackCallEnd(
          this.state.analyticsCallId,
          "failed",
          this.state.collectedData.urgency === "high" ? "emergency" : "medium",
          "qualified",
        )
      }
    }

    return summary
  }

  private generateFlags(): string[] {
    const flags: string[] = []

    if (this.state.collectedData.urgency === "high") {
      flags.push("!! URGENT: " + (this.state.collectedData.emergencyKeywords?.[0]?.toUpperCase() || "HIGH PRIORITY"))
    }

    if (this.state.collectedData.transferRequested) {
      flags.push("➡ TRANSFER REQUEST")
    }

    if (!this.state.collectedData.problem || this.state.collectedData.problem.length < 10) {
      flags.push("⚠ VAGUE DESCRIPTION")
    }

    return flags
  }
}

import { SMSService } from "./sms-service"
import { analytics, startPerformanceTimer, logPerformance } from "./analytics"
