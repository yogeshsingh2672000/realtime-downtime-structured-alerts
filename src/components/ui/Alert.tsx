"use client";
import React, { useState, useEffect } from "react";
import { Button } from "./Button";

export type AlertType = "success" | "error" | "warning" | "info";

export interface AlertProps {
  id: string;
  type: AlertType;
  title?: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const alertStyles = {
  success: {
    container: "bg-green-500/10 border-green-500/20 text-green-300",
    icon: "✅",
    title: "text-green-300",
  },
  error: {
    container: "bg-red-500/10 border-red-500/20 text-red-300",
    icon: "❌",
    title: "text-red-300",
  },
  warning: {
    container: "bg-orange-500/10 border-orange-500/20 text-orange-300",
    icon: "⚠️",
    title: "text-orange-300",
  },
  info: {
    container: "bg-blue-500/10 border-blue-500/20 text-blue-300",
    icon: "ℹ️",
    title: "text-blue-300",
  },
};

export const Alert: React.FC<AlertProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const styles = alertStyles[type];

  // Trigger entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Progress bar animation for auto-dismiss
  useEffect(() => {
    if (duration <= 0) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      const progressPercent = (remaining / duration) * 100;
      
      setProgress(progressPercent);
      
      if (remaining <= 0) {
        clearInterval(interval);
        handleClose();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    // Wait for exit animation to complete before removing
    setTimeout(() => onClose(id), 300);
  };

  return (
    <div
      className={`relative p-4 rounded-lg border ${styles.container} backdrop-blur-sm transition-all duration-300 ease-out transform ${
        isVisible && !isExiting
          ? "translate-x-0 opacity-100 scale-100"
          : isExiting
          ? "translate-x-full opacity-0 scale-95"
          : "translate-x-full opacity-0 scale-95"
      }`}
      role="alert"
      style={{
        animation: isVisible && !isExiting 
          ? "slideInBounce 0.4s ease-out" 
          : isExiting 
          ? "slideOut 0.3s ease-in" 
          : undefined,
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-lg">{styles.icon}</div>
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={`text-sm font-medium ${styles.title} mb-1`}>
              {title}
            </h4>
          )}
          <p className="text-sm text-white/90">{message}</p>
        </div>
        <div className="flex-shrink-0">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="text-white/70 hover:text-white hover:bg-white/10 p-1 transition-all duration-200 hover:scale-110"
          >
            ✕
          </Button>
        </div>
      </div>
      {/* Progress bar for auto-dismiss */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 rounded-b-lg overflow-hidden">
          <div
            className="h-full bg-white/30 transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};
