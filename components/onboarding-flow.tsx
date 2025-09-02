import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function OnboardingFlow() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to BazaWaza AI</CardTitle>
        <CardDescription>Get started with your AI assistant</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground">Onboarding steps will be displayed here</div>
      </CardContent>
    </Card>
  )
}
