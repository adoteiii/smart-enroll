"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import HeroSection from "./HeroSection";
import ProblemSolution from "./ProblemSolution";
import CoreFeatures from "./CoreFeatures";
import AIShowcase from "./AIShowCase";
import HowItWorks from "./HowItWorks";
import BusinessImpact from "./BusinessImpact";
import PricingPlans from "./PricingPlans";
import FinalCTA from "./FinalCTA";
import Footer from "./Footer";

export default function LandingPage() {
  const [registrationCount, setRegistrationCount] = useState(1243);

  useEffect(() => {
    // Increment registration count randomly
    const interval = setInterval(() => {
      setRegistrationCount((prev) => prev + Math.floor(Math.random() * 3));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
    

      <HeroSection />
      <ProblemSolution />
      <CoreFeatures />
      <AIShowcase />
      <HowItWorks />
      <BusinessImpact registrationCount={registrationCount} />
      <PricingPlans />
      <FinalCTA />
      <Footer />
    </div>
  );
}
