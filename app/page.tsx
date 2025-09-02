"use client"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, Clock, MessageSquare, Shield, Zap, Users } from "lucide-react"
import { DemoWidget } from "@/components/demo-widget"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src="/bazawaza-logo.png" alt="BazaWaza Logo" className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold text-foreground">BazaWaza</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-muted-foreground hover:text-accent transition-colors">
                Features
              </a>
              <a href="#demo" className="text-muted-foreground hover:text-accent transition-colors">
                Demo
              </a>
              <a href="#pricing" className="text-muted-foreground hover:text-accent transition-colors">
                Pricing
              </a>
              <Button variant="outline" size="sm">
                Sign In
              </Button>
              <Button size="sm" asChild>
                <Link href="/onboarding">Start Free Trial</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            24/7 AI Voice Assistant
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            Never Miss a Lead
            <span className="text-primary"> Again</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            BazaWaza provides intelligent call handling for home service professionals. Capture every lead, qualify
            customers, and focus on what you do best.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="text-lg px-8 cursor-pointer"
              onClick={() => {
                console.log("[v0] Watch Demo button clicked")
                const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop
                console.log("[v0] Current scroll position BEFORE scroll:", currentScrollTop)

                const demoElement = document.getElementById("demo-content")
                console.log("[v0] Demo element found:", demoElement)
                if (demoElement) {
                  const rect = demoElement.getBoundingClientRect()
                  console.log(
                    "[v0] Demo element position - top:",
                    rect.top,
                    "bottom:",
                    rect.bottom,
                    "height:",
                    rect.height,
                  )
                  console.log("[v0] Viewport height:", window.innerHeight)
                  console.log("[v0] Is element in viewport?", rect.top >= 0 && rect.bottom <= window.innerHeight)

                  console.log("[v0] Using scrollIntoView method")
                  demoElement.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  })

                  setTimeout(() => {
                    const newScrollTop = window.pageYOffset || document.documentElement.scrollTop
                    console.log("[v0] Scroll completed - New scroll position:", newScrollTop)
                    console.log("[v0] Scroll distance moved:", newScrollTop - currentScrollTop)

                    console.log("[v0] Looking for demo play button")
                    const playButton = document.querySelector("[data-demo-play]") as HTMLButtonElement
                    console.log("[v0] Play button found:", playButton)
                    if (playButton && !playButton.disabled) {
                      console.log("[v0] Clicking play button")
                      playButton.click()
                    }
                  }, 1000)
                }
              }}
            >
              Watch Demo
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent" asChild>
              <Link href="/onboarding">Start Free Trial</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">Setup in under 2 minutes • No credit card required</p>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 px-4 bg-card">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-8">The Problem Every Solo Operator Faces</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Missed Calls = Lost Revenue</h3>
              <p className="text-muted-foreground">5-10 missed calls daily while on jobs</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Dangerous Interruptions</h3>
              <p className="text-muted-foreground">Calls during complex or hazardous work</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Wasted Evening Hours</h3>
              <p className="text-muted-foreground">Non-billable time returning unqualified calls</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-32 px-4 scroll-mt-20">
        <div className="container mx-auto">
          <div className="text-center mb-16" id="demo-content">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">See BazaWaza in Action</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience how our AI handles real customer calls and delivers instant lead summaries
            </p>
          </div>
          <DemoWidget />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-card">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Your AI-Powered Front Desk</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              BazaWaza handles every call professionally, qualifies leads, and sends you actionable summaries
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Smart Call Handling</CardTitle>
                <CardDescription>
                  Natural AI conversations that understand your trade and qualify leads automatically
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Instant SMS Summaries</CardTitle>
                <CardDescription>
                  Get formatted lead summaries with caller details, location, and problem description
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Emergency Detection</CardTitle>
                <CardDescription>
                  Automatically identifies urgent situations and prioritizes emergency callbacks
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Smart Transfer</CardTitle>
                <CardDescription>
                  Seamlessly transfers frustrated callers to you when they request a human
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>24/7 Availability</CardTitle>
                <CardDescription>
                  Never miss a call again with round-the-clock professional call handling
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Trade-Specific Logic</CardTitle>
                <CardDescription>
                  Understands plumbing, electrical, and HVAC terminology for accurate triage
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Capture Every Lead?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join hundreds of home service professionals who never miss a call
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="/onboarding">Start Free Trial</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 bg-transparent cursor-pointer"
              onClick={() => {
                console.log("[v0] Watch Demo button clicked (CTA)")
                const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop
                console.log("[v0] CTA - Current scroll position BEFORE scroll:", currentScrollTop)

                const demoElement = document.getElementById("demo-content")
                console.log("[v0] Demo element found:", demoElement)
                if (demoElement) {
                  const rect = demoElement.getBoundingClientRect()
                  console.log(
                    "[v0] CTA - Demo element position - top:",
                    rect.top,
                    "bottom:",
                    rect.bottom,
                    "height:",
                    rect.height,
                  )
                  console.log("[v0] CTA - Viewport height:", window.innerHeight)
                  console.log("[v0] CTA - Is element in viewport?", rect.top >= 0 && rect.bottom <= window.innerHeight)

                  console.log("[v0] CTA - Using scrollIntoView method")
                  demoElement.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  })

                  setTimeout(() => {
                    const newScrollTop = window.pageYOffset || document.documentElement.scrollTop
                    console.log("[v0] CTA - Scroll completed - New scroll position:", newScrollTop)
                    console.log("[v0] CTA - Scroll distance moved:", newScrollTop - currentScrollTop)

                    console.log("[v0] Looking for demo play button")
                    const playButton = document.querySelector("[data-demo-play]") as HTMLButtonElement
                    console.log("[v0] Play button found:", playButton)
                    if (playButton && !playButton.disabled) {
                      console.log("[v0] Clicking play button")
                      playButton.click()
                    }
                  }, 1000)
                }
              }}
            >
              Watch Demo
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">Setup takes less than 2 minutes • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <img src="/bazawaza-logo.png" alt="BazaWaza Logo" className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold">BazaWaza</span>
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-accent transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-accent transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-accent transition-colors">
                Support
              </a>
              <a href="#" className="hover:text-accent transition-colors">
                Contact
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2025 BazaWaza. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
