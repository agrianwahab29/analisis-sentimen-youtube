"use client"

import { cn } from "@/lib/utils"
import { Label as LabelPrimitive, type LabelProps as LabelPrimitiveProps } from "@base-ui/react/label"
import * as React from "react"

function Label({
  className,
  ...props
}: LabelPrimitiveProps) {
  return (
    <LabelPrimitive
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
