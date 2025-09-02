import { type NextRequest, NextResponse } from "next/server"
import { analytics } from "@/lib/analytics"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const userId = searchParams.get("userId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    let timeRange
    if (startDate && endDate) {
      timeRange = {
        start: Number.parseInt(startDate),
        end: Number.parseInt(endDate),
      }
    }

    switch (type) {
      case "performance":
        const performanceStats = analytics.getPerformanceStats(timeRange)
        return NextResponse.json(performanceStats)

      case "users":
        const userStats = analytics.getUserStats()
        return NextResponse.json(userStats)

      case "calls":
        const callMetrics = analytics.getCallMetrics(userId || undefined, timeRange)
        return NextResponse.json(callMetrics)

      case "system":
        const systemHealth = analytics.getSystemHealth()
        return NextResponse.json(systemHealth)

      default:
        // Return overview dashboard data
        const overview = {
          performance: analytics.getPerformanceStats(timeRange),
          users: analytics.getUserStats(),
          system: analytics.getSystemHealth(),
          recentCalls: analytics
            .getCallMetrics(undefined, {
              start: Date.now() - 24 * 60 * 60 * 1000,
              end: Date.now(),
            })
            .slice(-10),
        }
        return NextResponse.json(overview)
    }
  } catch (error) {
    console.error("[v0] Analytics API error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    switch (type) {
      case "call_start":
        const callId = analytics.trackCallStart(data.userId)
        return NextResponse.json({ callId })

      case "call_latency":
        analytics.trackCallLatency(data.callId, data.phase, data.duration)
        return NextResponse.json({ success: true })

      case "call_end":
        analytics.trackCallEnd(data.callId, data.outcome, data.urgency, data.quality)
        return NextResponse.json({ success: true })

      case "user_activation":
        analytics.trackUserActivation(data.userId)
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: "Invalid analytics event type" }, { status: 400 })
    }
  } catch (error) {
    console.error("[v0] Analytics tracking error:", error)
    return NextResponse.json({ error: "Failed to track analytics event" }, { status: 500 })
  }
}
