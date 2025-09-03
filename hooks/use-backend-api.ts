"use client"

import { useState, useEffect, useCallback } from "react"
import { apiService } from "@/lib/api-service"
import type { Doctor, Agenda, Edificio, Piso, Especialidad } from "@/lib/types"

// Estados de carga
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

// Hook personalizado para usar la API del backend real
export function useBackendAPI() {
  const [loading, setLoading] = useState<LoadingState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking')

  // Verificar conexión con el backend
  const checkConnection = useCallback(async () => {
    try {
      setConnectionStatus('checking')
      console.log('🔍 Verificando conexión con el backend...')
      
      // Primero verificar conectividad básica
      const isConnected = await apiService.checkServerConnection()
      
      if (isConnected) {
        // Si hay conectividad, hacer health check completo
        const healthCheck = await apiService.getHealth()
        
        if (healthCheck.success) {
          setConnectionStatus('connected')
          setError(null)
          console.log('✅ Conexión exitosa con el backend')
          console.log('📊 Datos del servidor:', healthCheck.data)
        } else {
          setConnectionStatus('disconnected')
          setError(`Backend respondió con error: ${healthCheck.message}`)
          console.error('❌ Error de health check:', healthCheck.message)
        }
      } else {
        setConnectionStatus('disconnected')
        setError('No se puede conectar al servidor. Verifique la URL y que el servidor esté ejecutándose.')
        console.error('❌ No se puede conectar al servidor')
      }
    } catch (err) {
      setConnectionStatus('disconnected')
      setError('Error al verificar conexión con el backend')
      console.error('❌ Error verificando conexión:', err)
    }
  }, [])

  // Verificar conexión al montar el componente
  useEffect(() => {
    checkConnection()
  }, [checkConnection])

  // ===== MÉDICOS =====
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [specialties, setSpecialties] = useState<Especialidad[]>([])

  // Algunos endpoints del backend devuelven { data: [...] } y otros devuelven directamente [...]
  // Esta utilidad unifica ambas respuestas de forma segura.
  const unwrap = useCallback((payload: any) => {
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return (payload as any).data
    }
    return payload
  }, [])

  const loadDoctors = useCallback(async () => {
    setLoading('loading')
    console.log('Cargando medicos desde el backend...')
    try {
      const result = await apiService.getDoctors()
      if (result.success) {
        // El backend devuelve {success: true, data: [...], total: X}
        console.log('Estructura completa de result.data para medicos:', result.data)
        const rawData = unwrap(result.data)
        const doctorsData = Array.isArray(rawData) ? rawData : []
        setDoctors(doctorsData)
        setError(null)
        setLoading('success')
        console.log(`Medicos cargados: ${doctorsData.length} registros`)
        console.log('Primeros 3 medicos:', doctorsData.slice(0, 3))
        console.log('Estructura del primer medico:', doctorsData[0])
      } else {
        setError(result.message || 'No se pudieron cargar médicos')
        setDoctors([])
        setLoading('error')
      }
    } catch (err) {
      setError('Error de conexión al cargar médicos')
      setDoctors([])
      setLoading('error')
    }
  }, [])

  const loadSpecialties = useCallback(async () => {
    setLoading('loading')
    console.log('Cargando especialidades desde el backend...')
    try {
      const result = await apiService.getSpecialties()
      if (result.success) {
        // El backend devuelve {success: true, data: [...], total: X}
        console.log('Estructura completa de result.data para especialidades:', result.data)
        const rawData = unwrap(result.data)
        const dataArray = Array.isArray(rawData) ? rawData : []
        // Guardar objetos completos de especialidades con especialidadId y descripcion
        const specialtiesData = dataArray.filter((esp: any) => esp.especialidadId && esp.descripcion)
        setSpecialties(specialtiesData)
        setError(null)
        setLoading('success')
        console.log(`Especialidades cargadas: ${specialtiesData.length} registros`)
        console.log('Primeras 3 especialidades:', specialtiesData.slice(0, 3))
        console.log('Estructura de especialidad:', specialtiesData[0])
      } else {
        setError(result.message || 'No se pudieron cargar especialidades')
        setSpecialties([])
        setLoading('error')
      }
    } catch (err) {
      setError('Error de conexión al cargar especialidades')
      setSpecialties([])
      setLoading('error')
    }
  }, [])

  const getDoctorsBySpecialty = useCallback(async (especialidad: string) => {
    setLoading('loading')
    try {
      const result = await apiService.getDoctorsBySpecialty(especialidad)
      if (result.success) {
        const rawData = unwrap(result.data)
        const doctorsData = Array.isArray(rawData) ? rawData : []
        setDoctors(doctorsData)
        setError(null)
        setLoading('success')
      } else {
        setError(result.message || 'Error al filtrar médicos')
        setLoading('error')
      }
    } catch (err) {
      setError('Error al filtrar médicos')
      setLoading('error')
    }
  }, [])

  // ===== AGENDAS =====
  const [agendas, setAgendas] = useState<Agenda[]>([])

  const loadAgendas = useCallback(async (filtros?: {
    page?: number
    limit?: number
    fecha_inicio?: string
    fecha_fin?: string
    estado?: string
  }) => {
    setLoading('loading')
    console.log('Cargando agendas desde el backend...', filtros || 'sin filtros')
    try {
      const result = await apiService.getAgendas(filtros)
      if (result.success) {
        // El backend devuelve {success: true, data: [...], total: X}
        console.log('Estructura completa de result.data para agendas:', result.data)
        const rawData = unwrap(result.data)
        const agendasData = Array.isArray(rawData) ? rawData : []
        setAgendas(agendasData)
        setError(null)
        setLoading('success')
        console.log(`Agendas cargadas: ${agendasData.length} registros`)
        if (agendasData.length > 0) {
          console.log('Primera agenda:', agendasData[0])
          console.log('Estructura completa de la primera agenda:', JSON.stringify(agendasData[0], null, 2))
        }
      } else {
        setError(result.message || 'No se pudieron cargar agendas')
        setAgendas([])
        setLoading('error')
      }
    } catch (err) {
      setError('Error de conexión al cargar agendas')
      setAgendas([])
      setLoading('error')
    }
  }, [])

  const createAgenda = useCallback(async (agendaData: Omit<Agenda, "id">) => {
    setLoading('loading')
    console.log('Creando nueva agenda:', agendaData)
    try {
      const result = await apiService.createAgenda(agendaData)
      if (result.success) {
        // Recargar agendas después de crear
        await loadAgendas()
        setError(null)
        setLoading('success')
        console.log('Agenda creada exitosamente:', result.data)
        return result.data
      } else {
        setError(result.message || 'Error al crear agenda')
        setLoading('error')
        console.error('Error al crear agenda:', result.message)
        return null
      }
    } catch (err) {
      setError('Error al crear agenda')
      setLoading('error')
      console.error('Error al crear agenda:', err)
      return null
    }
  }, [loadAgendas])

  const updateAgenda = useCallback(async (id: number, agendaData: Partial<Agenda>) => {
    setLoading('loading')
    console.log('Actualizando agenda ID:', id, 'Datos:', agendaData)
    try {
      const result = await apiService.updateAgenda(id, agendaData)
      if (result.success) {
        // Recargar agendas después de actualizar
        await loadAgendas()
        setError(null)
        setLoading('success')
        console.log('Agenda actualizada exitosamente:', result.data)
        return result.data
      } else {
        setError(result.message || 'Error al actualizar agenda')
        setLoading('error')
        console.error('Error al actualizar agenda:', result.message)
        console.error('Respuesta completa del backend:', result)
        return null
      }
    } catch (err) {
      setError('Error al actualizar agenda')
      setLoading('error')
      console.error('Error al actualizar agenda:', err)
      console.error('Tipo de error:', typeof err)
      console.error('Detalles del error:', err)
      return null
    }
  }, [loadAgendas])

  const deleteAgenda = useCallback(async (id: number) => {
    setLoading('loading')
    try {
      const result = await apiService.deleteAgenda(id)
      if (result.success) {
        // Recargar agendas después de eliminar
        await loadAgendas()
        setError(null)
        setLoading('success')
        return true
      } else {
        setError(result.message || 'Error al eliminar agenda')
        setLoading('error')
        return false
      }
    } catch (err) {
      setError('Error al eliminar agenda')
      setLoading('error')
      return false
    }
  }, [loadAgendas])

  const cancelAgenda = useCallback(async (id: number) => {
    setLoading('loading')
    try {
      const result = await apiService.cancelAgenda(id)
      if (result.success) {
        // Recargar agendas después de cancelar
        await loadAgendas()
        setError(null)
        setLoading('success')
        return result.data
      } else {
        setError(result.message || 'Error al cancelar agenda')
        setLoading('error')
        return null
      }
    } catch (err) {
      setError('Error al cancelar agenda')
      setLoading('error')
      return null
    }
  }, [loadAgendas])

  // ===== CATÁLOGOS =====
  const [buildings, setBuildings] = useState<Edificio[]>([])
  const [consultorios, setConsultorios] = useState<any[]>([])
  const [days, setDays] = useState<any[]>([])

  const loadBuildings = useCallback(async () => {
    setLoading('loading')
    console.log('Cargando edificios desde el backend...')
    try {
      const result = await apiService.getBuildings()
      if (result.success) {
        // El backend devuelve {success: true, data: [...], total: X}
        const rawData = unwrap(result.data)
        const buildingsData = Array.isArray(rawData) ? rawData : []
        setBuildings(buildingsData)
        setError(null)
        setLoading('success')
        console.log(`Edificios cargados: ${buildingsData.length} registros`)
        console.log('Edificios:', buildingsData)
      } else {
        setError(result.message || 'No se pudieron cargar edificios')
        setBuildings([])
        setLoading('error')
      }
    } catch (err) {
      setError('Error de conexión al cargar edificios')
      setBuildings([])
      setLoading('error')
    }
  }, [])

  const loadConsultorios = useCallback(async () => {
    setLoading('loading')
    try {
      const result = await apiService.getConsultorios()
      if (result.success) {
        const rawData = unwrap(result.data)
        const consultoriosData = Array.isArray(rawData) ? rawData : []
        // Normalizar llaves posibles del backend (CD_* mayúsculas)
        const normalized = consultoriosData.map((c: any) => {
          console.log('Consultorio RAW del backend:', c)
          
          // El backend debe devolver la descripción del piso, sino usar código
          let descripcionPiso = c.descripcion_piso ?? c.DES_PISO ?? c.des_piso ?? null
          
          // Si no hay descripción del piso, usar el código del piso
          if (!descripcionPiso && c.codigo_piso) {
            descripcionPiso = `Piso ${c.codigo_piso}`
          }
          
          const normalizedConsultorio = {
            codigo_consultorio: c.codigo_consultorio ?? c.CD_CONSULTORIO ?? c.cd_consultorio ?? null,
            codigo_edificio: c.codigo_edificio ?? c.CD_EDIFICIO ?? c.cd_edificio ?? null,
            codigo_piso: c.codigo_piso ?? c.CD_PISO ?? c.cd_piso ?? null,
            descripcion_consultorio: c.descripcion_consultorio ?? c.DES_CONSULTORIO ?? c.des_consultorio ?? c.descripcion ?? null,
            descripcion_piso: descripcionPiso,
            // preservar resto por si se usa en otro lado
            ...c,
          }
          
          console.log('Consultorio normalizado:', normalizedConsultorio)
          return normalizedConsultorio
        })
        console.log('Consultorios cargados del backend:', normalized.length, 'registros')
        console.log('Datos RAW del backend:', rawData)
        console.log('Estructura de consultorio ejemplo:', normalized[0])
        console.log('Todos los consultorios normalizados:', normalized)
        setConsultorios(normalized)
        setError(null)
        setLoading('success')
      } else {
        setError(result.message || 'Error al cargar consultorios')
        setConsultorios([])
        setLoading('error')
      }
    } catch (err) {
      setError('Error al cargar consultorios')
      setConsultorios([])
      setLoading('error')
    }
  }, [])

  const loadDays = useCallback(async () => {
    setLoading('loading')
    try {
      const result = await apiService.getDays()
      if (result.success) {
        const rawData = unwrap(result.data)
        const daysData = Array.isArray(rawData) ? rawData : []
        setDays(daysData)
        setError(null)
        setLoading('success')
      } else {
        setError(result.message || 'Error al cargar días')
        setLoading('error')
      }
    } catch (err) {
      setError('Error al cargar días')
      setLoading('error')
    }
  }, [])

  // Función para cargar pisos de un edificio específico
  const loadBuildingFloors = useCallback(async (codigoEdificio: string | number): Promise<Piso[]> => {
    try {
      console.log('🏢 Cargando pisos para edificio:', codigoEdificio)
      const result = await apiService.getBuildingFloors(codigoEdificio.toString())
      console.log('📡 Respuesta del endpoint pisos:', result)
      
      if (result.success) {
        const pisosData = unwrap(result.data)
        const pisos = Array.isArray(pisosData) ? pisosData : []
        console.log('✅ Pisos cargados del backend:', pisos)
        console.log('📊 Estructura de piso ejemplo:', pisos[0])
        return pisos
      } else {
        console.error('❌ Error loading building floors:', result.message)
        return []
      }
    } catch (error) {
      console.error('❌ Error loading building floors:', error)
      return []
    }
  }, [])

  // ===== FUNCIONES DE UTILIDAD =====
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const resetLoading = useCallback(() => {
    setLoading('idle')
  }, [])

  return {
    // Estados
    loading,
    error,
    connectionStatus,
    
    // Datos
    doctors,
    specialties,
    agendas,
    buildings,
    consultorios,
    days,
    
    // Funciones de médicos
    loadDoctors,
    loadSpecialties,
    getDoctorsBySpecialty,
    
    // Funciones de agendas
    loadAgendas,
    createAgenda,
    updateAgenda,
    deleteAgenda,
    cancelAgenda,
    
    // Funciones de catálogos
    loadBuildings,
    loadConsultorios,
    loadDays,
    loadBuildingFloors,
    
    // Funciones de utilidad
    checkConnection,
    clearError,
    resetLoading
  }
}
