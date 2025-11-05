import { Loader } from "@/components/ui/loader"

export default function AuthLoading() {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-tss-background/90 to-tss-background">
      <Loader text="Loading..." size="lg" />
    </div>
  )
}
