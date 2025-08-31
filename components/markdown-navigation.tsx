"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { List, Hash } from "lucide-react"

interface HeadingItem {
  id: string
  text: string
  level: number
}

interface MarkdownNavigationProps {
  content: string
  isPreviewMode: boolean
}

export function MarkdownNavigation({ content, isPreviewMode }: MarkdownNavigationProps) {
  const [headings, setHeadings] = useState<HeadingItem[]>([])

  useEffect(() => {
    const lines = content.split("\n")
    const headingItems: HeadingItem[] = []

    lines.forEach((line) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/)
      if (match) {
        const level = match[1].length
        const text = match[2].trim()
        const id = `heading-${text.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`

        headingItems.push({
          id,
          text,
          level,
        })
      }
    })

    setHeadings(headingItems)
  }, [content])

  const scrollToHeading = (heading: HeadingItem) => {
    if (isPreviewMode) {
      const element = document.getElementById(heading.id)
      if (element) {
        const previewContainer = document.getElementById("preview-container")
        if (previewContainer) {
          const containerRect = previewContainer.getBoundingClientRect()
          const elementRect = element.getBoundingClientRect()
          const scrollTop = previewContainer.scrollTop + elementRect.top - containerRect.top - 20

          previewContainer.scrollTo({
            top: scrollTop,
            behavior: "smooth",
          })
        }
      }
    }
  }

  if (headings.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8">
          <List className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Outline</span>
          <span className="sm:hidden">TOC</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 max-h-80 overflow-y-auto">
        {headings.map((heading, index) => (
          <DropdownMenuItem
            key={`${heading.id}-${index}`}
            onClick={() => scrollToHeading(heading)}
            className="flex items-start py-2 cursor-pointer"
            disabled={!isPreviewMode}
          >
            <div className="flex items-center w-full">
              <Hash className="h-3 w-3 mr-2 text-muted-foreground flex-shrink-0" />
              <div
                className="text-sm truncate"
                style={{
                  paddingLeft: `${(heading.level - 1) * 12}px`,
                  opacity: heading.level > 2 ? 0.8 : 1,
                }}
              >
                {heading.text}
              </div>
            </div>
          </DropdownMenuItem>
        ))}
        {!isPreviewMode && (
          <div className="px-2 py-1 text-xs text-muted-foreground border-t border-border mt-1">
            Switch to Preview mode to navigate
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
