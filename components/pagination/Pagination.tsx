"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
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
      
      <div className="flex items-center gap-1">
        {/* Botón Primera Página */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          style={{
            borderColor: COLORS.BORDER,
            color: COLORS.TEXT_DARK,
          }}
          title="Primera página"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>

        {/* Botón Página Anterior */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            borderColor: COLORS.BORDER,
            color: COLORS.TEXT_DARK,
          }}
          title="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Separador visual */}
        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Números de página */}
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
              title={`Página ${pageNum}`}
            >
              {pageNum}
            </Button>
          ))}
        </div>

        {/* Separador visual */}
        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Botón Página Siguiente */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            borderColor: COLORS.BORDER,
            color: COLORS.TEXT_DARK,
          }}
          title="Página siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        {/* Botón Última Página */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          style={{
            borderColor: COLORS.BORDER,
            color: COLORS.TEXT_DARK,
          }}
          title="Última página"
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
})
