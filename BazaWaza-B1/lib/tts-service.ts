interface TTSRequest {
  text: string
  voice_style: string
  scenario: string
}

interface TTSResponse {
  success: boolean
  audioUrl?: string
  duration?: number
  voice_style?: string
  error?: string
  demoMode?: boolean
  message?: string
}

interface ScenarioAudioFile {
  speaker: string
  timestamp: number
  audioUrl: string
  duration: number
}

interface GeneratedScenario {
  scenario: string
  name: string
  audioFiles: ScenarioAudioFile[]
  totalDuration: number
}

export class TTSService {
  private static cache = new Map<string, string>()

  private constructor() {
    // This class should only be used statically
  }

  static async generateTTS(request: TTSRequest): Promise<TTSResponse> {
    const cacheKey = `${request.scenario}_${request.voice_style}_${request.text.substring(0, 50)}`

    if (this.cache.has(cacheKey)) {
      console.log("[v0] Using cached TTS audio:", cacheKey)
      return {
        success: true,
        audioUrl: this.cache.get(cacheKey)!,
        duration: this.estimateDuration(request.text),
        voice_style: request.voice_style,
      }
    }

    try {
      console.log("[v0] Making TTS generation request...")
      const response = await fetch("/api/tts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      })

      console.log("[v0] TTS API response status:", response.status, response.statusText)

      const result: TTSResponse = await response.json()
      console.log("[v0] TTS API response:", result)

      // Handle demo mode
      if (result.error === "DEMO_MODE") {
        console.log("[v0] Running in demo mode - using browser speech synthesis")
        return {
          success: false,
          error: "DEMO_MODE",
          message: result.message,
          demoMode: true,
        }
      }

      if (!response.ok) {
        throw new Error(`TTS generation failed: ${response.status} ${response.statusText}`)
      }

      if (result.success && result.audioUrl) {
        this.cache.set(cacheKey, result.audioUrl)
        return result
      } else {
        throw new Error(result.error || "TTS generation failed - no audio URL returned")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown TTS generation error"
      console.error("[v0] TTS generation error:", errorMessage)
      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  static async generateAllScenarios(): Promise<GeneratedScenario[]> {
    try {
      console.log("[v0] Generating all scenarios...")
      const response = await fetch("/api/tts/scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Scenario generation failed: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const result = await response.json()
      return result.scenarios
    } catch (error) {
      console.error("[v0] Scenario generation error:", error)
      throw error
    }
  }

  private static estimateDuration(text: string): number {
    const words = text.split(" ").length
    return Math.ceil((words / 150) * 60 * 1000) // 150 words per minute
  }

  static clearCache(): void {
    this.cache.clear()
  }
}
