import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function AnalyticsDashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics Dashboard</CardTitle>
        <CardDescription>View your call analytics and performance metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground">Analytics data will be displayed here</div>
      </CardContent>
    </Card>
  )
}
