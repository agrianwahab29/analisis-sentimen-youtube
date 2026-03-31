"use client"

import { cn } from "@/lib/utils"
import { Separator as SeparatorPrimitive, type SeparatorProps as SeparatorPrimitiveProps } from "@base-ui/react/separator"
import * as React from "react"

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: SeparatorPrimitiveProps) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-slate-200 dark:bg-slate-800",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
