"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TabsProps<T extends string> = {
  value: T;
  options: readonly { value: T; label: string }[];
  onValueChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
};

export function SegmentedTabs<T extends string>({
  value,
  options,
  onValueChange,
  ariaLabel,
  className,
}: TabsProps<T>): React.ReactElement {
  return (
    <div className={cn("grid rounded-md bg-muted p-1", className)} role="tablist" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={option.value === value}
          className={cn(
            "h-8 rounded-sm px-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            option.value === value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
          onClick={() => onValueChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
