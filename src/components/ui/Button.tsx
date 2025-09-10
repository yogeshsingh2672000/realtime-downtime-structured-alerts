"use client";
import React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex cursor-pointer disabled:cursor-not-allowed items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500";
  
  // Light theme glass effect
  const glassLight =
    "backdrop-blur-md bg-white/20 border border-gray-200 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)] text-gray-900";
  
  // Dark theme glass effect
  const glassDark =
    "dark:backdrop-blur-md dark:bg-white/5 dark:border-white/10 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] dark:text-white";
  
  const primary = "hover:bg-white/20 dark:hover:bg-white/10";
  const ghost = "bg-transparent border-transparent hover:bg-white/10 dark:hover:bg-white/5";
  
  return (
    <button
      className={cn(
        base,
        glassLight,
        glassDark,
        variant === "primary" ? primary : ghost,
        className
      )}
      {...props}
    />
  );
}
