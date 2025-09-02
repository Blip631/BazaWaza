"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Phone, Play, Loader2 } from "lucide-react"

export function CallTestWidget() {
  const [selectedScenario, setSelectedScenario] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)

  const scenarios = [
    { value: "emergency", label: "Emergency Call", description: "Kitchen flooding scenario" },
    { value: "transfer", label: "Transfer Request", description: "Customer wants human agent" },
    { value: "vague", label: "Vague Description", description: "Unclear electrical issue" },
  ]

  const handleTestCall = async () => {
    if (!selectedScenario) return

    setIsLoading(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/test-call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scenario: selectedScenario }),
      })

      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      console.error("Test call failed:", error)
      setTestResult({ error: "Test call failed" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-primary" />
          Call System Test
        </CardTitle>
        <CardDescription>Test the AI call handling system with different scenarios</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Test Scenario</label>
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

        <Button onClick={handleTestCall} disabled={!selectedScenario || isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing Call...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Test Call Processing
            </>
          )}
        </Button>

        {testResult && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Test Result</h4>
            {testResult.error ? (
              <Badge variant="destructive">{testResult.error}</Badge>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Call ID: {testResult.callSid}</Badge>
                  <Badge variant="outline">Scenario: {testResult.scenario}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Processed {testResult.responses?.length || 0} conversation steps
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
