import { Dashboard } from "@/components/dashboard"
import { CallTestWidget } from "@/components/call-test-widget"
import { SMSTestWidget } from "@/components/sms-test-widget"

export default function DashboardPage() {
  return (
    <div>
      <Dashboard />
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <CallTestWidget />
          <SMSTestWidget />
        </div>
      </div>
    </div>
  )
}
