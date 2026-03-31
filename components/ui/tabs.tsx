"use client"

import { cn } from "@/lib/utils"
import { Tabs as TabsPrimitive, type TabsProps as TabsPrimitiveProps } from "@base-ui/react/tabs"
import * as React from "react"

function Tabs({ className, ...props }: TabsPrimitiveProps) {
  return (
    <TabsPrimitive
      data-slot="tabs"
      className={cn("w-full", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-white transition-all focus-visible:border-ring focus-visible:outline-ring focus-visible:outline-1 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow dark:ring-offset-slate-950 dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:text-slate-50",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        "mt-2 ring-offset-white focus-visible:border-ring focus-visible:outline-ring focus-visible:outline-1 focus-visible:ring-3 focus-visible:ring-ring/50 dark:ring-offset-slate-950",
        className
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
