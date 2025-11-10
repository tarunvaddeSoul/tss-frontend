import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoaderProps {
  /**
   * Optional text to display below the spinner
   */
  text?: string
  /**
   * Size of the loader
   * @default "default"
   */
  size?: "sm" | "default" | "lg"
  /**
   * Whether to show as full page loader
   * @default false
   */
  fullPage?: boolean
  /**
   * Custom height for full page loader
   * @default "calc(100vh-200px)"
   */
  height?: string
  /**
   * Additional className
   */
  className?: string
}

const sizeMap = {
  sm: "h-4 w-4",
  default: "h-8 w-8",
  lg: "h-12 w-12",
}

const textSizeMap = {
  sm: "text-xs",
  default: "text-sm",
  lg: "text-base",
}

export function Loader({
  text,
  size = "default",
  fullPage = false,
  height = "calc(100vh-200px)",
  className,
}: LoaderProps) {
  const loaderContent = (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <Loader2 className={cn("text-primary animate-spin", sizeMap[size])} />
      {text && (
        <div className={cn("text-muted-foreground", textSizeMap[size])}>
          {text}
        </div>
      )}
    </div>
  )

  if (fullPage) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height }}
      >
        {loaderContent}
      </div>
    )
  }

  return loaderContent
}

/**
 * Inline loader for use within components/sections
 */
export function InlineLoader({
  text,
  size = "default",
  className,
}: Omit<LoaderProps, "fullPage" | "height">) {
  return (
    <div className={cn("flex items-center justify-center py-8", className)}>
      <div className="text-center space-y-2">
        <Loader2 className={cn("text-primary animate-spin mx-auto", sizeMap[size])} />
        {text && (
          <p className={cn("text-muted-foreground", textSizeMap[size])}>
            {text}
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * Button loader - smaller spinner for use in buttons
 */
export function ButtonLoader({ className }: { className?: string }) {
  return <Loader2 className={cn("h-4 w-4 animate-spin", className)} />
}

