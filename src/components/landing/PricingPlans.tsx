import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle } from "lucide-react"

export default function PricingPlans() {
  return (
    <section className="px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Pricing Plans</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Flexible options for organizations of all sizes
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <Card key={plan.name} className={`p-8 ${plan.featured ? "border-2 border-black relative" : ""}`}>
              {plan.featured && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white">Most Popular</Badge>
              )}
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.price !== "Custom" && <span className="ml-1 text-gray-600">/month</span>}
              </div>
              <p className="mt-2 text-gray-600">{plan.description}</p>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-black mt-1" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`mt-8 w-full ${plan.featured ? "bg-black text-white hover:bg-gray-800" : "bg-white text-black border-black hover:bg-gray-100"}`}
                variant={plan.featured ? "default" : "outline"}
              >
                {plan.cta}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

const pricingPlans = [
  {
    name: "Free Tier",
    price: "$0",
    description: "Basic features for small events",
    features: [
      "Up to 100 registrations per event",
      "AI chatbot (limited questions)",
      "Basic analytics",
      "Email notifications",
    ],
    cta: "Get Started",
    featured: false,
  },
  {
    name: "Business Plan",
    price: "$99",
    description: "Complete solution for growing organizations",
    features: [
      "Unlimited registrations & events",
      "Full AI analytics & chatbot features",
      "Automated email & SMS notifications",
      "Custom branding options",
      "Priority support",
    ],
    cta: "Start Free Trial",
    featured: true,
  },
  {
    name: "Enterprise Plan",
    price: "Custom",
    description: "Advanced features for large institutions",
    features: [
      "API integration for institutions",
      "White-label solutions",
      "Dedicated support & analytics reports",
      "Custom AI training",
      "SLA guarantees",
    ],
    cta: "Contact Sales",
    featured: false,
  },
]