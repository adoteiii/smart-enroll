import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import NiceBadge from "../ui/nice-badge";

export default function HeroSection() {
  return (
    <section className="py-10 md:py-12 px-4 mt-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="flex flex-col justify-center">
            <div className="flex flex-wrap gap-3">
              <NiceBadge size="sm" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Smart Workshop Enrollment
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Streamline registrations and maximize attendance with our
              AI-enhanced platform.
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <p className="text-sm md:text-base">
                  <span className="font-medium">Smart Registrations</span> with
                  AI-powered form assistance
                </p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <p className="text-sm md:text-base">
                  <span className="font-medium">Real-time Analytics</span> on
                  attendance and engagement
                </p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <p className="text-sm md:text-base">
                  <span className="font-medium">Automated Notifications</span>{" "}
                  for students and organizers
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/signup">
                <Button size="sm" className="group">
                  Get Started
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/workshops">
                <Button size="sm" variant="outline">
                  View Workshops
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative mt-4 lg:mt-0">
            <div className="aspect-[16/10] w-full overflow-hidden rounded-lg shadow-md">
              <Image
                src="/assets/images/workshop1.png"
                alt="Dashboard Preview"
                className="h-full w-full object-cover transition-transform hover:scale-[1.02]"
                width={800}
                height={500}
              />
              <div className="absolute bottom-3 right-3">
                <Badge
                  variant="secondary"
                  className="bg-background/80 backdrop-blur-sm"
                >
                  AI-Enhanced
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
