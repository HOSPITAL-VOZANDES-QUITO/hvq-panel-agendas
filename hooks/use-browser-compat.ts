// Hook para verificar compatibilidad del navegador
import { useEffect, useState } from 'react'
import { getBrowserCompatibilityInfo, isLegacyBrowser, isCentBrowser } from '@/lib/browser-compat'
import { apiService } from '@/lib/api-service'

interface BrowserCompatibilityState {
  isLegacy: boolean
  isCent: boolean
  isCompatible: boolean
  warnings: string[]
  info: ReturnType<typeof getBrowserCompatibilityInfo> | null
  isLoading: boolean
}

export function useBrowserCompatibility() {
  const [state, setState] = useState<BrowserCompatibilityState>({
    isLegacy: false,
    isCent: false,
    isCompatible: true,
    warnings: [],
    info: null,
    isLoading: true
  })

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return

    const checkCompatibility = () => {
      const info = getBrowserCompatibilityInfo()
      const isLegacy = isLegacyBrowser()
      const isCent = isCentBrowser()
      const apiCheck = apiService.checkBrowserCompatibility()

      setState({
        isLegacy,
        isCent,
        isCompatible: apiCheck.isCompatible,
        warnings: apiCheck.warnings,
        info,
        isLoading: false
      })

      // Log información de compatibilidad
      if (isLegacy) {
        console.warn('⚠️ Navegador antiguo detectado:', info.userAgent)
      }
      
      if (isCent) {
        console.warn('⚠️ Cent Browser detectado - usando modo de compatibilidad')
      }

      if (apiCheck.warnings.length > 0) {
        console.warn('⚠️ Advertencias de compatibilidad:', apiCheck.warnings)
      }
    }

    checkCompatibility()
  }, [])

  return state
}

// Hook para mostrar advertencias de compatibilidad
export function useCompatibilityWarnings() {
  const compat = useBrowserCompatibility()
  
  useEffect(() => {
    if (!compat.isLoading && compat.warnings.length > 0) {
      // Mostrar advertencias solo una vez
      const hasShownWarning = sessionStorage.getItem('compat-warning-shown')
      
      if (!hasShownWarning) {
        console.group('⚠️ Advertencias de Compatibilidad del Navegador')
        compat.warnings.forEach(warning => {
          console.warn(`• ${warning}`)
        })
        
        if (compat.isCent) {
          console.warn('• Cent Browser detectado: Algunas funciones modernas pueden estar limitadas')
          console.info('💡 Recomendación: Actualizar a Chrome, Firefox o Edge más recientes para mejor experiencia')
        }
        
        console.groupEnd()
        sessionStorage.setItem('compat-warning-shown', 'true')
      }
    }
  }, [compat])

  return compat
}
