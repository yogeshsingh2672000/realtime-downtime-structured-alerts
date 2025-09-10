"use client";
import React from "react";
import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-xl px-3 py-2 text-sm backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-cyan-500",
          // Light theme styles
          "bg-white/20 border border-gray-300 placeholder:text-gray-600 text-gray-900",
          // Dark theme styles
          "dark:bg-white/5 dark:border-white/10 dark:placeholder:text-white/40 dark:text-white",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
