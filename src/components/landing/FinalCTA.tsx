import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="bg-black text-white px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl text-center">
        <h2 className="text-3xl font-bold">
          Start Automating Your Workshop Registrations Today
        </h2>
        <p className="mt-4 text-lg text-gray-300 mx-auto max-w-2xl">
          Join hundreds of organizations already using Smart-Enroll to create
          better workshop experiences and maximize attendance
        </p>

        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup">
            <Button size="lg" className="bg-white text-black hover:bg-gray-100">
              Try Free
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
