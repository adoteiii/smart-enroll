import React, { ReactNode } from "react";

export const metadata = {
  title: "Sign In",
  description:
    "Sign in to your Smart Enroll",
  keywords: ["sign in", "login"],
  openGraph: {
    title: "Sign In | Smart Enroll",
    description: "Sign in to your Smart Enroll account",
  },
};

function SignInLayout({ children }: { children: ReactNode }) {
  return children;
}

export default SignInLayout;
