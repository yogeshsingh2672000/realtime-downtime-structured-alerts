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
          "w-full rounded-xl px-3 py-2 text-sm bg-white/5 backdrop-blur-md border border-white/10 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
