"use client"

import { cn } from "@/lib/utils"
import { Switch as SwitchPrimitive, type SwitchProps as SwitchPrimitiveProps } from "@base-ui/react/switch"
import * as React from "react"

function Switch({
  className,
  ...props
}: SwitchPrimitiveProps) {
  return (
    <SwitchPrimitive
      data-slot="switch"
      className={cn(
        "peer inline-flex h-[1.15rem] w-9 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:focus-visible:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80",
        className
      )}
      {...props}
    >
      <span
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-4 rounded-full bg-background ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-slate-200"
        )}
      />
    </SwitchPrimitive>
  )
}

export { Switch }
