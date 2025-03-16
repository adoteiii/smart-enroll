"use client";

import { useContext } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Context } from "@/lib/userContext";
import { signOut } from "../lib/firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { toast } from "sonner";

export default function Navigation() {
  const { user, loading: loadingUser } = useContext(Context);
  const path = usePathname();
  const router = useRouter();

  if (
    path === "/signin" ||
    path === "/signup" ||
    path.startsWith("/dashboard")
  ) {
    return null;
  }

  const handleSignOut = () => {
    signOut()
      .then(() => {
        toast("Success", { description: "You have been signed out" });
      })
      .catch((error) => {
        toast.error("Error", { description: "Failed to sign out" });
      });
  };

  const renderAuthButtons = () => {
    if (loadingUser) {
      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="opacity-50" disabled size="sm">
            Loading...
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 sm:gap-4">
        {!user ? (
          <>
            <Link 
              href="/workshops" 
              className="text-gray-700 hover:text-black text-sm hidden sm:block"
            >
              Workshops
            </Link>
            <Button 
              variant="outline" 
              onClick={() => router.push("/signin")}
              size="sm"
              className="h-8 text-xs px-3 sm:h-10 sm:text-sm sm:px-4 rounded-full"

            >
              Log In
            </Button>
            <Button
              variant="default"
              className="bg-black text-white hover:bg-gray-800 h-8 text-xs px-3 sm:h-10 sm:text-sm sm:px-4 rounded-full"
              onClick={() => router.push("/signup")}
              size="sm"
            >
              Sign Up
            </Button>
          </>
        ) : (
          <>
            <Link 
              href="/workshops" 
              className="text-gray-700 hover:text-black text-sm hidden sm:block"
            >
              Workshops
            </Link>
            <Button
              onClick={() => router.push("/dashboard")}
              variant="default"
              className="gap-2 cursor-pointer hidden lg:flex rounded-full"
              size="sm"
            >
              Dashboard
              <ChevronRight className="stroke-[2px]" size={15} />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.photoURL || ""} />
                    <AvatarFallback>
                      {user?.email?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.photoURL || ""} />
                    <AvatarFallback>
                      {user?.email?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.displayName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/workshops")}>
                  Workshops
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-600"
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    );
  };

  return (
    <nav className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:px-8 border-b bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="flex items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="Smart-Enroll Logo"
            width={180}
            height={180}
           
          />
        </Link>
      </div>
      {renderAuthButtons()}
    </nav>
  );
}