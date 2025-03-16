import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthContext } from "@/lib/userContext";
import { getAuthenticatedAppForUser } from "@/lib/firebase/firebaseserver";
import Providers from "@/providers/allProviders";
import { ReduxProvider } from "@/redux/provider";
import PublicListener from "@/components/security/PublicListener";
import Navbar from "@/components/Navbar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Smart Enroll",
  description: "An AI Powered Workshop Enrollment Platform",
  keywords: ["workshops", "enrollment", "registration"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { currentUser } = await getAuthenticatedAppForUser(undefined);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthContext initialUser={currentUser}>
          <Providers>
            <ReduxProvider>
              <PublicListener></PublicListener>
              <Navbar />
              {children}
              <Toaster />
            </ReduxProvider>
          </Providers>
        </AuthContext>
      </body>
    </html>
  );
}
