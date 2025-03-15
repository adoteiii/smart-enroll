"use client";

import { useContext, useState } from "react";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Context } from "@/lib/userContext";
import { signOut } from "../lib/firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronRight, MenuIcon } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Navigation() {
  const { user, loading: loadingUser } = useContext(Context);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const path = usePathname();
  const router = useRouter();

  if (path === "/signin" || path === "/signup" || path.startsWith("/dashboard")) {
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
          <Button variant="ghost" className="opacity-50" disabled>
            Loading...
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-4">
        {!user ? (
          <>
            <Link href="/workshops" className="text-gray-700 hover:text-black">
              Workshops
            </Link>
            <Button variant="outline" onClick={() => router.push("/signin")}>
              Log In
            </Button>
            <Button
              variant="default"
              className="bg-black text-white hover:bg-gray-800"
              onClick={() => router.push("/signup")}
            >
              Get Started Free
            </Button>
          </>
        ) : (
          <>
            <Link href="/workshops" className="text-gray-700 hover:text-black">
              Workshops
            </Link>
            <Button
              onClick={() => router.push("/dashboard")}
              variant="default"
              className="gap-2 cursor-pointer hidden lg:flex"
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

  const renderMobileMenu = () => {
    return (
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <MenuIcon className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <div className="flex flex-col gap-4 p-4">
            <Link
              href="/workshops"
              className="text-sm font-medium text-muted-foreground hover:text-primary"
              onClick={() => setIsSheetOpen(false)}
            >
              Workshops
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground hover:text-primary"
                onClick={() => setIsSheetOpen(false)}
              >
                Dashboard
              </Link>
            )}
          </div>
        </SheetContent>
      </Sheet>
    );
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 lg:px-8 border-b">
      <div className="flex items-center space-x-2">
        {renderMobileMenu()}
        <Link href="/" className="flex items-center space-x-2">
          <Bot className="h-8 w-8 text-black" />
          <span className="text-xl font-semibold">Smart-Enroll</span>
        </Link>
      </div>
      {renderAuthButtons()}
    </nav>
  );
}
