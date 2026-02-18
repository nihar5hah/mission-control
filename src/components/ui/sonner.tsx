"use client"

import { Toaster as Sonner } from "sonner"

export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        className:
          "glass-card liquid-border text-[#FAFAFA] border border-white/10",
      }}
      theme="dark"
      richColors
    />
  )
}
