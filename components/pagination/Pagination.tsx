"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { COLORS } from "@/lib/constants"
import type { PaginationProps } from "@/lib/types"

export const Pagination = memo(function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  // Calcular qué páginas mostrar
  const getVisiblePages = () => {
    const maxVisible = 5
    const pages = []
    
    if (totalPages <= maxVisible) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Si hay muchas páginas, mostrar páginas inteligentemente
      const start = Math.max(1, currentPage - 2)
      const end = Math.min(totalPages, start + maxVisible - 1)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
    }
    
    return pages
  }

  const visiblePages = getVisiblePages()

  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t flex-shrink-0" style={{ borderColor: COLORS.BORDER }}>
      <div className="text-sm" style={{ color: COLORS.TEXT_MUTED }}>
        Página {currentPage} de {totalPages}
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            borderColor: COLORS.BORDER,
            color: COLORS.TEXT_DARK,
          }}
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </Button>

        <div className="flex gap-1">
          {visiblePages.map((pageNum) => (
            <Button
              key={pageNum}
              variant={currentPage === pageNum ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(pageNum)}
              style={
                currentPage === pageNum 
                  ? { backgroundColor: COLORS.PRIMARY, color: COLORS.TEXT_LIGHT }
                  : { borderColor: COLORS.BORDER, color: COLORS.TEXT_DARK }
              }
            >
              {pageNum}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            borderColor: COLORS.BORDER,
            color: COLORS.TEXT_DARK,
          }}
        >
          Siguiente
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
})
