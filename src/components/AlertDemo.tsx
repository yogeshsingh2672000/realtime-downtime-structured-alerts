"use client";
import React from "react";
import { Button } from "./ui/Button";
import { useAlert } from "@/contexts/AlertContext";

export const AlertDemo: React.FC = () => {
  const { showSuccess, showError, showWarning, showInfo } = useAlert();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Alert System Demo</h3>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="primary"
          onClick={() => showSuccess("Operation completed successfully!")}
        >
          Show Success
        </Button>
        <Button
          variant="ghost"
          onClick={() => showError("Something went wrong!", "Error")}
        >
          Show Error
        </Button>
        <Button
          variant="ghost"
          onClick={() => showWarning("Please check your input", "Warning")}
        >
          Show Warning
        </Button>
        <Button
          variant="ghost"
          onClick={() => showInfo("Here's some helpful information", "Info")}
        >
          Show Info
        </Button>
      </div>
    </div>
  );
};
