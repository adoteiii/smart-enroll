"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import {
  BarChart3,
  Calendar,
  Cog,
  Home,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Moon,
  Settings,
  Sun,
  Users,
  UserSquare2,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <div className={cn("min-h-screen bg-background", isDarkMode ? "dark" : "")}>
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen overflow-hidden">
          <AppSidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <header className="border-b bg-background">
              <div className="flex h-16 items-center px-4 gap-4">
                <SidebarTrigger />
                <div className="w-full flex-1 md:w-auto md:flex-none">
                  <Input type="search" placeholder="Search..." className="md:w-[300px] lg:w-[400px]" />
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="rounded-full">
                    {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/placeholder.svg?height=32&width=32" alt="@admin" />
                          <AvatarFallback>AD</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  )
}

function AppSidebar() {
  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="flex items-center justify-between px-4 py-2">
        <Link href="/dashboard" className="flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6" />
          <span className="font-bold text-xl">WorkshopAdmin</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard">
                  <Link href="/dashboard">
                    <Home />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Workshops">
                  <Link href="/dashboard/workshops">
                    <Calendar />
                    <span>Workshops</span>
                  </Link>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link href="/dashboard/workshops/create">
                        <span>Create Workshop</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link href="/dashboard/workshops/manage">
                        <span>Manage Workshops</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Registrations">
                  <Link href="/dashboard/registrations">
                    <Users />
                    <span>Registrations</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="AI Insights">
                  <Link href="/dashboard/ai-insights">
                    <BarChart3 />
                    <span>AI Insights</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="AI Assistant">
                  <Link href="/dashboard/ai-assistant">
                    <MessageSquare />
                    <span>AI Assistant</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Speakers">
                  <Link href="/dashboard/speakers">
                    <UserSquare2 />
                    <span>Speakers</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings">
                  <Link href="/dashboard/settings">
                    <Cog />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4">
          <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent p-3">
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Admin" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-medium">Admin User</span>
              <span className="truncate text-xs text-muted-foreground">admin@example.com</span>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

