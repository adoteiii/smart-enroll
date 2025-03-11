import React, { ReactNode } from "react";

export const metadata = {
  title: "Create Account",
  description: "Create a Smart Enroll account",
  keywords: ["sign up", "create account", "register"],
  openGraph: {
    title: "Create Account | Smart Enroll",  
    description: "Create a Smart Enroll account"
  }
}
function SignUpLayout({ children }: { children: ReactNode }) {
  return children;
}

export default SignUpLayout;
