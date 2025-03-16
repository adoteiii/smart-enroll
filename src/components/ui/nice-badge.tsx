"use client"

import { Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface NiceBadgeProps {
  text?: string
  icon?: boolean
  variant?: "default" | "gradient" | "outline"
  size?: "sm" | "md" | "lg"
  className?: string
}

export default function NiceBadge({
  text = "AI-Powered",
  icon = true,
  variant = "gradient",
  size = "md",
  className,
}: NiceBadgeProps) {
  const sizeClasses = {
    sm: "text-xs py-0.5 px-2",
    md: "text-sm py-1 px-3",
    lg: "text-base py-1.5 px-4",
  }

  const variantClasses = {
    default: "bg-primary hover:bg-primary/90 text-primary-foreground",
    gradient: "bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white",
    outline: "bg-background border-2 border-primary text-primary hover:bg-primary/10",
  }

  return (
    <Badge
      className={cn(
        "font-medium transition-all duration-300 shadow-sm hover:shadow",
        "flex items-center gap-1.5 rounded-full",
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
    >
      {icon && (
        <Sparkles
          className={cn("inline-block", size === "sm" ? "h-3 w-3" : size === "md" ? "h-3.5 w-3.5" : "h-4 w-4")}
        />
      )}
      {text}
    </Badge>
  )
}

