import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Urgency } from "../types/patient";

/**
 * Combines Tailwind and conditional CSS classes safely.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(timeStr?: string): string {
  if (!timeStr) return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return timeStr;
}

export function formatUrgency(urgency: Urgency): {
  label: string;
  badgeClass: string;
  dotClass: string;
} {
  switch (urgency) {
    case "red-flag":
      return {
        label: "Red Flag",
        badgeClass: "border-alert bg-alert text-alert-foreground",
        dotClass: "bg-alert",
      };
    case "priority":
      return {
        label: "Priority",
        badgeClass: "border-warn/40 bg-warn-soft text-warn-foreground",
        dotClass: "bg-warn",
      };
    case "normal":
    default:
      return {
        label: "Normal",
        badgeClass: "border-ok/30 bg-ok-soft text-ok",
        dotClass: "bg-ok",
      };
  }
}
