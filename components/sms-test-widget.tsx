"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Send, Loader2 } from "lucide-react"

export function SMSTestWidget() {
  const [selectedScenario, setSelectedScenario] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)

  const scenarios = [
    { value: "emergency", label: "Emergency SMS", description: "High urgency kitchen flood" },
    { value: "transfer", label: "Transfer Request SMS", description: "Customer wanted human agent" },
    { value: "vague", label: "Vague Description SMS", description: "Unclear problem details" },
  ]

  const handleTestSMS = async () => {
    if (!selectedScenario) return

    setIsLoading(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/test-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scenario: selectedScenario }),
      })

      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      console.error("Test SMS failed:", error)
      setTestResult({ error: "Test SMS failed" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-accent" />
          SMS Notification Test
        </CardTitle>
        <CardDescription>Test the SMS notification system with different lead scenarios</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">SMS Scenario</label>
          <Select value={selectedScenario} onValueChange={setSelectedScenario}>
            <SelectTrigger>
              <SelectValue placeholder="Select a scenario to test" />
            </SelectTrigger>
            <SelectContent>
              {scenarios.map((scenario) => (
                <SelectItem key={scenario.value} value={scenario.value}>
                  <div>
                    <div className="font-medium">{scenario.label}</div>
                    <div className="text-xs text-muted-foreground">{scenario.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleTestSMS} disabled={!selectedScenario || isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending SMS...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Test SMS Notification
            </>
          )}
        </Button>

        {testResult && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">SMS Test Result</h4>
            {testResult.error ? (
              <Badge variant="destructive">{testResult.error}</Badge>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={testResult.smsResult?.success ? "default" : "destructive"}>
                    {testResult.smsResult?.success ? "SMS Sent" : "SMS Failed"}
                  </Badge>
                  <Badge variant="outline">Scenario: {testResult.scenario}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Attempts: {testResult.smsResult?.attempts || 0}
                  {testResult.smsResult?.messageId && ` | Message ID: ${testResult.smsResult.messageId}`}
                </div>
                {testResult.smsResult?.error && (
                  <div className="text-sm text-destructive">Error: {testResult.smsResult.error}</div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
