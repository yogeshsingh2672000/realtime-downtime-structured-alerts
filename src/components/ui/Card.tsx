import React from "react";
import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl backdrop-blur-xl",
        // Light theme
        "border border-gray-200 bg-white/20 shadow-[0_0_1px_0_rgba(0,0,0,0.1),0_8px_40px_-12px_rgba(0,0,0,0.1)]",
        // Dark theme
        "dark:border-white/10 dark:bg-white/5 dark:shadow-[0_0_1px_0_rgba(255,255,255,0.5),0_8px_40px_-12px_rgba(0,0,0,0.5)]",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: CardProps) {
  return (
    <div 
      className={cn(
        "p-4 border-b border-gray-200 dark:border-white/10", 
        className
      )} 
      {...props} 
    />
  );
}

export function CardContent({ className, ...props }: CardProps) {
  return <div className={cn("p-4", className)} {...props} />;
}

export function CardFooter({ className, ...props }: CardProps) {
  return (
    <div 
      className={cn(
        "p-4 border-t border-gray-200 dark:border-white/10", 
        className
      )} 
      {...props} 
    />
  );
}
