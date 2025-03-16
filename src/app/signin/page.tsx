"use client";

// react imports
import { useState, useEffect, useContext } from "react";

//nextjs imports
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Context } from "@/lib/userContext";

// Components
import Loader from "@/components/loader/Loader";
import { UserAuthForm } from "@/components/ui/user-auth-form";
import { ChevronRight, Lightbulb, Calendar, Users } from "lucide-react";

// SIGNIN WITH EMAIL SUBMISSION TYPE
interface FormData {
  email: string;
  password: string;
}

export default function SignIn() {
  // Signin component. Performs signin

  //Hooks
  const router = useRouter(); // routing
  const [isLoggedInWaiting, setIsLoggedInWaiting] = useState(true); // Logged in hook

  // Contexts
  const { user, loading: userLoading } = useContext(Context);

  // Effects
  useEffect(() => {
    if (userLoading) {
      // don't do anything if user is not confirmed
      return;
    }
    if (user === undefined) {
      // user is still not confirmed. Keep the loading page.
      return;
    }
    if (user === null && !userLoading) {
      // We have finished verifying but the user does not exist / no signin info
      // Finish waiting
      setIsLoggedInWaiting(false);
      return;
    }
    // Navigate automatically to the dashboard. We don't want to display the signin to someone already signed in if by mistake.
    router.push("/dashboard");
  }, [user, userLoading]);

  return isLoggedInWaiting ? (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Loader
        size="large"
        color="workshop"
        className="mb-4"
        text="Setting up your workshop experience..."
      />
    </div>
  ) : (
    <div className="h-screen w-full overflow-hidden">
      <div className="h-full w-full grid lg:grid-cols-2">
        {/* Left side - Promotional content - Updated to match signup */}
        <div className="relative hidden h-full lg:flex flex-col bg-white dark:bg-gray-900 p-6">
          <div className="relative h-full w-full rounded-3xl overflow-hidden shadow-xl flex flex-col">
            <div className="absolute inset-0">
              <Image
                src="/assets/images/seminar-image-1.jpg"
                alt="Workshop background"
                fill
                className="object-cover"
                priority
              />
              {/* Lighter overlay to match signup */}
              <div className="absolute inset-0 bg-black/10" />
            </div>

            <div className="relative z-20 p-10">
              <Link href={"/"} className="flex items-center space-x-2">
                <Image
                  src="/logo.svg"
                  alt="Smart Enroll"
                  width={150}
                  height={150}
                />
              </Link>
            </div>

            <div className="flex-1 flex flex-col items-center relative z-20 justify-center p-10 text-white">
              <div className="w-full max-w-sm">
                {/* Clean card design for information - matching signup */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20">
                  <div className="p-5">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="bg-white/20 p-2 rounded-full">
                          <Lightbulb className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-base text-white">
                            Personalized Learning
                          </h3>
                          <p className="text-sm text-white/80 mt-0.5">
                            AI-powered workshop recommendations
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="bg-white/20 p-2 rounded-full">
                          <Calendar className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-base text-white">
                            Smart Scheduling
                          </h3>
                          <p className="text-sm text-white/80 mt-0.5">
                            Avoid conflicts with schedule optimization
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="bg-white/20 p-2 rounded-full">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-base text-white">
                            Community Learning
                          </h3>
                          <p className="text-sm text-white/80 mt-0.5">
                            Connect with peers sharing your interests
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-20 p-10 mt-auto">
              <Link
                href={"/signup"}
                className="inline-flex items-center gap-2 text-sm text-white hover:underline transition-all"
              >
                <span>Need an account? Sign up</span>
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Right side - Signin form */}
        <div className="h-full flex items-center justify-center p-4 lg:p-8 bg-white dark:bg-gray-950">
          <div className="w-full max-w-md space-y-6">
            <div className="flex flex-col space-y-2 text-center">
              <div className="flex justify-center">
                {/* Mobile-only logo */}
                <div className="lg:hidden flex items-center space-x-2 mb-6">
                  <Image
                    src="/logo.svg"
                    alt="Smart Enroll"
                    width={150}
                    height={150}
                  />
                </div>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome back
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                Sign in to discover and register for workshops tailored to your
                interests
              </p>
            </div>
            <UserAuthForm />
            <p className="px-8 text-center text-sm text-muted-foreground">
              By clicking continue, you agree to our{" "}
              <Link
                href="/termsandconditions"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacypolicy"
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
