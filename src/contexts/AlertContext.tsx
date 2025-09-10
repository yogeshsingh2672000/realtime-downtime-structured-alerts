"use client";
import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Alert, AlertType } from "@/components/ui/Alert";

export interface AlertData {
  id: string;
  type: AlertType;
  title?: string;
  message: string;
  duration?: number;
}

interface AlertContextType {
  alerts: AlertData[];
  showAlert: (alert: Omit<AlertData, "id">) => void;
  showSuccess: (message: string, title?: string, duration?: number) => void;
  showError: (message: string, title?: string, duration?: number) => void;
  showWarning: (message: string, title?: string, duration?: number) => void;
  showInfo: (message: string, title?: string, duration?: number) => void;
  removeAlert: (id: string) => void;
  clearAllAlerts: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alerts, setAlerts] = useState<AlertData[]>([]);

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const showAlert = useCallback((alert: Omit<AlertData, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newAlert: AlertData = { ...alert, id };
    
    setAlerts((prev) => [...prev, newAlert]);

    // Auto-remove alert after duration (default 5 seconds)
    const duration = alert.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        removeAlert(id);
      }, duration);
    }
  }, [removeAlert]);

  const showSuccess = useCallback(
    (message: string, title?: string, duration?: number) => {
      showAlert({ type: "success", message, title, duration });
    },
    [showAlert]
  );

  const showError = useCallback(
    (message: string, title?: string, duration?: number) => {
      showAlert({ type: "error", message, title, duration });
    },
    [showAlert]
  );

  const showWarning = useCallback(
    (message: string, title?: string, duration?: number) => {
      showAlert({ type: "warning", message, title, duration });
    },
    [showAlert]
  );

  const showInfo = useCallback(
    (message: string, title?: string, duration?: number) => {
      showAlert({ type: "info", message, title, duration });
    },
    [showAlert]
  );

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  return (
    <AlertContext.Provider
      value={{
        alerts,
        showAlert,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        removeAlert,
        clearAllAlerts,
      }}
    >
      {children}
      {/* Alert Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
        {alerts.map((alert, index) => (
          <div
            key={alert.id}
            className="transition-all duration-300 ease-in-out"
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          >
            <Alert
              {...alert}
              onClose={removeAlert}
            />
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};
