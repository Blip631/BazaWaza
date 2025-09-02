"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, Phone, MapPin, User } from "lucide-react"
import { DemoTTSService } from "@/lib/demo-tts-service"

interface DemoScenario {
  id: string
  title: string
  description: string
  urgency: "high" | "medium" | "low"
  transcript: Array<{ speaker: "caller" | "ai"; text: string; timestamp: number }>
  smsData: {
    callerName: string
    callerNumber: string
    address: string
    problem: string
    flags: string[]
  }
}

const demoScenarios: DemoScenario[] = [
  {
    id: "emergency",
    title: "Emergency Call (High Urgency)",
    description: "Panicked homeowner with a flooded kitchen",
    urgency: "high",
    transcript: [
      {
        speaker: "ai",
        text: "Hello, this is BazaWaza AI assistant for Mike's Plumbing. How can I help you today?",
        timestamp: 0,
      },
      {
        speaker: "caller",
        text: "Oh thank God someone answered! My kitchen is flooding! Water is everywhere!",
        timestamp: 3000,
      },
      {
        speaker: "ai",
        text: "I understand this is urgent. Let me help you right away. First, do you know where your main water shut-off valve is?",
        timestamp: 6000,
      },
      { speaker: "caller", text: "Yes, I think so - it's in the basement. Should I turn it off?", timestamp: 9000 },
      {
        speaker: "ai",
        text: "Yes, please turn off the main water supply immediately. Can you give me your address so Mike can get there as soon as possible?",
        timestamp: 12000,
      },
      {
        speaker: "caller",
        text: "It's 123 Oak Street. This is Sarah Johnson. My number is 555-0123.",
        timestamp: 15000,
      },
      {
        speaker: "ai",
        text: "Perfect Sarah. I'm sending Mike your details right now and he'll call you back within 5 minutes. Keep that water turned off.",
        timestamp: 18000,
      },
    ],
    smsData: {
      callerName: "Sarah Johnson",
      callerNumber: "555-0123",
      address: "123 Oak Street",
      problem: "Kitchen flooding - water everywhere",
      flags: ["!! URGENT: KITCHEN FLOOD"],
    },
  },
  {
    id: "vague",
    title: "Vague Electrical Issue",
    description: "Confused user describing flickering lights and buzzing sound",
    urgency: "medium",
    transcript: [
      {
        speaker: "ai",
        text: "Hello, this is BazaWaza AI assistant for Tom's Electric. How can I help you today?",
        timestamp: 0,
      },
      { speaker: "caller", text: "Hi, um, I'm having some weird electrical problems at my house.", timestamp: 3000 },
      {
        speaker: "ai",
        text: "I can help with that. Can you describe what's happening? Is it related to your lights, power outlets, or the main electrical panel?",
        timestamp: 6000,
      },
      {
        speaker: "caller",
        text: "Well, the lights keep flickering and there's this weird buzzing sound coming from somewhere.",
        timestamp: 9000,
      },
      {
        speaker: "ai",
        text: "That's helpful. Is the buzzing coming from a specific room, or does it seem to be from the electrical panel? And are all lights flickering or just certain ones?",
        timestamp: 12000,
      },
      {
        speaker: "caller",
        text: "It's mostly the kitchen lights, and the buzzing might be from the panel? I'm not really sure. This is Bob Miller at 456 Pine Avenue.",
        timestamp: 15000,
      },
      {
        speaker: "ai",
        text: "Thanks Bob. I'll have Tom call you back to discuss this further. Your number is 555-0456, correct?",
        timestamp: 18000,
      },
      { speaker: "caller", text: "Yes, that's right. When do you think he can come out?", timestamp: 21000 },
    ],
    smsData: {
      callerName: "Bob Miller",
      callerNumber: "555-0456",
      address: "456 Pine Avenue",
      problem: "Kitchen lights flickering, buzzing sound from electrical panel",
      flags: ["⚠ VAGUE DESCRIPTION"],
    },
  },
  {
    id: "transfer",
    title: "Transfer Request",
    description: "Impatient user requesting to speak with a human",
    urgency: "low",
    transcript: [
      {
        speaker: "ai",
        text: "Hello, this is BazaWaza AI assistant for Dave's HVAC. How can I help you today?",
        timestamp: 0,
      },
      { speaker: "caller", text: "Yeah, my air conditioner isn't working right.", timestamp: 3000 },
      {
        speaker: "ai",
        text: "I can help you with that. Can you tell me what's happening with your AC unit? Is it not turning on, not cooling properly, or making unusual noises?",
        timestamp: 6000,
      },
      {
        speaker: "caller",
        text: "Look, this is too complicated. I don't want to talk to a robot. Just connect me to a real person.",
        timestamp: 9000,
      },
      {
        speaker: "ai",
        text: "I completely understand. Let me connect you with Dave right away. He's currently on a job site, so I'll have him call you back within 15 minutes. Can I get your name and number?",
        timestamp: 12000,
      },
      { speaker: "caller", text: "It's Linda Thompson, 555-0789. And I'm at 789 Maple Drive.", timestamp: 15000 },
      {
        speaker: "ai",
        text: "Perfect Linda. Dave will call you back at 555-0789 within 15 minutes to discuss your AC issue.",
        timestamp: 18000,
      },
    ],
    smsData: {
      callerName: "Linda Thompson",
      callerNumber: "555-0789",
      address: "789 Maple Drive",
      problem: "AC not working properly - customer requested human contact",
      flags: ["➡ TRANSFER REQUEST"],
    },
  },
]

const voiceOptions = [
  { id: "professional", name: "Professional & Efficient", description: "Clear, direct, business-focused" },
  { id: "warm", name: "Warm & Reassuring", description: "Friendly, empathetic, calming" },
  { id: "casual", name: "Friendly & Casual", description: "Relaxed, conversational, approachable" },
]

export function DemoWidget() {
  const [selectedScenario, setSelectedScenario] = useState<string>("emergency")
  const [selectedVoice, setSelectedVoice] = useState<string>("professional")
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [currentTranscriptIndex, setCurrentTranscriptIndex] = useState(0)
  const [audioSegments, setAudioSegments] = useState<any[]>([])
  const [isLoadingAudio, setIsLoadingAudio] = useState(false)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const scenario = demoScenarios.find((s) => s.id === selectedScenario)!
  const currentTranscript = scenario.transcript.slice(0, currentTranscriptIndex + 1)
  const totalDuration = scenario.transcript[scenario.transcript.length - 1]?.timestamp + 3000 || 24000

  useEffect(() => {
    const loadAudio = async () => {
      if (!scenario) return

      setIsLoadingAudio(true)
      try {
        console.log(`[v0] Loading audio for ${scenario.id} with ${selectedVoice} voice style`)
        const audioData = await DemoTTSService.generateScenarioAudio(
          scenario.id,
          scenario.transcript,
          selectedVoice as "professional" | "warm" | "casual",
        )
        setAudioSegments(audioData.segments)
        console.log(`[v0] Audio loaded successfully: ${audioData.segments.length} segments`)
      } catch (error) {
        console.error("[v0] Failed to load audio:", error)
        setAudioSegments([]) // Fallback to visual-only mode
      } finally {
        setIsLoadingAudio(false)
      }
    }

    loadAudio()
  }, [selectedScenario, selectedVoice, scenario])

  useEffect(() => {
    if (isPlaying && audioSegments.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const newTime = prev + 100

          const nextIndex = scenario.transcript.findIndex((item) => item.timestamp > newTime)
          const currentIndex = nextIndex === -1 ? scenario.transcript.length - 1 : nextIndex - 1

          if (currentIndex !== currentTranscriptIndex && currentIndex >= 0) {
            setCurrentTranscriptIndex(currentIndex)
            playAudioSegment(currentIndex)
          }

          if (newTime >= totalDuration) {
            setIsPlaying(false)
            stopCurrentAudio()
            return totalDuration
          }
          return newTime
        })
      }, 100)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (!isPlaying) {
        stopCurrentAudio()
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, scenario, totalDuration, audioSegments, currentTranscriptIndex])

  const playAudioSegment = (segmentIndex: number) => {
    if (audioSegments[segmentIndex]) {
      stopCurrentAudio()

      const audio = new Audio(audioSegments[segmentIndex].audioUrl)
      audio.volume = 0.8

      audio.play().catch((error) => {
        console.error("[v0] Audio playback failed:", error)
      })

      setCurrentAudio(audio)
      console.log(`[v0] Playing audio segment ${segmentIndex}: ${audioSegments[segmentIndex].speaker}`)
    }
  }

  const stopCurrentAudio = () => {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
      setCurrentAudio(null)
    }
  }

  const handlePlayPause = () => {
    if (currentTime >= totalDuration) {
      setCurrentTime(0)
      setCurrentTranscriptIndex(0)
      stopCurrentAudio()
    }
    setIsPlaying(!isPlaying)
    console.log(`[v0] Demo ${isPlaying ? "paused" : "started"} - Audio segments available: ${audioSegments.length > 0}`)
  }

  const handleScenarioChange = (scenarioId: string) => {
    setSelectedScenario(scenarioId)
    setIsPlaying(false)
    setCurrentTime(0)
    setCurrentTranscriptIndex(0)
    stopCurrentAudio()
    console.log(`[v0] Scenario changed to: ${scenarioId}`)
  }

  const handleVoiceChange = (voiceStyle: string) => {
    setSelectedVoice(voiceStyle)
    setIsPlaying(false)
    setCurrentTime(0)
    setCurrentTranscriptIndex(0)
    stopCurrentAudio()
    console.log(`[v0] AI voice style changed to: ${voiceStyle}`)
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    return `${minutes}:${(seconds % 60).toString().padStart(2, "0")}`
  }

  const progressPercentage = (currentTime / totalDuration) * 100

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Demo Controls */}
        <div className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-primary" />
                Interactive Demo
                {isLoadingAudio && <span className="text-sm text-muted-foreground">(Loading audio...)</span>}
              </CardTitle>
              <CardDescription>Experience how BazaWaza handles real customer calls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Voice Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">AI Voice Style</label>
                <Select value={selectedVoice} onValueChange={handleVoiceChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {voiceOptions.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        <div>
                          <div className="font-medium">{voice.name}</div>
                          <div className="text-xs text-muted-foreground">{voice.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Voice style affects only the AI assistant. Customer voices remain consistent.
                </p>
              </div>

              {/* Scenario Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Demo Scenario</label>
                <div className="space-y-2">
                  {demoScenarios.map((scenario) => (
                    <button
                      key={scenario.id}
                      onClick={() => handleScenarioChange(scenario.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedScenario === scenario.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{scenario.title}</span>
                        <Badge
                          variant={
                            scenario.urgency === "high"
                              ? "destructive"
                              : scenario.urgency === "medium"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {scenario.urgency}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{scenario.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Audio Player */}
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-4 mb-4">
                  <Button
                    onClick={handlePlayPause}
                    size="lg"
                    className="w-12 h-12 rounded-full p-0"
                    data-demo-play
                    disabled={isLoadingAudio}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm text-muted-foreground mb-1">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(totalDuration)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-100"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {currentTranscript.map((item, index) => (
                    <div
                      key={index}
                      className={`flex gap-2 text-sm ${item.speaker === "ai" ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[80%] p-2 rounded-lg ${
                          item.speaker === "ai"
                            ? "bg-primary/10 text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <div className="font-medium text-xs mb-1 flex items-center gap-1">
                          {item.speaker === "ai" ? "BazaWaza AI" : "Caller"}
                          {audioSegments.length > 0 && <span className="text-green-500">🔊</span>}
                        </div>
                        {item.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SMS Mockup */}
        <div className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-accent" />
                Live SMS Summary
              </CardTitle>
              <CardDescription>See the instant lead summary sent to your phone</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-card border-2 border-border rounded-3xl p-4 max-w-sm mx-auto">
                <div className="bg-background rounded-2xl p-4 space-y-4">
                  <div className="flex items-center gap-3 pb-2 border-b border-border">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Phone className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">BazaWaza</div>
                      <div className="text-xs text-muted-foreground">Now</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-primary/10 rounded-lg p-3">
                      <div className="font-bold text-primary mb-2">New Lead</div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {scenario.smsData.flags.map((flag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {flag}
                          </Badge>
                        ))}
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{scenario.smsData.callerName}</span>
                          <Button variant="link" size="sm" className="p-0 h-auto text-accent">
                            Call
                          </Button>
                        </div>

                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{scenario.smsData.callerNumber}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{scenario.smsData.address}</span>
                          <Button variant="link" size="sm" className="p-0 h-auto text-accent">
                            Maps
                          </Button>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-border">
                        <div className="text-sm">
                          <span className="font-medium">Problem: </span>
                          {scenario.smsData.problem}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="flex-1">
                          Call Back
                        </Button>
                        <Button variant="outline" size="sm">
                          Recording
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
