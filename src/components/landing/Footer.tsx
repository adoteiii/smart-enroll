import { Button } from "@/components/ui/button"
import { Bot } from "lucide-react"
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="border-t px-6 py-12 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="flex items-center space-x-2">
             <Image
                src="/logo.svg"
                alt="Smart-Enroll"
                width={100}
                height={100}
             />
            </div>
            <p className="mt-4 text-sm text-gray-600">
              AI-enhanced workshop registration and management platform for organizations
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Product</h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>Features</li>
              <li>Pricing</li>
              <li>Case Studies</li>
              <li>Documentation</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Company</h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>About Us</li>
              <li>Careers</li>
              <li>Blog</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Legal</h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Security</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">© 2025 Smart-Enroll. All rights reserved.</p>
          <div className="flex gap-4">
            <Button variant="ghost" size="sm" className="text-gray-600">
              Privacy
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600">
              Terms
            </Button>
          </div>
        </div>
      </div>
    </footer>
  )
}