"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, TrendingUp, TrendingDown, Clock, Users, Phone, AlertTriangle } from "lucide-react"

interface AnalyticsData {
  performance: {
    averageLatency: number
    latencyP95: number
    latencyP99: number
    callsUnderTarget: number
    totalCalls: number
    targetPercentage: number
  }
  users: {
    totalUsers: number
    activatedUsers: number
    activationRate: number
    activeUsers: number
    retentionRate: number
    recentSignups: number
    activatedRecently: number
    averageCallsPerUser: number
  }
  system: {
    current: {
      timestamp: number
      activeUsers: number
      totalCallsToday: number
      averageLatency: number
      systemUptime: number
      errorRate: number
    }
    trend: Array<{
      timestamp: number
      latency: number
      calls: number
      errors: number
    }>
  }
  recentCalls: Array<{
    callId: string
    userId: string
    startTime: number
    endTime?: number
    totalLatency?: number
    callOutcome: string
    urgencyLevel: string
    leadQuality: string
  }>
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/analytics")
      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error("[v0] Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading analytics...
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No analytics data available</p>
        <Button onClick={fetchAnalytics} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Monitor system performance and user metrics</p>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">Last updated: {lastUpdated.toLocaleTimeString()}</p>
          )}
          <Button onClick={fetchAnalytics} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Latency</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.performance.averageLatency}ms</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {data.performance.averageLatency < 500 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-500">Under target</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  <span className="text-red-500">Above target</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.users.activeUsers}</div>
            <p className="text-xs text-muted-foreground">{data.users.retentionRate}% retention rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calls Today</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.system.current.totalCallsToday}</div>
            <p className="text-xs text-muted-foreground">{data.users.averageCallsPerUser} avg per user</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.system.current.systemUptime}%</div>
            <p className="text-xs text-muted-foreground">{data.system.current.errorRate.toFixed(1)}% error rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="calls">Recent Calls</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Latency Distribution</CardTitle>
                <CardDescription>Call processing performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average Latency</span>
                  <Badge variant={data.performance.averageLatency < 500 ? "default" : "destructive"}>
                    {data.performance.averageLatency}ms
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">95th Percentile</span>
                  <Badge variant="outline">{data.performance.latencyP95}ms</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">99th Percentile</span>
                  <Badge variant="outline">{data.performance.latencyP99}ms</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Calls Under 500ms Target</span>
                  <Badge variant="secondary">
                    {data.performance.callsUnderTarget}/{data.performance.totalCalls} (
                    {data.performance.targetPercentage}%)
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Real-time system health</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">System Uptime</span>
                  <Badge variant="default">{data.system.current.systemUptime}%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Error Rate</span>
                  <Badge variant={data.system.current.errorRate < 1 ? "default" : "destructive"}>
                    {data.system.current.errorRate.toFixed(2)}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Users</span>
                  <Badge variant="outline">{data.system.current.activeUsers}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>User Metrics</CardTitle>
                <CardDescription>User acquisition and retention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Users</span>
                  <Badge variant="outline">{data.users.totalUsers}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Activated Users</span>
                  <Badge variant="default">{data.users.activatedUsers}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Activation Rate</span>
                  <Badge variant={data.users.activationRate > 70 ? "default" : "secondary"}>
                    {data.users.activationRate}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Retention Rate</span>
                  <Badge variant={data.users.retentionRate > 80 ? "default" : "secondary"}>
                    {data.users.retentionRate}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Last 48 hours</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">New Signups</span>
                  <Badge variant="outline">{data.users.recentSignups}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Recently Activated</span>
                  <Badge variant="default">{data.users.activatedRecently}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Avg Calls per User</span>
                  <Badge variant="secondary">{data.users.averageCallsPerUser}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Calls</CardTitle>
              <CardDescription>Last 10 processed calls</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.recentCalls.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No recent calls</p>
                ) : (
                  data.recentCalls.map((call) => (
                    <div key={call.callId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {call.callId.slice(0, 8)}
                          </Badge>
                          <Badge
                            variant={
                              call.urgencyLevel === "emergency"
                                ? "destructive"
                                : call.urgencyLevel === "high"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {call.urgencyLevel}
                          </Badge>
                          <Badge
                            variant={
                              call.leadQuality === "qualified"
                                ? "default"
                                : call.leadQuality === "vague"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {call.leadQuality}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{new Date(call.startTime).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {call.totalLatency ? `${call.totalLatency}ms` : "Processing..."}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">{call.callOutcome}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
