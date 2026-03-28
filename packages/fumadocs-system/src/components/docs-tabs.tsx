"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { cn } from "../lib/utils";

type TabsContextValue = {
  setValue: (value: string) => void;
  value: string;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error("Tabs components must be used within <Tabs />.");
  }

  return context;
}

export function Tabs({
  children,
  className,
  defaultValue,
}: {
  children: ReactNode;
  className?: string;
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const contextValue = useMemo(() => ({ setValue, value }), [value]);

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cn("relative mt-6 w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function CodeTabs({
  children,
  className,
  defaultValue = "cli",
}: {
  children: ReactNode;
  className?: string;
  defaultValue?: string;
}) {
  return (
    <Tabs className={className} defaultValue={defaultValue}>
      {children}
    </Tabs>
  );
}

export function TabsList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("flex items-center justify-start gap-4 rounded-none bg-transparent px-0", className)}
      data-slot="tabs-list"
      role="tablist"
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  children,
  className,
  value,
}: {
  children: ReactNode;
  className?: string;
  value: string;
}) {
  const { setValue, value: currentValue } = useTabsContext();
  const isActive = currentValue === value;

  return (
    <button
      className={cn(
        "inline-flex rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pb-3 text-base text-muted-foreground shadow-none transition-colors hover:text-foreground",
        isActive && "border-primary bg-transparent text-foreground",
        className,
      )}
      data-state={isActive ? "active" : "inactive"}
      onClick={() => setValue(value)}
      role="tab"
      type="button"
    >
      {children}
    </button>
  );
}

export function TabsContent({
  children,
  className,
  value,
}: {
  children: ReactNode;
  className?: string;
  value: string;
}) {
  const { value: currentValue } = useTabsContext();

  if (currentValue !== value) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative [&>.steps]:mt-6 [&_h3.font-heading]:text-base [&_h3.font-heading]:font-medium *:[figure]:first:mt-0",
        className,
      )}
      data-slot="tabs-content"
      data-state="active"
      role="tabpanel"
    >
      {children}
    </div>
  );
}
