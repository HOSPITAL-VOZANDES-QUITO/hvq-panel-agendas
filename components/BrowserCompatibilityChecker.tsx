// Componente para verificar y mostrar información de compatibilidad del navegador
'use client'

import { useCompatibilityWarnings } from '@/hooks/use-browser-compat'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, CheckCircle, Info } from 'lucide-react'

interface BrowserCompatibilityCheckerProps {
  showDetails?: boolean
}

export function BrowserCompatibilityChecker({ showDetails = false }: BrowserCompatibilityCheckerProps) {
  const compat = useCompatibilityWarnings()

  if (compat.isLoading) {
    return null // No mostrar nada mientras carga
  }

  // Solo mostrar si hay advertencias o si se solicitan detalles
  if (!showDetails && compat.warnings.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      {/* Alerta principal si hay problemas de compatibilidad */}
      {!compat.isCompatible && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Navegador No Compatible</AlertTitle>
          <AlertDescription>
            Su navegador no soporta todas las funcionalidades necesarias. 
            Algunas características pueden no funcionar correctamente.
          </AlertDescription>
        </Alert>
      )}

      {/* Advertencias específicas */}
      {compat.warnings.length > 0 && compat.isCompatible && (
        <Alert variant="default">
          <Info className="h-4 w-4" />
          <AlertTitle>Funcionalidad Limitada</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 mt-2">
              {compat.warnings.map((warning, index) => (
                <li key={index} className="text-sm">{warning}</li>
              ))}
            </ul>
            {compat.isCent && (
              <p className="mt-2 text-sm font-medium">
                💡 Recomendación: Actualice a Chrome, Firefox o Edge más recientes para una mejor experiencia.
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Información detallada (solo si se solicita) */}
      {showDetails && compat.info && (
        <Alert variant="default">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Información del Navegador</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-1 text-sm">
              <p><strong>Navegador:</strong> {compat.info.userAgent}</p>
              <p><strong>Fetch API:</strong> {compat.info.supportsFetch ? '✅' : '❌'}</p>
              <p><strong>AbortController:</strong> {compat.info.supportsAbortController ? '✅' : '❌'}</p>
              <p><strong>AbortSignal.timeout:</strong> {compat.info.supportsAbortSignalTimeout ? '✅' : '❌ (usando polyfill)'}</p>
              <p><strong>Promises:</strong> {compat.info.supportsPromise ? '✅' : '❌'}</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Estado completamente compatible */}
      {showDetails && compat.isCompatible && compat.warnings.length === 0 && (
        <Alert variant="default">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Navegador Compatible</AlertTitle>
          <AlertDescription>
            Su navegador soporta todas las funcionalidades necesarias.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

// Componente simple que solo muestra advertencias críticas
export function BrowserCompatibilityWarning() {
  return <BrowserCompatibilityChecker showDetails={false} />
}

// Componente completo con toda la información
export function BrowserCompatibilityDetails() {
  return <BrowserCompatibilityChecker showDetails={true} />
}
