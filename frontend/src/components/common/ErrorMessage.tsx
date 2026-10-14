import React from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "../../utils/formatters";
import { Button } from "./Button";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({ message, onRetry, className }: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive",
        className
      )}
    >
      <div className="flex items-center gap-2.5">
        <AlertTriangle className="size-5 shrink-0" aria-hidden />
        <p className="font-medium">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="shrink-0 border-destructive/30 text-destructive hover:bg-destructive/15">
          Try again
        </Button>
      )}
    </div>
  );
}
