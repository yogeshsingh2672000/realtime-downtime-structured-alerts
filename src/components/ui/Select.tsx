"use client";
import React from "react";
import { cn } from "@/lib/utils";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "w-full rounded-xl px-3 py-2 text-sm backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none",
          // Light theme styles
          "bg-white/20 border border-gray-300 text-gray-900",
          // Dark theme styles
          "dark:bg-white/5 dark:border-white/10 dark:text-white",
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";
