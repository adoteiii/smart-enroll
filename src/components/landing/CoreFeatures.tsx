import { Card } from "@/components/ui/card"
import { Calendar, LineChart, Mail, MessageSquare, CheckCircle } from "lucide-react"

export default function CoreFeatures() {
  return (
    <section className="px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Core Features</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Our platform adds real business value through AI-powered features designed for organizations
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title} className="overflow-hidden">
              <div className="h-1 bg-black" />
              <div className="p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <feature.icon className="h-6 w-6 text-black" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
                <p className="mt-2 text-gray-600">{feature.description}</p>
                <ul className="mt-4 space-y-3">
                  {feature.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-black mt-1 flex-shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

const features = [
  {
    title: "AI-Powered Smart Registrations",
    description: "Streamlined registration process with intelligent assistance.",
    icon: Calendar,
    points: [
      "Auto-fills student details",
      "Detects duplicate entries",
      "Provides personalized workshop recommendations based on user interests",
    ],
  },
  {
    title: "AI Chatbot (24/7 Support)",
    description: "Intelligent assistant for students and administrators.",
    icon: MessageSquare,
    points: [
      "For Students: Answers FAQs, suggests workshops",
      "For Admins: Helps with event setup, schedules, and analytics",
      "Available 24/7 for instant support",
    ],
  },
  {
    title: "Real-Time Analytics Dashboard",
    description: "Comprehensive insights for data-driven decisions.",
    icon: LineChart,
    points: [
      "Tracks registrations, attendance, engagement rates",
      "Predicts drop-off rates and suggests actions to increase turnout",
      "Generates custom reports for event organizers",
    ],
  },
  {
    title: "Automated Notifications & Reminders",
    description: "Smart communication system that keeps everyone informed.",
    icon: Mail,
    points: [
      "Email & SMS alerts for upcoming workshops",
      "AI follows up with absentees and suggests alternative sessions",
      "Reduces no-shows by up to 40%",
    ],
  },
]