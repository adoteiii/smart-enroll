import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle } from "lucide-react"

export default function HeroSection() {
  return (
    <section className="px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
          <div className="flex flex-col justify-center">
            <Badge className="mb-4 w-fit bg-black text-white">AI-Powered Solution</Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Smart Workshop Enrollment
            </h1>
            <p className="mt-4 text-2xl font-medium">
              Streamline Registrations, Boost Engagement, and Maximize Attendance
            </p>
            <p className="mt-6 text-lg text-gray-600">
              A fully automated, AI-enhanced workshop registration and management platform for schools, organizations,
              and training centers.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-6 w-6 text-black mt-0.5 flex-shrink-0" />
                <p>
                  <span className="font-medium">Smart Registrations:</span> AI reduces errors and speeds up sign-ups.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-6 w-6 text-black mt-0.5 flex-shrink-0" />
                <p>
                  <span className="font-medium">AI-Driven Insights:</span> Organizers get real-time analytics on
                  attendance and trends.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-6 w-6 text-black mt-0.5 flex-shrink-0" />
                <p>
                  <span className="font-medium">Automated Engagement:</span> AI chatbot assists students and handles
                  FAQs.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" className="bg-black text-white hover:bg-gray-800 group">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline" className="border-black text-black hover:bg-gray-100">
                Book a Demo
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-video w-full overflow-hidden rounded-xl border border-gray-200">
              <img
                src="/dashboard-preview.png"
                alt="Smart-Enroll Dashboard Preview"
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-4 right-4">
                <Badge className="bg-black/90 hover:bg-black">AI-Powered</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}