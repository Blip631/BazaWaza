"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, Phone, MapPin, User, RefreshCw } from "lucide-react"
import { TTSService } from "@/lib/tts-service"

interface DemoScenario {
  id: string
  title: string
  description: string
  urgency: "high" | "medium" | "low"
  audioFile: string // Added audio file path for each scenario
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
    audioFile: "/audio/emergency-call.mp3", // Added audio file path
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
    audioFile: "/audio/vague-electrical.mp3", // Added audio file path
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
    audioFile: "/audio/transfer-request.mp3", // Added audio file path
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
  const [useAudioFallback, setUseAudioFallback] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lastButtonClick, setLastButtonClick] = useState(0)
  const [voicesLoaded, setVoicesLoaded] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false)
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null)
  const [ttsError, setTtsError] = useState<string | null>(null)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null)
  const currentSpeechIndex = useRef<number>(-1)
  const isCleaningUp = useRef<boolean>(false)
  const speechQueueRef = useRef<number[]>([])
  const processingQueueRef = useRef(false)

  const scenario = demoScenarios.find((s) => s.id === selectedScenario)!
  const currentTranscript = scenario.transcript.slice(0, currentTranscriptIndex + 1)
  const totalDuration = scenario.transcript[scenario.transcript.length - 1]?.timestamp + 3000 || 24000

  const generateScenarioAudio = useCallback(async () => {
    if (!scenario) return

    setIsGeneratingTTS(true)
    setTtsError(null)
    console.log("[v0] Generating TTS audio for scenario:", scenario.id)

    try {
      const fullTranscript = scenario.transcript
        .map((item) => `${item.speaker === "ai" ? "AI Assistant" : "Caller"}: ${item.text}`)
        .join("\n\n")

      const ttsResponse = await TTSService.generateTTS({
        text: fullTranscript,
        voice_style: selectedVoice,
        scenario: `${scenario.id}_full_conversation`,
      })

      if (ttsResponse.error === "DEMO_MODE") {
        console.log("[v0] Demo mode detected - using browser speech synthesis")
        setUseAudioFallback(true)
        setTtsError(null)
        // Set a dummy URL to prevent infinite loop
        setGeneratedAudioUrl("demo-mode")
        return
      }

      if (ttsResponse.success && ttsResponse.audioUrl) {
        setGeneratedAudioUrl(ttsResponse.audioUrl)
        setUseAudioFallback(false)
        console.log("[v0] TTS audio generated successfully:", ttsResponse.audioUrl)
      } else {
        throw new Error(ttsResponse.error || "TTS generation failed")
      }
    } catch (error) {
      console.error("[v0] TTS generation error:", error)
      setTtsError(error instanceof Error ? error.message : "Failed to generate audio")
      setUseAudioFallback(true)
    } finally {
      setIsGeneratingTTS(false)
    }
  }, [scenario, selectedVoice])

  useEffect(() => {
    console.log("[v0] Initializing audio for scenario:", selectedScenario)

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    setGeneratedAudioUrl(null)
    setTtsError(null)
    setUseAudioFallback(false)

    const audioSource = generatedAudioUrl || scenario.audioFile
    
    // Skip audio loading if we're in demo mode or already have a generated URL
    if (generatedAudioUrl === "demo-mode") {
      console.log("[v0] Demo mode - skipping audio loading, using speech synthesis")
      setUseAudioFallback(true)
      return
    }
    
    const audio = new Audio(audioSource)
    audioRef.current = audio

    const handleError = () => {
      console.log("[v0] Audio file failed to load:", audioSource)
      if (!generatedAudioUrl && !isGeneratingTTS) {
        console.log("[v0] Attempting to generate TTS audio...")
        generateScenarioAudio()
      } else {
        console.log("[v0] Using speech synthesis fallback")
        setUseAudioFallback(true)
      }
    }

    const handleCanPlay = () => {
      console.log("[v0] Audio file loaded successfully:", audioSource)
      setUseAudioFallback(false)
    }

    audio.addEventListener("error", handleError)
    audio.addEventListener("canplay", handleCanPlay)
    audio.load()

    return () => {
      audio.removeEventListener("error", handleError)
      audio.removeEventListener("canplay", handleCanPlay)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [selectedScenario, scenario.audioFile, generateScenarioAudio, isGeneratingTTS])

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      console.log("[v0] Available voices:", voices.length)
      if (voices.length > 0) {
        setVoicesLoaded(true)
      }
    }

    loadVoices()

    window.speechSynthesis.addEventListener("voiceschanged", loadVoices)

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices)
    }
  }, [])

  const getSpeechVoice = useCallback((speaker: "ai" | "caller", urgency?: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis || !voicesLoaded) {
      console.log("[v0] Speech synthesis not available or voices not loaded")
      return null
    }

    const voices = window.speechSynthesis.getVoices()
    console.log("[v0] Getting voice for", speaker, "from", voices.length, "available voices")

    if (voices.length === 0) return null

    // Different voice selection for AI vs Customer
    if (speaker === "ai") {
      const aiVoiceMap = {
        professional:
          voices.find((v) => v.name.includes("Google US English") || v.name.includes("Microsoft")) || voices[0],
        warm:
          voices.find((v) => v.name.includes("Google UK English Female") || v.name.includes("Samantha")) ||
          voices[1] ||
          voices[0],
        casual:
          voices.find((v) => v.name.includes("Google US English Female") || v.name.includes("Alex")) ||
          voices[2] ||
          voices[0],
      }
      const selectedVoiceObj = aiVoiceMap[selectedVoice as keyof typeof aiVoiceMap] || voices[0]
      console.log("[v0] Selected AI voice:", selectedVoiceObj?.name)
      return selectedVoiceObj
    } else {
      // Customer voice - different from AI
      const customerVoiceMap = {
        emergency: voices.find((v) => v.name.includes("Google US English Male") || v.name.includes("David")) || voices[voices.length - 1] || voices[0],
        normal: voices.find((v) => v.name.includes("Google US English Female") || v.name.includes("Samantha")) || voices[1] || voices[0],
        frustrated: voices.find((v) => v.name.includes("Google US English Male") || v.name.includes("Tom")) || voices[voices.length - 2] || voices[0]
      }
      
      // Select customer voice based on urgency
      let customerVoiceType = "normal"
      if (urgency === "high") customerVoiceType = "emergency"
      if (urgency === "low") customerVoiceType = "frustrated"
      
      const selectedVoiceObj = customerVoiceMap[customerVoiceType as keyof typeof customerVoiceMap] || voices[0]
      console.log("[v0] Selected customer voice:", selectedVoiceObj?.name, "for urgency:", urgency)
      return selectedVoiceObj
    }
  }, [selectedVoice, voicesLoaded])

  const cleanupAudio = useCallback(() => {
    isCleaningUp.current = true

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    speechQueueRef.current = []
    processingQueueRef.current = false
    setIsSpeaking(false)
    currentSpeechIndex.current = -1

    setTimeout(() => {
      isCleaningUp.current = false
    }, 100)
  }, [])

  const processNextSpeech = useCallback(() => {
    if (processingQueueRef.current || speechQueueRef.current.length === 0 || !useAudioFallback || !voicesLoaded) {
      return
    }

    processingQueueRef.current = true
    const transcriptIndex = speechQueueRef.current.shift()!
    const currentItem = scenario.transcript[transcriptIndex]

    if (!currentItem || isCleaningUp.current) {
      processingQueueRef.current = false
      return
    }

    console.log("[v0] Processing speech queue for:", currentItem.speaker, currentItem.text.substring(0, 50) + "...")

    setIsSpeaking(true)

    setTimeout(() => {
      if (isCleaningUp.current) {
        processingQueueRef.current = false
        setIsSpeaking(false)
        return
      }

      const utterance = new window.SpeechSynthesisUtterance(currentItem.text)
      const voice = getSpeechVoice(currentItem.speaker as "ai" | "caller", scenario.urgency)
      if (voice) {
        utterance.voice = voice
      }

      // Enhanced voice settings for better differentiation
      if (currentItem.speaker === "ai") {
        utterance.rate = selectedVoice === "professional" ? 1.0 : selectedVoice === "warm" ? 0.9 : 1.0
        utterance.pitch = selectedVoice === "warm" ? 1.1 : 1.0
        utterance.volume = 1.0
      } else {
        // Customer voice with urgency-based adjustments
        if (scenario.urgency === "high") {
          utterance.rate = 1.1  // Faster for urgency
          utterance.pitch = 0.8  // Lower pitch for seriousness
          utterance.volume = 1.0
        } else if (scenario.urgency === "low") {
          utterance.rate = 0.9   // Slower for calm
          utterance.pitch = 0.9  // Slightly lower pitch
          utterance.volume = 0.9
        } else {
          utterance.rate = 0.95  // Normal rate
          utterance.pitch = 0.9  // Normal pitch
          utterance.volume = 1.0
        }
      }

      utterance.onstart = () => {
        console.log("[v0] Speech started for:", currentItem.speaker)
      }

      utterance.onend = () => {
        console.log("[v0] Speech ended for:", currentItem.speaker)
        setIsSpeaking(false)
        processingQueueRef.current = false
        if (speechQueueRef.current.length > 0) {
          setTimeout(() => processNextSpeech(), 300)
        }
      }

      utterance.onerror = (event) => {
        console.error("[v0] Speech synthesis error:", event.error)
        setIsSpeaking(false)
        processingQueueRef.current = false
      }

      speechRef.current = utterance
      window.speechSynthesis.speak(utterance)
    }, 200)
  }, [scenario.transcript, useAudioFallback, getSpeechVoice, selectedVoice, voicesLoaded])

  const speakCurrentTranscript = useCallback(
    (transcriptIndex: number) => {
      if (
        typeof window === "undefined" ||
        !window.speechSynthesis ||
        !useAudioFallback ||
        isCleaningUp.current ||
        !voicesLoaded
      ) {
        return
      }

      if (!speechQueueRef.current.includes(transcriptIndex)) {
        console.log("[v0] Adding to speech queue:", transcriptIndex)
        speechQueueRef.current.push(transcriptIndex)
        processNextSpeech()
      }
    },
    [useAudioFallback, voicesLoaded, processNextSpeech],
  )

  useEffect(() => {
    console.log(
      "[v0] Demo state - isPlaying:",
      isPlaying,
      "useAudioFallback:",
      useAudioFallback,
      "voicesLoaded:",
      voicesLoaded,
    )

    if (isPlaying && !isLoading) {
      if (!useAudioFallback && audioRef.current) {
        console.log("[v0] Attempting to play audio file")
        audioRef.current.play().catch((error) => {
          console.log("[v0] Audio play failed:", error.message, "- switching to speech synthesis")
          setUseAudioFallback(true)
        })
      }

      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const newTime = prev + 100
          const nextIndex = scenario.transcript.findIndex((item) => item.timestamp > newTime)
          const currentIndex = nextIndex === -1 ? scenario.transcript.length - 1 : nextIndex - 1

          if (currentIndex !== currentTranscriptIndex && currentIndex >= 0) {
            console.log("[v0] Transcript index changed to:", currentIndex, "useAudioFallback:", useAudioFallback)
            setCurrentTranscriptIndex(currentIndex)

            if (useAudioFallback && !isCleaningUp.current && currentIndex !== currentSpeechIndex.current) {
              console.log("[v0] Triggering speech synthesis for index:", currentIndex)
              currentSpeechIndex.current = currentIndex
              speakCurrentTranscript(currentIndex)
            }
          }

          if (newTime >= totalDuration) {
            setIsPlaying(false)
            if (intervalRef.current) {
              clearInterval(intervalRef.current)
              intervalRef.current = null
            }
            return totalDuration
          }
          return newTime
        })
      }, 100)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isPlaying, isLoading, useAudioFallback, totalDuration])

  const handlePlayPause = useCallback(() => {
    const now = Date.now()
    if (now - lastButtonClick < 300) return
    setLastButtonClick(now)

    if (isGeneratingTTS) {
      console.log("[v0] Cannot play while generating TTS audio")
      return
    }

    if (currentTime >= totalDuration) {
      setCurrentTime(0)
      setCurrentTranscriptIndex(0)
      if (audioRef.current) {
        audioRef.current.currentTime = 0
      }
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying, currentTime, totalDuration, lastButtonClick, isGeneratingTTS])

  const handleStop = useCallback(() => {
    const now = Date.now()
    if (now - lastButtonClick < 300) return
    setLastButtonClick(now)

    setIsPlaying(false)
    setCurrentTime(0)
    setCurrentTranscriptIndex(0)
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    cleanupAudio()
  }, [lastButtonClick, cleanupAudio])

  const handleReplay = useCallback(() => {
    const now = Date.now()
    if (now - lastButtonClick < 300) return
    setLastButtonClick(now)

    cleanupAudio()
    setCurrentTime(0)
    setCurrentTranscriptIndex(0)
    setTimeout(() => setIsPlaying(true), 100)
  }, [lastButtonClick, cleanupAudio])

  const handleScenarioChange = useCallback(
    (scenarioId: string) => {
      if (scenarioId === selectedScenario) return
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      cleanupAudio()
      setSelectedScenario(scenarioId)
      setIsPlaying(false)
      setCurrentTime(0)
      setCurrentTranscriptIndex(0)
    },
    [selectedScenario, cleanupAudio],
  )

  const handleGenerateTTS = useCallback(() => {
    generateScenarioAudio()
  }, [generateScenarioAudio])

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
              </CardTitle>
              <CardDescription>Experience how BazaWaza handles real customer calls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!process.env.NEXT_PUBLIC_RESEMBLE_API_CONFIGURED && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <div className="text-sm text-blue-700 font-medium mb-2">🎭 Demo Mode</div>
                  <div className="text-sm text-blue-700/80 mb-3">
                    Using browser speech synthesis. Add RESEMBLE_AI_API_KEY environment variable for high-quality
                    Resemble.AI voices.
                  </div>
                  <div className="text-xs text-blue-600/60">
                    Go to Project Settings → Environment Variables to add your API key.
                  </div>
                </div>
              )}

              {ttsError && !ttsError.includes("DEMO_MODE") && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <div className="text-sm text-destructive font-medium mb-2">TTS Generation Error</div>
                  <div className="text-sm text-destructive/80 mb-3">{ttsError}</div>
                  <Button onClick={handleGenerateTTS} size="sm" variant="outline" disabled={isGeneratingTTS}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${isGeneratingTTS ? "animate-spin" : ""}`} />
                    Retry TTS Generation
                  </Button>
                </div>
              )}

              {isGeneratingTTS && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-medium">Generating high-quality audio with Resemble.AI...</span>
                  </div>
                </div>
              )}

              {generatedAudioUrl && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <div className="text-sm text-green-700 font-medium">✓ High-quality TTS audio ready</div>
                </div>
              )}

              {/* Voice Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">AI Voice Style</label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice} disabled={isLoading || isGeneratingTTS}>
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
                <Button
                  onClick={handleGenerateTTS}
                  size="sm"
                  variant="outline"
                  className="mt-2 w-full bg-transparent"
                  disabled={isGeneratingTTS}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isGeneratingTTS ? "animate-spin" : ""}`} />
                  Generate with Resemble.AI
                </Button>
              </div>

              {/* Scenario Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Demo Scenario</label>
                <div className="space-y-2">
                  {demoScenarios.map((scenario) => (
                    <button
                      key={scenario.id}
                      onClick={() => handleScenarioChange(scenario.id)}
                      disabled={isLoading || isGeneratingTTS}
                      className={`w-full text-left p-3 rounded-lg border transition-colors disabled:opacity-50 ${
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
                    disabled={isLoading || isGeneratingTTS}
                  >
                    {isLoading || isGeneratingTTS ? (
                      <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    ) : isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </Button>
                  <Button onClick={handleStop} size="sm" variant="outline" disabled={isLoading || isGeneratingTTS}>
                    Stop
                  </Button>
                  <Button onClick={handleReplay} size="sm" variant="outline" disabled={isLoading || isGeneratingTTS}>
                    Replay
                  </Button>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm text-muted-foreground mb-1">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(totalDuration)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-200 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Live Transcript */}
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {currentTranscript.map((item, index) => (
                    <div
                      key={index}
                      className={`flex gap-2 text-sm transition-all duration-300 ${
                        item.speaker === "ai" ? "justify-start" : "justify-end"
                      } ${index === currentTranscriptIndex ? "opacity-100" : "opacity-70"}`}
                    >
                      <div
                        className={`max-w-[80%] p-2 rounded-lg transition-all duration-300 ${
                          item.speaker === "ai"
                            ? "bg-primary/10 text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        } ${index === currentTranscriptIndex ? "scale-100" : "scale-95"}`}
                      >
                        <div className="font-medium text-xs mb-1">
                          {item.speaker === "ai" ? "BazaWaza AI" : "Caller"}
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
