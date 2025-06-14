import { Loader2 } from "lucide-react"

export default function SettingsLoading() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-200px)]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <div className="text-tss-text/80 text-sm">Loading settings...</div>
      </div>
    </div>
  )
}
