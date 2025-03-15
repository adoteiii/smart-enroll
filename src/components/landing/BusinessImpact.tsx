import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CheckCircle, Building } from "lucide-react"

export default function BusinessImpact({ registrationCount }: { registrationCount: number }) {
  return (
    <section className="bg-gray-50 px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Business Impact</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Why organizations choose Smart-Enroll
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {metrics.map((metric, i) => (
            <Card key={i} className="p-8 text-center">
              <h3 className="text-5xl font-bold">{i === 2 ? registrationCount : metric.value}</h3>
              <p className="mt-4 text-lg font-medium">{metric.label}</p>
              <p className="mt-2 text-gray-600">{metric.description}</p>
            </Card>
          ))}
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <Card className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-12 w-12">
                <AvatarFallback>TC</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">Dr. Thomas Chen</p>
                <p className="text-sm text-gray-600">Director of Training, Global Education Institute</p>
              </div>
            </div>
            <p className="text-lg italic">
              "Smart-Enroll reduced our no-show rates by 40% and made registrations seamless. The analytics
              dashboard has transformed how we plan and execute our workshops."
            </p>
          </Card>

          <Card className="p-8">
            <h3 className="text-xl font-semibold flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Case Study
            </h3>
            <h4 className="text-lg font-medium mt-4">How Tech Academy streamlined its event management</h4>
            <p className="mt-2 text-gray-600">
              Tech Academy was struggling with low attendance and manual registration processes. After implementing Smart-Enroll, they saw:
            </p>
            <ul className="mt-4 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-black mt-1" />
                <span>45% increase in workshop attendance</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-black mt-1" />
                <span>75% reduction in administrative workload</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-black mt-1" />
                <span>90% student satisfaction with the AI chatbot</span>
              </li>
            </ul>
            <Button variant="outline" className="mt-6">
              Read Full Case Study
            </Button>
          </Card>
        </div>
      </div>
    </section>
  )
}

const metrics = [
  {
    value: "70%",
    label: "Faster Registrations",
    description: "Using AI-powered autofill and smart forms",
  },
  {
    value: "3x",
    label: "Higher Engagement",
    description: "With automated follow-ups and personalized recommendations",
  },
  {
    value: "",
    label: "Total Registrations",
    description: "Through our platform and growing",
  },
]