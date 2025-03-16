import { Card } from "@/components/ui/card";
import { CheckCircle, X } from "lucide-react";

export default function ProblemSolution() {
  return (
    <section className="px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">
            The Real Problem: Why Organizations Need This
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Google Forms lacks essential automation and insights needed for
            seamless workshop management.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Google Forms Limitations */}
          <Card className="p-8 border-red-200">
            <h3 className="text-2xl font-bold mb-6 flex items-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 mr-3">
                <X className="h-5 w-5" />
              </span>
              Google Forms Limitations
            </h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <X className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold">No Duplicate Check</p>
                  <p className="text-gray-600">
                    Students can register multiple times.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <X className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold">No AI-Powered Assistance</p>
                  <p className="text-gray-600">
                    No smart insights or chatbot to guide organizers.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <X className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold">No Engagement Tracking</p>
                  <p className="text-gray-600">
                    No real-time analytics on student participation.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Smart-Enroll Benefits */}
          <Card className="p-8 border-green-200">
            <h3 className="text-2xl font-bold mb-6 flex items-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 mr-3">
                <CheckCircle className="h-5 w-5" />
              </span>
              The Smart-Enroll Advantage
            </h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold">Duplicate-Free Registrations</p>
                  <p className="text-gray-600">
                    Detects repeat sign-ups without requiring login.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold">
                    AI-Powered Form & Workshop Suggestions
                  </p>
                  <p className="text-gray-600">
                    Smart recommendations when creating forms and managing
                    workshops.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold">
                    AI Insights for Better Decisions
                  </p>
                  <p className="text-gray-600">
                    Real-time analytics on attendance, engagement, and trends.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold">AI Chatbot Assistance</p>
                  <p className="text-gray-600">
                    Instant help for both organizers and attendees.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
