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
        {/* Left side - Promotional content */}
        <div className="relative hidden h-full lg:flex flex-col">
          {/* Background image instead of gradient */}
          <div className="absolute inset-0">
            <Image
              src="/assets/images/seminar-image-1.jpg"
              alt="Workshop background"
              fill
              className="object-cover"
              priority
            />
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/40" />
          </div>

          <div className="relative z-20 p-10">
            <Link href={"/"} className="flex items-center space-x-2">
              <span className="font-bold text-xl text-white">Smart Enroll</span>
            </Link>
          </div>

          <div className="flex-1 flex flex-col items-center relative z-20 justify-center p-10 text-white">
            <h2 className="text-3xl font-bold mb-8">
              Welcome Back to Smart Enroll
            </h2>

            <div className="space-y-6 max-w-md">
              <div className="flex items-start space-x-4">
                <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                  <Lightbulb className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-xl">
                    Personalized Learning
                  </h3>
                  <p className="opacity-80 mt-1">
                    Get AI-powered workshop recommendations based on your
                    interests
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-xl">Smart Scheduling</h3>
                  <p className="opacity-80 mt-1">
                    Avoid conflicts with automatic schedule optimization
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-xl">Community Learning</h3>
                  <p className="opacity-80 mt-1">
                    Connect with peers who share your interests and skills
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-20 p-10">
            <blockquote className="space-y-2">
              <footer className="text-sm text-right flex hover:underline cursor-pointer justify-end items-center gap-2">
                <Link href={"/signup"} className="text-white">
                  Need an account? Sign Up
                </Link>
                <ChevronRight size={20} className="text-white" />
              </footer>
            </blockquote>
          </div>
        </div>

        {/* Right side - Signin form */}
        <div className="h-full flex items-center justify-center p-4 lg:p-8 bg-white dark:bg-gray-950">
          <div className="w-full max-w-md space-y-6">
            <div className="flex flex-col space-y-2 text-center">
              <div className="flex justify-center">
                {/* Mobile-only logo */}
                <div className="lg:hidden flex items-center space-x-2 mb-6">
                  <span className="font-bold text-xl">Smart Enroll</span>
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
