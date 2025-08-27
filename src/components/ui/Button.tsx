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
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500";
  const glass =
    "backdrop-blur-md bg-white/5 border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]";
  const primary = "hover:bg-white/10";
  const ghost = "bg-transparent border-transparent hover:bg-white/5";
  return (
    <button
      className={cn(
        base,
        glass,
        variant === "primary" ? primary : ghost,
        className
      )}
      {...props}
    />
  );
}
