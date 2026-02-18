"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

const actions = [
  { id: "morning-brief", label: "🌅 Morning Brief", endpoint: "/api/quick-actions/morning-brief" },
  { id: "sync-docs", label: "🔄 Sync Docs", endpoint: "/api/quick-actions/sync-docs" },
  { id: "refresh", label: "📊 Refresh", endpoint: "/api/quick-actions/refresh" },
  { id: "clear", label: "🧹 Clear Old", endpoint: "/api/quick-actions/clear" },
  { id: "export", label: "📋 Export", endpoint: "/api/quick-actions/export" },
  { id: "test-notify", label: "🔔 Test Notify", endpoint: "/api/quick-actions/test-notify" },
]

export function QuickActions() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleAction = async (action: typeof actions[0]) => {
    setLoading(action.id)
    try {
      const res = await fetch(action.endpoint, { method: "POST" })
      const data = await res.json()
      alert(data.message || "Done!")
    } catch (e) {
      alert("Error: " + e)
    } finally {
      setLoading(null)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-[#1a1a2e]/80 backdrop-blur-lg border border-white/10"
    >
      <h3 className="text-sm font-medium text-white/70 mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <Button
            key={action.id}
            onClick={() => handleAction(action)}
            disabled={loading === action.id}
            variant="outline"
            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            {loading === action.id ? "..." : action.label}
          </Button>
        ))}
      </div>
    </motion.div>
  )
}
