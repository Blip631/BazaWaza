interface AudioSegment {
  speaker: "ai" | "caller"
  text: string
  audioUrl: string
  duration: number
}

interface DemoAudioData {
  segments: AudioSegment[]
  totalDuration: number
}

export class DemoTTSService {
  private static audioCache = new Map<string, DemoAudioData>()

  static async generateScenarioAudio(
    scenarioId: string,
    transcript: Array<{ speaker: "caller" | "ai"; text: string; timestamp: number }>,
    voiceStyle: "professional" | "warm" | "casual",
  ): Promise<DemoAudioData> {
    const cacheKey = `${scenarioId}-${voiceStyle}`

    // Check cache first
    if (this.audioCache.has(cacheKey)) {
      console.log(`[v0] Using cached audio for ${cacheKey}`)
      return this.audioCache.get(cacheKey)!
    }

    console.log(`[v0] Generating new audio for scenario ${scenarioId} with ${voiceStyle} AI voice`)

    try {
      const segments: AudioSegment[] = []

      // Generate audio for each transcript segment
      for (const item of transcript) {
        const audioUrl = await this.generateSingleAudio(item.text, item.speaker, voiceStyle)
        const duration = await this.getAudioDuration(audioUrl)

        segments.push({
          speaker: item.speaker,
          text: item.text,
          audioUrl,
          duration,
        })
      }

      const totalDuration = segments.reduce((sum, segment) => sum + segment.duration, 0)

      const audioData: DemoAudioData = {
        segments,
        totalDuration,
      }

      // Cache the result
      this.audioCache.set(cacheKey, audioData)

      return audioData
    } catch (error) {
      console.error("[v0] Error generating scenario audio:", error)
      throw error
    }
  }

  private static async generateSingleAudio(
    text: string,
    speaker: "caller" | "ai",
    voiceStyle: "professional" | "warm" | "casual",
  ): Promise<string> {
    const response = await fetch("/api/tts/elevenlabs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        voice_style: voiceStyle,
        speaker,
      }),
    })

    if (!response.ok) {
      throw new Error(`TTS generation failed: ${response.statusText}`)
    }

    // Convert response to blob URL for playback
    const audioBlob = await response.blob()
    return URL.createObjectURL(audioBlob)
  }

  private static async getAudioDuration(audioUrl: string): Promise<number> {
    return new Promise((resolve) => {
      const audio = new Audio(audioUrl)
      audio.addEventListener("loadedmetadata", () => {
        resolve(audio.duration * 1000) // Convert to milliseconds
      })
      audio.addEventListener("error", () => {
        // Fallback: estimate based on text length (roughly 150 words per minute)
        resolve(3000) // Default 3 seconds
      })
    })
  }

  // Clear cache when needed
  static clearCache() {
    this.audioCache.clear()
  }
}
