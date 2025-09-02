import { DemoWidget } from "@/components/demo-widget"
import { OnboardingFlow } from "@/components/onboarding-flow"
import { Dashboard } from "@/components/dashboard"

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">BazaWaza AI</h1>
        <DemoWidget />
        <OnboardingFlow />
        <Dashboard />
      </div>
    </main>
  )
}
