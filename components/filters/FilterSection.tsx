"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, Search } from "lucide-react"
import { COLORS } from "@/lib/constants"
import type { FilterSectionProps } from "@/lib/types"

export const FilterSection = memo(function FilterSection({
  filters,
  onFilterChange,
  onClearFilters,
  specialties,
  buildings,
  filteredRecords,
  records,
  paginatedRecords,
}: FilterSectionProps) {
  const hasActiveFilters = filters.search || filters.especialidad || filters.edificio || filters.tipo

  return (
    <div className="mb-6 p-4 bg-[#F9F4F6] rounded-lg border border-[#E5E5E5]">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4" style={{ color: COLORS.PRIMARY }} />
        <h3 className="font-semibold" style={{ color: COLORS.TEXT_DARK }}>Filtros</h3>
        {hasActiveFilters && (
          <span 
            className="px-2 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: COLORS.PRIMARY, color: COLORS.TEXT_LIGHT }}
          >
            Filtros activos
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
        {/* Búsqueda */}
        <div className="space-y-2">
          <label className="text-xs font-medium" style={{ color: COLORS.TEXT_DARK }}>Búsqueda</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4" style={{ color: COLORS.TEXT_MUTED }} />
            <Input
              placeholder="Buscar médico, especialidad, edificio, día..."
              value={filters.search}
              onChange={(e) => onFilterChange("search", e.target.value)}
              className="pl-10"
              style={{
                borderColor: COLORS.BORDER,
                '--tw-ring-color': COLORS.PRIMARY,
              } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Especialidad */}
        <div className="space-y-2">
          <label className="text-xs font-medium" style={{ color: COLORS.TEXT_DARK }}>Especialidad</label>
          <Select
            value={filters.especialidad}
            onValueChange={(value) => onFilterChange("especialidad", value)}
          >
            <SelectTrigger 
              className="min-w-0 max-w-full"
              style={{
                borderColor: COLORS.BORDER,
                '--tw-ring-color': COLORS.PRIMARY,
              } as React.CSSProperties}
            >
              <SelectValue 
                placeholder="Seleccionar especialidad"
                className="truncate text-left"
              />
            </SelectTrigger>
            <SelectContent className="max-w-[400px]">
              <SelectItem value="todas">Todas las especialidades</SelectItem>
              {Array.isArray(specialties) && 
                [...specialties]
                  .sort((a, b) => a.descripcion.localeCompare(b.descripcion))
                  .map((esp, index) => (
                    <SelectItem 
                      key={`filter-specialty-${esp.especialidadId}-${index}`} 
                      value={esp.descripcion}
                      className="truncate"
                      title={esp.descripcion}
                    >
                      {esp.descripcion}
                    </SelectItem>
                  ))
              }
            </SelectContent>
          </Select>
        </div>

        {/* Edificio */}
        <div className="space-y-2">
          <label className="text-xs font-medium" style={{ color: COLORS.TEXT_DARK }}>Edificio</label>
          <Select 
            value={filters.edificio} 
            onValueChange={(value) => onFilterChange("edificio", value)}
          >
            <SelectTrigger 
              className="min-w-0 max-w-full"
              style={{
                borderColor: COLORS.BORDER,
                '--tw-ring-color': COLORS.PRIMARY,
              } as React.CSSProperties}
            >
              <SelectValue 
                placeholder="Seleccionar edificio"
                className="truncate text-left"
              />
            </SelectTrigger>
            <SelectContent className="max-w-[300px]">
              <SelectItem value="todos">Todos los edificios</SelectItem>
              {Array.isArray(buildings) && buildings
                .filter(edificio => edificio.descripcion_edificio)
                .map((edificio, index) => (
                  <SelectItem 
                    key={`edificio-filter-${edificio.codigo_edificio}-${index}`} 
                    value={edificio.descripcion_edificio!}
                    className="truncate"
                    title={edificio.descripcion_edificio!}
                  >
                    {edificio.descripcion_edificio!}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tipo de Agenda */}
        <div className="space-y-2">
          <label className="text-xs font-medium" style={{ color: COLORS.TEXT_DARK }}>Tipo de Agenda</label>
          <Select 
            value={filters.tipo} 
            onValueChange={(value) => onFilterChange("tipo", value)}
          >
            <SelectTrigger 
              className="min-w-0 max-w-full"
              style={{
                borderColor: COLORS.BORDER,
                '--tw-ring-color': COLORS.PRIMARY,
              } as React.CSSProperties}
            >
              <SelectValue 
                placeholder="Seleccionar tipo"
                className="truncate text-left"
              />
            </SelectTrigger>
            <SelectContent className="max-w-[300px]">
              <SelectItem value="todos">Todos los tipos</SelectItem>
              <SelectItem value="Consulta">Consulta</SelectItem>
              <SelectItem value="Procedimiento">Procedimiento</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClearFilters}
            style={{
              borderColor: COLORS.BORDER,
              color: COLORS.TEXT_DARK,
              backgroundColor: 'transparent',
            }}
          >
            Limpiar Filtros
          </Button>
          {filters.search && (
            <Button
              variant="outline"
              onClick={() => onFilterChange("search", "")}
              style={{
                borderColor: COLORS.BORDER,
                color: COLORS.TEXT_DARK,
                backgroundColor: 'transparent',
              }}
            >
              <Search className="w-4 h-4 mr-1" />
              Limpiar Búsqueda
            </Button>
          )}
        </div>
        <div className="text-sm" style={{ color: COLORS.TEXT_MUTED }}>
          {filteredRecords.length !== records.length ? (
            <span>
              Mostrando {paginatedRecords.length} de {filteredRecords.length} registros
              <span className="font-medium ml-1" style={{ color: COLORS.PRIMARY }}>
                (filtrados de {records.length} total)
              </span>
            </span>
          ) : (
            <span>Mostrando {paginatedRecords.length} de {filteredRecords.length} registros</span>
          )}
        </div>
      </div>
         </div>
   )
 })
