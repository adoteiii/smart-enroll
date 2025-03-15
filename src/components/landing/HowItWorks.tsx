import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function HowItWorks() {
  return (
    <section className="px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold">How Smart-Enroll Works</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            A simple onboarding process for organizations of all sizes
          </p>
        </div>

        <div className="mt-16 relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 hidden lg:block" />
          <div className="grid gap-12 sm:grid-cols-4">
            {businessProcess.map((step, i) => (
              <div key={i} className="relative flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-xl font-semibold text-white">
                  {i + 1}
                </div>
                <h3 className="mt-6 text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <Button size="lg" className="bg-black text-white hover:bg-gray-800">
            Book a Demo to See It in Action
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}

const businessProcess = [
  {
    title: "Sign Up & Customize",
    description: "Organizations create their event pages with custom branding.",
  },
  {
    title: "AI-Driven Registrations",
    description: "Students sign up, and AI matches them to relevant workshops.",
  },
  {
    title: "Track & Optimize",
    description: "Admins monitor attendance and engagement in real-time.",
  },
  {
    title: "Automate Follow-Ups",
    description: "AI sends reminders, feedback forms, and analytics reports.",
  },
]