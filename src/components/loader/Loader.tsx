import React from "react";
import { BookOpen, Calendar } from "lucide-react"; // Import workshop-related icons

interface LoaderProps {
  size?: "small" | "medium" | "large";
  color?: "primary" | "secondary" | "success" | "error" | "white" | "workshop";
  className?: string;
  text?: string;
  variant?: "spinner" | "workshop"; // Add variant option
}

const Loader: React.FC<LoaderProps> = ({
  size = "medium",
  color = "primary",
  className = "",
  text,
  variant = "spinner", // Default to standard spinner
}) => {
  // Size classes map
  const sizeClasses = {
    small: "w-4 h-4 border-2",
    medium: "w-6 h-6 border-2",
    large: "w-8 h-8 border-3",
  };

  // Icon size map
  const iconSizeMap = {
    small: 16,
    medium: 24,
    large: 32,
  };

  // Color classes map with workshop theme
  const colorClasses = {
    primary: "border-white border-t-blue-600",
    secondary: "border-gray-200 border-t-gray-600",
    success: "border-green-200 border-t-green-600",
    error: "border-red-200 border-t-red-600",
    white: "border-white/30 border-t-white",
    workshop: "border-white border-t-purple-600",
  };

  // Color classes for icons
  const iconColorMap = {
    primary: "text-blue-600",
    secondary: "text-gray-600",
    success: "text-green-600",
    error: "text-red-600",
    white: "text-white",
    workshop: "text-purple-600",
  };

  // Workshop-themed loader
  if (variant === "workshop") {
    return (
      <div
        className={`inline-flex flex-col items-center justify-center ${className}`}
        role="status"
        aria-label="Loading"
      >
        <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm flex items-center justify-center">
          <div className="animate-pulse absolute -z-10 inset-0 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl" />

          <div className="flex items-center space-x-3">
            <div className={`animate-bounce ${iconColorMap[color]}`}>
              <BookOpen size={iconSizeMap[size]} />
            </div>

            <div className="bg-gray-100 h-8 w-[1px]" />

            <div className={`animate-pulse delay-150 ${iconColorMap[color]}`}>
              <Calendar size={iconSizeMap[size]} />
            </div>
          </div>
        </div>

        {text && (
          <p className="mt-3 text-sm font-medium text-gray-700">{text}</p>
        )}
      </div>
    );
  }

  // Standard spinner loader
  return (
    <div
      className={`inline-flex flex-col items-center justify-center ${className}`}
      role="status"
      aria-label="Loading"
    >
      <div
        className={`
          rounded-full
          animate-spin
          ${sizeClasses[size]}
          ${colorClasses[color]}
        `}
      />
      {text && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{text}</p>
      )}
    </div>
  );
};

export default Loader;
