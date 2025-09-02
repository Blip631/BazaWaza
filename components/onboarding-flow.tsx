"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Phone, ArrowRight, ArrowLeft, CheckCircle, Copy, ExternalLink } from "lucide-react"
import { DemoWidget } from "@/components/demo-widget"

interface BusinessDetails {
  businessName: string
  mobileNumber: string
  trade: string
}

const trades = [
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
  { value: "hvac", label: "HVAC" },
  { value: "general", label: "General Contracting" },
  { value: "other", label: "Other Home Services" },
]

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState<"welcome" | "demo" | "details" | "number" | "forwarding">("welcome")
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails>({
    businessName: "",
    mobileNumber: "",
    trade: "",
  })
  const [assignedNumber, setAssignedNumber] = useState<string>("")

  const handleStartTrial = () => {
    setCurrentStep("details")
  }

  const handleWatchDemo = () => {
    setCurrentStep("demo")
  }

  const handleDetailsSubmit = () => {
    // Simulate number assignment
    const numbers = ["(555) 123-4567", "(555) 987-6543", "(555) 456-7890"]
    const randomNumber = numbers[Math.floor(Math.random() * numbers.length)]
    setAssignedNumber(randomNumber)
    setCurrentStep("number")
  }

  const handleNumberConfirm = () => {
    setCurrentStep("forwarding")
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (currentStep === "welcome") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-border">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">Welcome to BazaWaza</CardTitle>
              <CardDescription className="text-base">
                Your AI-powered voice assistant that never misses a lead
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="bg-card border border-border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">The Problem</h3>
                  <p className="text-sm text-muted-foreground">
                    Missing 5-10 calls daily while on jobs = lost revenue and unprofessional image
                  </p>
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <h3 className="font-semibold mb-2 text-primary">The Solution</h3>
                  <p className="text-sm text-muted-foreground">
                    24/7 AI assistant that captures every lead and sends instant SMS summaries
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Button onClick={handleWatchDemo} variant="outline" className="w-full bg-transparent" size="lg">
                  Watch Demo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button onClick={handleStartTrial} className="w-full" size="lg">
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Setup takes less than 2 minutes • No credit card required
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (currentStep === "demo") {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <Button onClick={() => setCurrentStep("welcome")} variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">See BazaWaza in Action</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience how our AI handles real customer calls and delivers instant lead summaries
            </p>
          </div>

          <DemoWidget />

          <div className="text-center mt-12">
            <Button onClick={handleStartTrial} size="lg" className="text-lg px-8">
              Ready to Start Your Free Trial?
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (currentStep === "details") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <Button onClick={() => setCurrentStep("welcome")} variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Badge variant="secondary">Step 1 of 3</Badge>
              </div>
              <CardTitle>Business Details</CardTitle>
              <CardDescription>Tell us about your business so we can customize your AI assistant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    placeholder="Mike's Plumbing"
                    value={businessDetails.businessName}
                    onChange={(e) => setBusinessDetails((prev) => ({ ...prev, businessName: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="mobileNumber">Your Mobile Number</Label>
                  <Input
                    id="mobileNumber"
                    placeholder="(555) 123-4567"
                    value={businessDetails.mobileNumber}
                    onChange={(e) => setBusinessDetails((prev) => ({ ...prev, mobileNumber: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">We'll send lead summaries to this number</p>
                </div>

                <div>
                  <Label htmlFor="trade">Primary Trade</Label>
                  <Select
                    value={businessDetails.trade}
                    onValueChange={(value) => setBusinessDetails((prev) => ({ ...prev, trade: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your trade" />
                    </SelectTrigger>
                    <SelectContent>
                      {trades.map((trade) => (
                        <SelectItem key={trade.value} value={trade.value}>
                          {trade.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    This helps our AI understand your specific terminology
                  </p>
                </div>
              </div>

              <Button
                onClick={handleDetailsSubmit}
                className="w-full"
                size="lg"
                disabled={!businessDetails.businessName || !businessDetails.mobileNumber || !businessDetails.trade}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (currentStep === "number") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <Button onClick={() => setCurrentStep("details")} variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Badge variant="secondary">Step 2 of 3</Badge>
              </div>
              <CardTitle>Your BazaWaza Number</CardTitle>
              <CardDescription>We've assigned you a dedicated phone number for your AI assistant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-4">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div className="text-2xl font-bold text-primary mb-2">{assignedNumber}</div>
                  <Button
                    onClick={() => copyToClipboard(assignedNumber)}
                    variant="ghost"
                    size="sm"
                    className="text-primary"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Number
                  </Button>
                </div>

                <div className="bg-card border border-border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">What happens next?</h3>
                  <p className="text-sm text-muted-foreground">
                    You'll forward your existing business number to this BazaWaza number. All calls will be handled by
                    your AI assistant, and you'll receive instant SMS summaries.
                  </p>
                </div>
              </div>

              <Button onClick={handleNumberConfirm} className="w-full" size="lg">
                Continue to Setup
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (currentStep === "forwarding") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <Button onClick={() => setCurrentStep("number")} variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Badge variant="secondary">Step 3 of 3</Badge>
              </div>
              <CardTitle>Setup Call Forwarding</CardTitle>
              <CardDescription>Forward your business calls to activate your AI assistant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <CheckCircle className="w-5 h-5 text-accent mr-2" />
                    iPhone Instructions
                  </h3>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Open Settings → Phone → Call Forwarding</li>
                    <li>Turn on Call Forwarding</li>
                    <li>Enter your BazaWaza number: {assignedNumber}</li>
                    <li>Tap Back to save</li>
                  </ol>
                </div>

                <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <CheckCircle className="w-5 h-5 text-accent mr-2" />
                    Android Instructions
                  </h3>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Open Phone app → Menu → Settings</li>
                    <li>Tap Call forwarding → Always forward</li>
                    <li>Enter your BazaWaza number: {assignedNumber}</li>
                    <li>Tap Enable</li>
                  </ol>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <h3 className="font-semibold mb-2 text-primary">Need Help?</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Contact your carrier or check their website for specific forwarding instructions.
                  </p>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Carrier Support Links
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Button className="w-full" size="lg">
                  I've Set Up Forwarding
                  <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  I'll Do This Later
                </Button>
              </div>

              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Your AI assistant is ready! Test it by calling your business number.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return null
}
