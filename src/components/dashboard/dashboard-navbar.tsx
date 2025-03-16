import React, { useState, useEffect } from "react";
import { useContext } from "react";
import Link from "next/link";
import {
  LogOut,
  Moon,
  Settings,
  Sun,
  Bell,
  HelpCircle,
  Search,
  Menu,
  BuildingIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Context } from "@/lib/userContext";
import { Badge } from "@/components/ui/badge";
import { signOut } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useAppSelector } from "@/redux/store";

// Initialize dayjs plugins
dayjs.extend(relativeTime);

interface DashboardNavbarProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
  isDarkMode,
  toggleDarkMode,
}) => {
  const { user } = useContext(Context);
  const router = useRouter();
  const [searchFocused, setSearchFocused] = useState(false);
  const notifications = useAppSelector((state) => state.NotificationReducer.value);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user || !user.displayName) return "U";
    return user.displayName
      .split(" ")
      .map((name: string) => name[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="border-b bg-background sticky top-0 z-30">
      <div className="flex h-16 items-center px-4 gap-4">
        <div className="flex items-center gap-2 md:gap-4">
          <SidebarTrigger />
          <Link href="/dashboard" className="hidden md:block">
            <h1 className="font-semibold text-xl">Smart Enroll</h1>
          </Link>
        </div>

        <div
          className={cn(
            "flex items-center transition-all duration-200 rounded-md",
            searchFocused
              ? "flex-1 md:flex-none md:w-[400px]"
              : "w-full md:w-[300px]"
          )}
        >
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search workshops, categories..."
              className="pl-10 w-full"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Help Button */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex rounded-full"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full relative"
              >
                <Bell className="h-5 w-5" />
                {notifications?.filter(i=>!i.viewed[user.uid])?.length!==undefined && notifications.filter(i=>!i.viewed[user.uid])?.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
                    {notifications.length > 9 ? "9+" : notifications.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex justify-between items-center">
                <span>Notifications</span>
                {notifications && notifications.length > 0 && (
                  <Badge variant="outline">{notifications.filter(i=>!i.viewed[user.uid]).length} new</Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-auto">
                {isLoadingNotifications ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Loading notifications...
                  </div>
                ) : notifications && notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="p-0 focus:bg-transparent"
                    >
                      <Link
                        href={notification.link || "/dashboard/notifications"}
                        className="flex p-3 w-full hover:bg-muted/50 rounded-md"
                      >
                        <div className="w-full">
                          <p className="font-medium text-sm">
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {dayjs(notification.createdAt).fromNow()}
                          </p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No new notifications
                  </div>
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-center">
                <Link
                  href="/dashboard/notifications"
                  className="w-full text-center"
                >
                  View all notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-full"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user?.photoURL || ""}
                    alt={user?.displayName || "User"}
                  />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">
                    {user?.displayName || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center w-full"
                  >
                    <Avatar className="h-4 w-4 mr-2">
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/workshops" className="flex items-center w-full">
                    <BuildingIcon className="mr-2 h-4 w-4" />
                    <span>Workshops</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center w-full"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;
