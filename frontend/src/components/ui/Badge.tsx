import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

export function Badge({ className = '', variant = "default", ...props }: BadgeProps) {
  const baseStyle = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-primary focus:ring-offset-2";
  
  const variants = {
    default: "border-transparent bg-emerald-primary text-background hover:bg-emerald-hover",
    secondary: "border-transparent bg-surface-hover text-text-main hover:bg-surface-card",
    destructive: "border-transparent bg-danger text-background hover:bg-red-600",
    outline: "text-text-main border-border-subtle",
    success: "border-transparent bg-emerald-primary/20 text-emerald-primary hover:bg-emerald-primary/30",
    warning: "border-transparent bg-warning/20 text-warning hover:bg-warning/30",
  };

  return (
    <div className={`${baseStyle} ${variants[variant]} ${className}`} {...props} />
  )
}
