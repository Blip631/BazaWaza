"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import {
  Phone,
  Clock,
  Play,
  MapPin,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  LogOut,
} from "lucide-react"

interface Lead {
  id: string
  callerName: string
  callerNumber: string
  address: string
  problem: string
  timestamp: string
  urgency: "high" | "medium" | "low"
  status: "new" | "contacted" | "completed"
  flags: string[]
  recordingUrl?: string
}

const mockLeads: Lead[] = [
  {
    id: "1",
    callerName: "Sarah Johnson",
    callerNumber: "555-0123",
    address: "123 Oak Street",
    problem: "Kitchen flooding - water everywhere",
    timestamp: "2025-01-09T10:30:00Z",
    urgency: "high",
    status: "new",
    flags: ["!! URGENT: KITCHEN FLOOD"],
    recordingUrl: "#",
  },
  {
    id: "2",
    callerName: "Bob Miller",
    callerNumber: "555-0456",
    address: "456 Pine Avenue",
    problem: "Kitchen lights flickering, buzzing sound from electrical panel",
    timestamp: "2025-01-09T09:15:00Z",
    urgency: "medium",
    status: "contacted",
    flags: ["⚠ VAGUE DESCRIPTION"],
    recordingUrl: "#",
  },
  {
    id: "3",
    callerName: "Linda Thompson",
    callerNumber: "555-0789",
    address: "789 Maple Drive",
    problem: "AC not working properly - customer requested human contact",
    timestamp: "2025-01-09T08:45:00Z",
    urgency: "low",
    status: "completed",
    flags: ["➡ TRANSFER REQUEST"],
    recordingUrl: "#",
  },
]

export function Dashboard() {
  const [currentStatus, setCurrentStatus] = useState<"available" | "busy">("available")
  const [businessHours, setBusinessHours] = useState({
    start: "08:00",
    end: "18:00",
    timezone: "EST",
  })

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "text-accent"
      case "contacted":
        return "text-yellow-500"
      case "completed":
        return "text-green-500"
      default:
        return "text-muted-foreground"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return <AlertTriangle className="w-4 h-4" />
      case "contacted":
        return <Clock className="w-4 h-4" />
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <XCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">BazaWaza</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${currentStatus === "available" ? "bg-green-500" : "bg-red-500"}`}
                />
                <span className="text-sm font-medium capitalize">{currentStatus}</span>
              </div>
              <Button variant="ghost" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Manage your leads and AI assistant settings</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Today's Calls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+3 from yesterday</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">New Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">67% conversion rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Urgent Calls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">2</div>
              <p className="text-xs text-muted-foreground">Require immediate attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0.3s</div>
              <p className="text-xs text-muted-foreground">Average AI response</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="leads" className="space-y-6">
          <TabsList>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="recordings">Recordings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Leads</CardTitle>
                <CardDescription>All leads captured by your AI assistant</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockLeads.map((lead) => (
                    <div key={lead.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className={`flex items-center space-x-1 ${getStatusColor(lead.status)}`}>
                            {getStatusIcon(lead.status)}
                            <span className="text-sm font-medium capitalize">{lead.status}</span>
                          </div>
                          <Badge variant={getUrgencyColor(lead.urgency) as any} className="text-xs">
                            {lead.urgency}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">{formatTime(lead.timestamp)}</div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-3">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{lead.callerName}</span>
                            <Button variant="link" size="sm" className="p-0 h-auto text-accent">
                              Call
                            </Button>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{lead.callerNumber}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{lead.address}</span>
                            <Button variant="link" size="sm" className="p-0 h-auto text-accent">
                              Maps
                            </Button>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm">
                            <span className="font-medium">Problem: </span>
                            {lead.problem}
                          </div>
                        </div>
                      </div>

                      {lead.flags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {lead.flags.map((flag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {flag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <Button size="sm">Mark Contacted</Button>
                          <Button variant="outline" size="sm">
                            <Play className="w-4 h-4 mr-1" />
                            Recording
                          </Button>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Status Control</CardTitle>
                  <CardDescription>Control your AI assistant availability</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="status-toggle">Current Status</Label>
                      <p className="text-sm text-muted-foreground">
                        {currentStatus === "available" ? "Taking calls" : "Not taking calls"}
                      </p>
                    </div>
                    <Switch
                      id="status-toggle"
                      checked={currentStatus === "available"}
                      onCheckedChange={(checked) => setCurrentStatus(checked ? "available" : "busy")}
                    />
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <h4 className="font-medium mb-2">SMS Commands</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Text "BUSY" to your BazaWaza number to go offline</div>
                      <div>Text "AVAILABLE" to go back online</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Business Hours</CardTitle>
                  <CardDescription>Set your standard operating hours</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-time">Start Time</Label>
                      <Input
                        id="start-time"
                        type="time"
                        value={businessHours.start}
                        onChange={(e) => setBusinessHours((prev) => ({ ...prev, start: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-time">End Time</Label>
                      <Input
                        id="end-time"
                        type="time"
                        value={businessHours.end}
                        onChange={(e) => setBusinessHours((prev) => ({ ...prev, end: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={businessHours.timezone}
                      onValueChange={(value) => setBusinessHours((prev) => ({ ...prev, timezone: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EST">Eastern Time (EST)</SelectItem>
                        <SelectItem value="CST">Central Time (CST)</SelectItem>
                        <SelectItem value="MST">Mountain Time (MST)</SelectItem>
                        <SelectItem value="PST">Pacific Time (PST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full">Save Hours</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Your business details and contact info</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="business-name">Business Name</Label>
                    <Input id="business-name" defaultValue="Mike's Plumbing" />
                  </div>
                  <div>
                    <Label htmlFor="mobile-number">Mobile Number</Label>
                    <Input id="mobile-number" defaultValue="(555) 123-4567" />
                  </div>
                  <div>
                    <Label htmlFor="trade">Primary Trade</Label>
                    <Select defaultValue="plumbing">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="plumbing">Plumbing</SelectItem>
                        <SelectItem value="electrical">Electrical</SelectItem>
                        <SelectItem value="hvac">HVAC</SelectItem>
                        <SelectItem value="general">General Contracting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full">Update Account</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>BazaWaza Number</CardTitle>
                  <CardDescription>Your dedicated AI assistant phone number</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-primary mb-2">(555) 123-4567</div>
                    <p className="text-sm text-muted-foreground">Forward your business calls to this number</p>
                  </div>
                  <Button variant="outline" className="w-full bg-transparent">
                    View Forwarding Instructions
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recordings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Call Recordings</CardTitle>
                <CardDescription>Listen to your AI assistant's conversations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{lead.callerName}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatTime(lead.timestamp)} • {lead.callerNumber}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getUrgencyColor(lead.urgency) as any} className="text-xs">
                          {lead.urgency}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Play className="w-4 h-4 mr-1" />
                          Play
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
