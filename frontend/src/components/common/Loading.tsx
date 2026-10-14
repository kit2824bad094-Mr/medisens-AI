import React from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { cn } from "../../utils/formatters";

interface LoadingProps {
  message?: string;
  className?: string;
  variant?: "spinner" | "bubble";
}

export function Loading({ message = "Loading...", className, variant = "spinner" }: LoadingProps) {
  if (variant === "bubble") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground shadow-panel",
          className
        )}
      >
        <Sparkles className="size-4 text-primary animate-pulse" aria-hidden />
        <span>{message}</span>
        <span className="flex gap-1" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-1.5 animate-bounce rounded-full bg-primary/70"
              style={{ animationDelay: `${i * 140}ms` }}
            />
          ))}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-10", className)}>
      <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
      {message && <p className="text-sm font-medium text-muted-foreground">{message}</p>}
    </div>
  );
}
