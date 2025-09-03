"use client"

import { useBackendAPI } from "@/hooks/use-backend-api"
import { useAgendaData } from "@/hooks/use-agenda-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function DebugInfo() {
  const {
    connectionStatus,
    loading,
    error,
    doctors,
    specialties,
    agendas,
    buildings,
    consultorios,
  } = useBackendAPI()

  const { buildingFloors } = useAgendaData()

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-sm">Información de Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <span>Estado de conexión:</span>
          <Badge variant={connectionStatus === 'connected' ? 'default' : 'destructive'}>
            {connectionStatus}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <span>Estado de carga:</span>
          <Badge variant="outline">{loading}</Badge>
        </div>

        {error && (
          <div className="text-red-600">
            <span>Error:</span> {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <strong>Médicos:</strong>
            <div className="text-gray-600">
              Tipo: {typeof doctors} | 
              Es Array: {Array.isArray(doctors) ? 'Sí' : 'No'} | 
              Longitud: {Array.isArray(doctors) ? doctors.length : 'N/A'}
            </div>
            {Array.isArray(doctors) && doctors.length > 0 && (
              <div className="text-gray-500 mt-1">
                Primer elemento: {JSON.stringify(doctors[0]).substring(0, 100)}...
              </div>
            )}
          </div>

          <div>
            <strong>Especialidades:</strong>
            <div className="text-gray-600">
              Tipo: {typeof specialties} | 
              Es Array: {Array.isArray(specialties) ? 'Sí' : 'No'} | 
              Longitud: {Array.isArray(specialties) ? specialties.length : 'N/A'}
            </div>
            {Array.isArray(specialties) && specialties.length > 0 && (
              <div className="text-gray-500 mt-1">
                Primer elemento: {JSON.stringify(specialties[0]).substring(0, 100)}...
              </div>
            )}
          </div>

          <div>
            <strong>Agendas:</strong>
            <div className="text-gray-600">
              Tipo: {typeof agendas} | 
              Es Array: {Array.isArray(agendas) ? 'Sí' : 'No'} | 
              Longitud: {Array.isArray(agendas) ? agendas.length : 'N/A'}
            </div>
          </div>

          <div>
            <strong>Edificios:</strong>
            <div className="text-gray-600">
              Tipo: {typeof buildings} | 
              Es Array: {Array.isArray(buildings) ? 'Sí' : 'No'} | 
              Longitud: {Array.isArray(buildings) ? buildings.length : 'N/A'}
            </div>
          </div>

          <div>
            <strong>Consultorios:</strong>
            <div className="text-gray-600">
              Tipo: {typeof consultorios} | 
              Es Array: {Array.isArray(consultorios) ? 'Sí' : 'No'} | 
              Longitud: {Array.isArray(consultorios) ? consultorios.length : 'N/A'}
            </div>
            {Array.isArray(consultorios) && consultorios.length > 0 && (
              <div className="text-gray-500 mt-1">
                Primer elemento: {JSON.stringify(consultorios[0]).substring(0, 150)}...
              </div>
            )}
          </div>

          <div>
            <strong>Pisos cargados:</strong>
            <div className="text-gray-600">
              Edificios con pisos: {Object.keys(buildingFloors).length}
            </div>
            {Object.keys(buildingFloors).length > 0 && (
              <div className="text-gray-500 mt-1">
                {Object.entries(buildingFloors).map(([edificio, pisos]) => (
                  <div key={edificio}>
                    Edificio {edificio}: {pisos.length} pisos
                    {pisos.slice(0, 2).map((piso, i) => (
                      <div key={i} className="ml-2">
                        {piso.codigo_piso}: {piso.descripcion_piso}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
