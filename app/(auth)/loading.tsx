import { Shield } from "lucide-react"

export default function AuthLoading() {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-tss-background/90 to-tss-background">
      <div className="flex flex-col items-center gap-4">
        <Shield className="h-12 w-12 text-primary animate-pulse" />
        <div className="text-tss-text/80 text-sm">Loading...</div>
      </div>
    </div>
  )
}
