import { Card } from "@/components/ui/card"
import { CheckCircle, X } from "lucide-react"

export default function ProblemSolution() {
  return (
    <section className="bg-gray-50 px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">The Real Problem: Why Organizations Need This</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Schools, institutions, and businesses face significant challenges with traditional workshop management
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          <Card className="p-8 border-red-200">
            <h3 className="text-2xl font-bold mb-6 flex items-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 mr-3">
                <X className="h-5 w-5" />
              </span>
              The Old Way
            </h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <X className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold">Manual registrations</p>
                  <p className="text-gray-600">High errors & delays</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <X className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold">No engagement tracking</p>
                  <p className="text-gray-600">Low attendance</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <X className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold">No data insights</p>
                  <p className="text-gray-600">Hard to measure success</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 border-green-200">
            <h3 className="text-2xl font-bold mb-6 flex items-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 mr-3">
                <CheckCircle className="h-5 w-5" />
              </span>
              The Smart-Enroll Way
            </h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold">AI-Enhanced Registrations</p>
                  <p className="text-gray-600">Smart forms reduce errors</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold">Live Analytics Dashboard</p>
                  <p className="text-gray-600">Real-time engagement & trends</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold">AI Chatbot Support</p>
                  <p className="text-gray-600">Handles student queries 24/7</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}