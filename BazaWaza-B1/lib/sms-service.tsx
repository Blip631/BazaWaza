interface SMSData {
  callerName: string
  callerNumber: string
  address: string
  problem: string
  urgency: "high" | "medium" | "low"
  flags: string[]
  callSid: string
  recordingUrl?: string
}

interface SMSDeliveryResult {
  success: boolean
  messageId?: string
  error?: string
  attempts: number
}

export class SMSService {
  private static readonly MAX_RETRIES = 3
  private static readonly OPERATOR_NUMBER = "+15551234567" // Mock operator number
  private static readonly OPERATOR_EMAIL = "operator@bazawaza.com"

  static async sendLeadNotification(data: SMSData): Promise<SMSDeliveryResult> {
    console.log("[v0] Sending SMS notification for lead:", data.callerName)

    const message = this.formatSMSMessage(data)

    // Attempt SMS delivery with retries
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const result = await this.sendSMS(this.OPERATOR_NUMBER, message)

        if (result.success) {
          console.log(`[v0] SMS sent successfully on attempt ${attempt}:`, result.messageId)
          return { ...result, attempts: attempt }
        }

        console.log(`[v0] SMS attempt ${attempt} failed:`, result.error)

        // Wait before retry (exponential backoff)
        if (attempt < this.MAX_RETRIES) {
          await this.delay(1000 * Math.pow(2, attempt - 1))
        }
      } catch (error) {
        console.error(`[v0] SMS attempt ${attempt} error:`, error)
      }
    }

    // All SMS attempts failed, send email fallback
    console.log("[v0] All SMS attempts failed, sending email fallback")
    const emailResult = await this.sendEmailFallback(data)

    return {
      success: false,
      error: "SMS delivery failed after 3 attempts, email fallback sent",
      attempts: this.MAX_RETRIES,
    }
  }

  private static formatSMSMessage(data: SMSData): string {
    const urgencyEmoji = data.urgency === "high" ? "🚨" : data.urgency === "medium" ? "⚠️" : "📞"
    const callbackTime = data.urgency === "high" ? "5 minutes" : "15 minutes"

    let message = `${urgencyEmoji} NEW LEAD\n\n`

    // Add flags at the top for visibility
    if (data.flags.length > 0) {
      message += data.flags.join(" | ") + "\n\n"
    }

    // Contact information with actionable links
    message += `👤 ${data.callerName}\n`
    message += `📱 ${data.callerNumber}\n`
    message += `📍 ${data.address}\n\n`

    // Problem description
    message += `🔧 PROBLEM:\n${data.problem}\n\n`

    // Action items
    message += `⏰ Callback within ${callbackTime}\n`

    // Links (in production these would be actual clickable links)
    message += `\n📞 Call: tel:${data.callerNumber.replace(/[^\d+]/g, "")}`
    message += `\n🗺️ Maps: https://maps.google.com/?q=${encodeURIComponent(data.address)}`

    if (data.recordingUrl) {
      message += `\n🎵 Recording: ${data.recordingUrl}`
    }

    message += `\n\n📋 Call ID: ${data.callSid}`

    return message
  }

  private static async sendSMS(to: string, message: string): Promise<SMSDeliveryResult> {
    // Mock SMS sending - in production this would use Twilio
    console.log(`[v0] Mock SMS to ${to}:`, message)

    // Simulate random failures for testing retry logic
    const shouldFail = Math.random() < 0.3 // 30% failure rate for testing

    if (shouldFail) {
      return {
        success: false,
        error: "Mock SMS delivery failure",
        attempts: 1,
      }
    }

    return {
      success: true,
      messageId: `SM${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
      attempts: 1,
    }
  }

  private static async sendEmailFallback(data: SMSData): Promise<void> {
    // Mock email sending - in production this would use SendGrid, AWS SES, etc.
    const emailContent = this.formatEmailMessage(data)

    console.log(`[v0] Mock email fallback to ${this.OPERATOR_EMAIL}:`, emailContent)

    // In production, send actual email here
    // await emailService.send({
    //   to: this.OPERATOR_EMAIL,
    //   subject: `URGENT: SMS Failed - New Lead from ${data.callerName}`,
    //   html: emailContent
    // })
  }

  private static formatEmailMessage(data: SMSData): string {
    const urgencyColor = data.urgency === "high" ? "#dc2626" : data.urgency === "medium" ? "#f59e0b" : "#10b981"

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${urgencyColor}; color: white; padding: 16px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">🚨 SMS DELIVERY FAILED - New Lead Alert</h2>
        </div>
        
        <div style="border: 1px solid #e5e7eb; padding: 24px; border-radius: 0 0 8px 8px;">
          ${
            data.flags.length > 0
              ? `
            <div style="margin-bottom: 16px;">
              ${data.flags.map((flag) => `<span style="background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-right: 8px;">${flag}</span>`).join("")}
            </div>
          `
              : ""
          }
          
          <h3>Contact Information</h3>
          <p><strong>Name:</strong> ${data.callerName}</p>
          <p><strong>Phone:</strong> <a href="tel:${data.callerNumber}">${data.callerNumber}</a></p>
          <p><strong>Address:</strong> <a href="https://maps.google.com/?q=${encodeURIComponent(data.address)}" target="_blank">${data.address}</a></p>
          
          <h3>Problem Description</h3>
          <p>${data.problem}</p>
          
          <h3>Urgency Level</h3>
          <p style="color: ${urgencyColor}; font-weight: bold; text-transform: uppercase;">${data.urgency}</p>
          
          ${
            data.recordingUrl
              ? `
            <h3>Call Recording</h3>
            <p><a href="${data.recordingUrl}" target="_blank">Listen to Recording</a></p>
          `
              : ""
          }
          
          <div style="margin-top: 24px; padding: 16px; background: #f9fafb; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">
              <strong>Call ID:</strong> ${data.callSid}<br>
              <strong>Callback Required:</strong> Within ${data.urgency === "high" ? "5 minutes" : "15 minutes"}
            </p>
          </div>
        </div>
      </div>
    `
  }

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // Status control via SMS keywords
  static async handleStatusSMS(from: string, body: string): Promise<string> {
    const normalizedBody = body.trim().toUpperCase()

    switch (normalizedBody) {
      case "BUSY":
        // Update operator status to busy
        console.log(`[v0] Operator ${from} set status to BUSY`)
        return "Status updated to BUSY. You will not receive new calls until you text AVAILABLE."

      case "AVAILABLE":
        // Update operator status to available
        console.log(`[v0] Operator ${from} set status to AVAILABLE`)
        return "Status updated to AVAILABLE. You will now receive new calls."

      case "STATUS":
        // Return current status
        return "Your current status is AVAILABLE. Text BUSY to stop receiving calls or AVAILABLE to resume."

      default:
        return "Commands: BUSY (stop calls), AVAILABLE (resume calls), STATUS (check status)"
    }
  }
}
