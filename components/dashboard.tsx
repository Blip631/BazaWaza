import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function Dashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
        <CardDescription>Manage your BazaWaza AI settings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground">Dashboard content will be displayed here</div>
      </CardContent>
    </Card>
  )
}
