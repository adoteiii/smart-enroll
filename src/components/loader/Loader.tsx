import React from "react";

interface LoaderProps {
  size?: "small" | "medium" | "large";
  color?: "primary" | "secondary" | "success" | "error" | "white" | "workshop";
  className?: string;
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({
  size = "medium",
  color = "primary",
  className = "",
  text,
}) => {
  // Size classes map
  const sizeClasses = {
    small: "w-4 h-4 border-2",
    medium: "w-6 h-6 border-2",
    large: "w-8 h-8 border-3",
  };

  // Color classes map with new workshop theme
  const colorClasses = {
    primary: "border-blue-200 border-t-blue-600",
    secondary: "border-gray-200 border-t-gray-600",
    success: "border-green-200 border-t-green-600",
    error: "border-red-200 border-t-red-600",
    white: "border-white/30 border-t-white",
    workshop: "border-purple-200 border-t-purple-600", // New workshop theme color
  };

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
