"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function DemoWidget() {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>BazaWaza AI Demo</CardTitle>
        <CardDescription>Experience our AI-powered customer service</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={() => setIsPlaying(!isPlaying)} className="w-full">
            {isPlaying ? "Stop Demo" : "Start Demo"}
          </Button>
          <div className="text-center text-muted-foreground">
            {isPlaying ? "Demo is running..." : "Click to start the demo"}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
