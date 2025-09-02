import { nanoid } from "nanoid"

export interface CallMetrics {
  callId: string
  userId: string
  startTime: number
  endTime?: number
  sttDuration?: number
  nluResponseTime?: number
  ttsTimeToFirstByte?: number
  totalLatency?: number
  callOutcome: "completed" | "transferred" | "failed"
  urgencyLevel: "low" | "medium" | "high" | "emergency"
  leadQuality: "qualified" | "unqualified" | "vague"
}

export interface UserMetrics {
  userId: string
  signupDate: number
  activationDate?: number // When they forwarded their number
  lastActiveDate: number
  totalCalls: number
  qualifiedLeads: number
  retentionStatus: "active" | "churned" | "at_risk"
}

export interface SystemMetrics {
  timestamp: number
  activeUsers: number
  totalCallsToday: number
  averageLatency: number
  systemUptime: number
  errorRate: number
}

class AnalyticsService {
  private metrics: CallMetrics[] = []
  private userMetrics: Map<string, UserMetrics> = new Map()
  private systemMetrics: SystemMetrics[] = []

  trackCallStart(userId: string): string {
    const callId = nanoid()
    const metric: CallMetrics = {
      callId,
      userId,
      startTime: Date.now(),
      callOutcome: "completed",
      urgencyLevel: "low",
      leadQuality: "qualified",
    }
    this.metrics.push(metric)
    return callId
  }

  trackCallLatency(callId: string, phase: "stt" | "nlu" | "tts", duration: number) {
    const metric = this.metrics.find((m) => m.callId === callId)
    if (!metric) return

    switch (phase) {
      case "stt":
        metric.sttDuration = duration
        break
      case "nlu":
        metric.nluResponseTime = duration
        break
      case "tts":
        metric.ttsTimeToFirstByte = duration
        break
    }

    // Calculate total latency
    if (metric.sttDuration && metric.nluResponseTime && metric.ttsTimeToFirstByte) {
      metric.totalLatency = metric.sttDuration + metric.nluResponseTime + metric.ttsTimeToFirstByte
    }
  }

  trackCallEnd(
    callId: string,
    outcome: CallMetrics["callOutcome"],
    urgency: CallMetrics["urgencyLevel"],
    quality: CallMetrics["leadQuality"],
  ) {
    const metric = this.metrics.find((m) => m.callId === callId)
    if (!metric) return

    metric.endTime = Date.now()
    metric.callOutcome = outcome
    metric.urgencyLevel = urgency
    metric.leadQuality = quality

    // Update user metrics
    this.updateUserMetrics(metric.userId, quality === "qualified")
  }

  private updateUserMetrics(userId: string, wasQualifiedLead: boolean) {
    let userMetric = this.userMetrics.get(userId)
    if (!userMetric) {
      userMetric = {
        userId,
        signupDate: Date.now(),
        lastActiveDate: Date.now(),
        totalCalls: 0,
        qualifiedLeads: 0,
        retentionStatus: "active",
      }
      this.userMetrics.set(userId, userMetric)
    }

    userMetric.totalCalls++
    userMetric.lastActiveDate = Date.now()
    if (wasQualifiedLead) {
      userMetric.qualifiedLeads++
    }

    // Update retention status
    const daysSinceLastActive = (Date.now() - userMetric.lastActiveDate) / (1000 * 60 * 60 * 24)
    if (daysSinceLastActive > 30) {
      userMetric.retentionStatus = "churned"
    } else if (daysSinceLastActive > 7) {
      userMetric.retentionStatus = "at_risk"
    } else {
      userMetric.retentionStatus = "active"
    }
  }

  trackUserActivation(userId: string) {
    const userMetric = this.userMetrics.get(userId)
    if (userMetric && !userMetric.activationDate) {
      userMetric.activationDate = Date.now()
    }
  }

  getCallMetrics(userId?: string, timeRange?: { start: number; end: number }) {
    let filteredMetrics = this.metrics

    if (userId) {
      filteredMetrics = filteredMetrics.filter((m) => m.userId === userId)
    }

    if (timeRange) {
      filteredMetrics = filteredMetrics.filter((m) => m.startTime >= timeRange.start && m.startTime <= timeRange.end)
    }

    return filteredMetrics
  }

  getPerformanceStats(timeRange?: { start: number; end: number }) {
    const metrics = this.getCallMetrics(undefined, timeRange)
    const completedCalls = metrics.filter((m) => m.totalLatency)

    if (completedCalls.length === 0) {
      return {
        averageLatency: 0,
        latencyP95: 0,
        latencyP99: 0,
        callsUnderTarget: 0,
        totalCalls: metrics.length,
      }
    }

    const latencies = completedCalls.map((m) => m.totalLatency!).sort((a, b) => a - b)
    const averageLatency = latencies.reduce((sum, l) => sum + l, 0) / latencies.length
    const p95Index = Math.floor(latencies.length * 0.95)
    const p99Index = Math.floor(latencies.length * 0.99)
    const callsUnderTarget = latencies.filter((l) => l < 500).length

    return {
      averageLatency: Math.round(averageLatency),
      latencyP95: latencies[p95Index] || 0,
      latencyP99: latencies[p99Index] || 0,
      callsUnderTarget,
      totalCalls: metrics.length,
      targetPercentage: Math.round((callsUnderTarget / latencies.length) * 100),
    }
  }

  getUserStats() {
    const users = Array.from(this.userMetrics.values())
    const now = Date.now()
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000
    const fortyEightHoursAgo = now - 48 * 60 * 60 * 1000

    const activatedUsers = users.filter((u) => u.activationDate).length
    const totalUsers = users.length
    const activationRate = totalUsers > 0 ? Math.round((activatedUsers / totalUsers) * 100) : 0

    const activeUsers = users.filter((u) => u.retentionStatus === "active").length
    const retentionRate = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0

    const recentSignups = users.filter((u) => u.signupDate > fortyEightHoursAgo).length
    const activatedRecently = users.filter(
      (u) => u.signupDate > fortyEightHoursAgo && u.activationDate && u.activationDate <= fortyEightHoursAgo,
    ).length

    return {
      totalUsers,
      activatedUsers,
      activationRate,
      activeUsers,
      retentionRate,
      recentSignups,
      activatedRecently,
      averageCallsPerUser:
        totalUsers > 0 ? Math.round(users.reduce((sum, u) => sum + u.totalCalls, 0) / totalUsers) : 0,
    }
  }

  recordSystemMetrics() {
    const now = Date.now()
    const last24Hours = now - 24 * 60 * 60 * 1000
    const recentCalls = this.metrics.filter((m) => m.startTime > last24Hours)
    const failedCalls = recentCalls.filter((m) => m.callOutcome === "failed")

    const systemMetric: SystemMetrics = {
      timestamp: now,
      activeUsers: Array.from(this.userMetrics.values()).filter((u) => u.retentionStatus === "active").length,
      totalCallsToday: recentCalls.length,
      averageLatency: this.getPerformanceStats({ start: last24Hours, end: now }).averageLatency,
      systemUptime: 99.9, // Mock uptime
      errorRate: recentCalls.length > 0 ? (failedCalls.length / recentCalls.length) * 100 : 0,
    }

    this.systemMetrics.push(systemMetric)

    // Keep only last 7 days of system metrics
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000
    this.systemMetrics = this.systemMetrics.filter((m) => m.timestamp > sevenDaysAgo)
  }

  getSystemHealth() {
    if (this.systemMetrics.length === 0) {
      this.recordSystemMetrics()
    }

    const latest = this.systemMetrics[this.systemMetrics.length - 1]
    const trend = this.systemMetrics.slice(-24) // Last 24 hours

    return {
      current: latest,
      trend: trend.map((m) => ({
        timestamp: m.timestamp,
        latency: m.averageLatency,
        calls: m.totalCallsToday,
        errors: m.errorRate,
      })),
    }
  }
}

export const analytics = new AnalyticsService()

export function logPerformance(operation: string, startTime: number, metadata?: Record<string, any>) {
  const duration = Date.now() - startTime
  console.log(`[v0] Performance: ${operation} took ${duration}ms`, metadata)

  // In production, this would send to monitoring service
  if (typeof window !== "undefined") {
    // Client-side performance tracking
    if ("performance" in window && "mark" in window.performance) {
      window.performance.mark(`${operation}-end`)
      window.performance.measure(operation, `${operation}-start`, `${operation}-end`)
    }
  }

  return duration
}

export function startPerformanceTimer(operation: string) {
  if (typeof window !== "undefined" && "performance" in window && "mark" in window.performance) {
    window.performance.mark(`${operation}-start`)
  }
  return Date.now()
}
