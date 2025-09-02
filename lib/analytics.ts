export const analytics = {
  track: (event: string, properties?: Record<string, any>) => {
    console.log("Analytics:", event, properties)
  },

  identify: (userId: string, traits?: Record<string, any>) => {
    console.log("Analytics identify:", userId, traits)
  },
}
