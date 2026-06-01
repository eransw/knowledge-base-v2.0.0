import * as React from "react"
import { cn } from "../../lib/utils"

function Badge({ className, variant = "default", ...props }) {
  const variants = {
    default: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    destructive: "bg-red-100 text-red-700 hover:bg-red-200",
    outline: "border border-gray-300 text-gray-700",
    success: "bg-green-100 text-green-700 hover:bg-green-200",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }