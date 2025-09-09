// Utilidades de compatibilidad para navegadores antiguos
// Especialmente para Cent Browser y navegadores que no soportan AbortSignal.timeout

/**
 * Polyfill para AbortSignal.timeout que no existe en navegadores antiguos
 * @param delay Tiempo en milisegundos para el timeout
 * @returns AbortSignal que se activa después del delay especificado
 */
export function createTimeoutSignal(delay: number): AbortSignal {
  // Verificar si AbortSignal.timeout está disponible (navegadores modernos)
  if (typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal) {
    return AbortSignal.timeout(delay)
  }

  // Implementación manual para navegadores antiguos
  const controller = new AbortController()
  
  setTimeout(() => {
    controller.abort()
  }, delay)
  
  return controller.signal
}

/**
 * Verifica si el navegador soporta AbortSignal.timeout
 * @returns true si soporta la API moderna, false si necesita polyfill
 */
export function supportsAbortSignalTimeout(): boolean {
  return typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal
}

/**
 * Verifica si el navegador soporta AbortController
 * @returns true si soporta AbortController básico
 */
export function supportsAbortController(): boolean {
  return typeof AbortController !== 'undefined'
}

/**
 * Crea un fetch con timeout compatible con navegadores antiguos
 * @param url URL para el fetch
 * @param options Opciones de fetch
 * @param timeout Timeout en milisegundos
 * @returns Promise del fetch con timeout
 */
export async function fetchWithTimeout(
  url: string, 
  options: RequestInit = {}, 
  timeout: number = 5000
): Promise<Response> {
  
  // Si el navegador no soporta AbortController, usar fetch básico sin timeout
  if (!supportsAbortController()) {
    console.warn('⚠️ AbortController no soportado - ejecutando fetch sin timeout')
    return fetch(url, options)
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

/**
 * Información de compatibilidad del navegador actual
 */
export function getBrowserCompatibilityInfo() {
  const info = {
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
    supportsAbortController: supportsAbortController(),
    supportsAbortSignalTimeout: supportsAbortSignalTimeout(),
    supportsFetch: typeof fetch !== 'undefined',
    supportsPromise: typeof Promise !== 'undefined',
    supportsAsyncAwait: true, // Si este código se ejecuta, ya soporta async/await
  }

  console.log('🔍 Browser Compatibility Info:', info)
  return info
}

/**
 * Detecta si el navegador es Cent Browser u otros navegadores problemáticos
 */
export function isCentBrowser(): boolean {
  if (typeof navigator === 'undefined') return false
  return navigator.userAgent.includes('CentBrowser')
}

/**
 * Detecta navegadores antiguos que pueden tener problemas con APIs modernas
 */
export function isLegacyBrowser(): boolean {
  if (typeof navigator === 'undefined') return false
  
  const ua = navigator.userAgent
  
  // Detectar navegadores conocidos por tener problemas
  const legacyPatterns = [
    /CentBrowser/i,
    /Chrome\/[1-5][0-9]\./,  // Chrome < 60
    /Firefox\/[1-4][0-9]\./,  // Firefox < 50
    /Safari\/[1-9]\./,        // Safari muy antiguo
    /Edge\/1[0-5]\./,         // Edge < 16
    /MSIE/,                   // Internet Explorer
    /Trident/                 // Internet Explorer modo compatibilidad
  ]
  
  return legacyPatterns.some(pattern => pattern.test(ua))
}
