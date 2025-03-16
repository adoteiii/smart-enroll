import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function HowItWorks() {
  return (
    <section className="px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold">How Smart-Enroll Works</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            A simple onboarding process for organizations of all sizes.
          </p>
        </div>

        <div className="mt-16 relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 hidden lg:block" />
          <div className="grid gap-12 sm:grid-cols-4">
            {businessProcess.map((step, i) => (
              <div
                key={i}
                className="relative flex flex-col items-center text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-xl font-semibold text-white">
                  {i + 1}
                </div>
                <h3 className="mt-6 text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const businessProcess = [
  {
    title: "Sign Up & Customize",
    description: "Organizations create their event pages with custom details.",
  },
  {
    title: "Smart Workshop Management",
    description:
      "Admins create and manage workshops with AI-powered suggestions.",
  },
  {
    title: "Track & Optimize",
    description:
      "Admins monitor attendance, engagement, and performance in real-time.",
  },
  {
    title: "Automate Notifications & Insights",
    description:
      "AI sends reminders, feedback forms, and provides event insights.",
  },
];
