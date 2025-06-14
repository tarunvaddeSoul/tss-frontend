"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { type ButtonProps, buttonVariants } from "@/components/ui/button"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  // Generate page numbers to show
  const getPageNumbers = () => {
    const pageNumbers = []

    // Always show first page
    pageNumbers.push(1)

    // Current page and neighbors
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (!pageNumbers.includes(i)) {
        pageNumbers.push(i)
      }
    }

    // Always show last page if there are more than 1 page
    if (totalPages > 1) {
      pageNumbers.push(totalPages)
    }

    // Sort and add ellipsis markers
    const sortedNumbers = [...new Set(pageNumbers)].sort((a, b) => a - b)
    const result = []

    for (let i = 0; i < sortedNumbers.length; i++) {
      result.push(sortedNumbers[i])

      // Add ellipsis if there's a gap
      if (sortedNumbers[i + 1] && sortedNumbers[i + 1] - sortedNumbers[i] > 1) {
        result.push("ellipsis")
      }
    }

    return result
  }

  const pageNumbers = getPageNumbers()

  if (totalPages <= 1) {
    return null
  }

  return (
    <nav role="navigation" aria-label="pagination" className={cn("mx-auto flex w-full justify-center", className)}>
      <div className="flex items-center space-x-2">
        <PaginationItem onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous Page</span>
        </PaginationItem>

        {pageNumbers.map((page, i) => {
          if (page === "ellipsis") {
            return (
              <PaginationItem key={`ellipsis-${i}`} disabled>
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More pages</span>
              </PaginationItem>
            )
          }

          return (
            <PaginationItem key={page} isActive={page === currentPage} onClick={() => onPageChange(page as number)}>
              {page}
            </PaginationItem>
          )
        })}

        <PaginationItem
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next Page</span>
        </PaginationItem>
      </div>
    </nav>
  )
}

interface PaginationItemProps extends React.HTMLAttributes<HTMLButtonElement> {
  isActive?: boolean
  disabled?: boolean
}

function PaginationItem({ className, isActive, disabled, children, ...props }: PaginationItemProps) {
  return (
    <button
      aria-current={isActive ? "page" : undefined}
      disabled={disabled}
      className={cn(
        buttonVariants({
          variant: isActive ? "default" : "outline",
          size: "icon",
        }),
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn("flex flex-row items-center gap-1", className)} {...props} />
  ),
)
PaginationContent.displayName = "PaginationContent"

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">

const PaginationLink = ({ className, isActive, size = "icon", ...props }: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      className,
    )}
    {...props}
  />
)
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink aria-label="Go to previous page" size="default" className={cn("gap-1 pl-2.5", className)} {...props}>
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink aria-label="Go to next page" size="default" className={cn("gap-1 pr-2.5", className)} {...props}>
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
)
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<"span">) => (
  <span aria-hidden className={cn("flex h-9 w-9 items-center justify-center", className)} {...props}>
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export { Pagination, PaginationContent, PaginationEllipsis, PaginationLink, PaginationNext, PaginationPrevious, PaginationItem }
