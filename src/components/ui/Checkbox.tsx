"use client";
import React from "react";
import { cn } from "@/lib/utils";

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="checkbox"
        className={cn(
          "h-4 w-4 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500 focus:outline-none",
          className
        )}
        {...props}
      />
    );
  }
);
Checkbox.displayName = "Checkbox";
