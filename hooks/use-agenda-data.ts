"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useBackendAPI } from "./use-backend-api"
import { 
  decodeTipo, 
  formatTime, 
  getDayName, 
  mapDayToCode, 
  formatTimeForBackend,
  generateUniqueId,
  isValidTimeFormat,
  sortByName,
  filterByText
} from "@/lib/utils"
import { APP_CONFIG } from "@/lib/constants"
import type { 
  CombinedRecord, 
  Filters, 
  Doctor, 
  Agenda, 
  Edificio, 
  Consultorio, 
  Piso,
  Especialidad,
  AgendaPayload 
} from "@/lib/types"

export function useAgendaData() {
  const {
    loading,
    error,
    connectionStatus,
    doctors,
    agendas,
    buildings,
    specialties,
    consultorios,
    loadDoctors,
    loadAgendas,
    loadBuildings,
    loadSpecialties,
    loadConsultorios,
    loadBuildingFloors,
    createAgenda,
    updateAgenda,
    deleteAgenda,
    clearError,
  } = useBackendAPI()

  const [records, setRecords] = useState<CombinedRecord[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    especialidad: "",
    edificio: "",
    piso: "",
    tipo: "",
    search: "",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [openPopovers, setOpenPopovers] = useState<{[key: string]: boolean}>({})
  const [buildingFloors, setBuildingFloors] = useState<{[key: string]: Piso[]}>({})
  const [alertState, setAlertState] = useState<{
    isOpen: boolean
    message: string
    type: "success" | "error" | "warning" | "info"
  }>({
    isOpen: false,
    message: "",
    type: "info"
  })

  // Cargar datos del backend
  useEffect(() => {
    if (connectionStatus === 'connected') {
      loadDoctors()
      loadAgendas()
      loadBuildings()
      loadSpecialties()
      loadConsultorios()
    }
  }, [connectionStatus, loadDoctors, loadAgendas, loadBuildings, loadSpecialties, loadConsultorios])

  // Cargar pisos de todos los edificios cuando se cargan los edificios
  useEffect(() => {
    if (buildings.length > 0) {
      // Priorizar la carga del edificio 2 (por defecto)
      const edificio2 = buildings.find(b => b.codigo_edificio === 2)
      if (edificio2 && !buildingFloors['2']) {
        console.log('🏢 Cargando pisos para edificio 2 (prioritario):', edificio2.descripcion_edificio)
        loadBuildingFloors(2).then(pisos => {
          setBuildingFloors(prev => ({
            ...prev,
            '2': pisos
          }))
        })
      }
      
      // Cargar pisos para el resto de edificios
      buildings.forEach(async (building) => {
        if (building.codigo_edificio && building.codigo_edificio !== 2 && !buildingFloors[building.codigo_edificio.toString()]) {
          console.log('Cargando pisos para edificio:', building.descripcion_edificio, building.codigo_edificio)
          const pisos = await loadBuildingFloors(building.codigo_edificio)
          setBuildingFloors(prev => ({
            ...prev,
            [building.codigo_edificio!.toString()]: pisos
          }))
        }
      })
    }
  }, [buildings, loadBuildingFloors, buildingFloors])

  // Combinar datos de médicos y agendas
  useEffect(() => {
    if (agendas.length > 0 && consultorios.length > 0) {
      const combinedRecords: CombinedRecord[] = agendas.map((agenda: Agenda) => {
        const doctor = doctors.find((d: Doctor) => d.id === agenda.codigo_prestador)
        const dia = getDayName(agenda.codigo_dia)
        const horaInicio = formatTime(agenda.hora_inicio)
        const horaFin = formatTime(agenda.hora_fin)

        // Buscar la especialidad
        let especialidad = 'Sin especialidad'
        if (agenda.codigo_item_agendamiento) {
          const especialidadEncontrada = specialties.find((esp: Especialidad) => 
            esp.especialidadId === agenda.codigo_item_agendamiento
          )
          if (especialidadEncontrada) {
            especialidad = especialidadEncontrada.descripcion
          } else {
            const especialidadDelMedico = doctor?.especialidades?.find((esp: any) => 
              esp.especialidadId === agenda.codigo_item_agendamiento
            )
            especialidad = especialidadDelMedico?.descripcion || 'Sin especialidad'
          }
        } else if (doctor?.especialidades && doctor.especialidades.length > 0) {
          especialidad = doctor.especialidades[0].descripcion
        }

        // Mapear edificio, piso y descripción de consultorio
        const consultorio = consultorios.find((c: Consultorio) => c.codigo_consultorio === agenda.codigo_consultorio)
        console.log('Mapeando agenda:', {
          agendaId: agenda.codigo_agenda,
          codigo_consultorio: agenda.codigo_consultorio,
          consultorio_encontrado: consultorio
        })
        
        const edificioData = buildings.find((b: Edificio) => b.codigo_edificio === consultorio?.codigo_edificio)
        const edificioNombre = edificioData?.descripcion_edificio || ""
        
        // Obtener la descripción real del piso desde el backend
        let pisoNombre = "Sin consultorio"
        if (consultorio && edificioData) {
          const codigoEdificio = edificioData.codigo_edificio?.toString()
          console.log('Buscando piso para agenda:', {
            agendaId: agenda.codigo_agenda,
            codigoEdificio,
            codigoPiso: consultorio.codigo_piso,
            pisosEnCache: codigoEdificio ? buildingFloors[codigoEdificio]?.length || 0 : 0
          })
          
          if (codigoEdificio && buildingFloors[codigoEdificio]) {
            const pisoData = buildingFloors[codigoEdificio].find(p => p.codigo_piso === consultorio.codigo_piso)
            console.log('Piso encontrado en caché:', pisoData)
            pisoNombre = pisoData ? pisoData.descripcion_piso : `Piso ${consultorio.codigo_piso}`
          } else {
            // Si no está en caché, usar el código como fallback
            console.log('Piso no encontrado en caché, usando fallback')
            pisoNombre = `Piso ${consultorio.codigo_piso}`
          }
        }
        
        const consultorioDescripcion = consultorio?.descripcion_consultorio || consultorio?.DES_CONSULTORIO || ""
        
        console.log('Resultado del mapeo:', {
          agendaId: agenda.codigo_agenda,
          edificioNombre,
          pisoNombre,
          consultorioDescripcion
        })

        return {
          id: `${agenda.codigo_agenda}-${doctor?.id || 0}`,
          doctorId: doctor?.id || 0,
          agendaId: agenda.codigo_agenda,
          nombre: doctor?.nombres || "Doctor no encontrado",
          especialidad,
          tipo: decodeTipo(agenda.tipo || "C"),
          codigoItemAgendamiento: agenda.codigo_item_agendamiento || 0,
          edificio: edificioNombre,
          piso: pisoNombre,
          codigoConsultorio: agenda.codigo_consultorio,
          consultorioDescripcion,
          dia,
          horaInicio,
          horaFin,
          estado: "Activa",
          procedimiento: "",
          isEditing: false,
        }
      })
      
      // Ordenar alfabéticamente por especialidad y luego por médico
      const sortedRecords = combinedRecords.sort((a, b) => {
        // Primero por especialidad
        const especialidadCompare = a.especialidad.localeCompare(b.especialidad)
        if (especialidadCompare !== 0) return especialidadCompare
        
        // Luego por nombre del médico
        return a.nombre.localeCompare(b.nombre)
      })
      setRecords(sortedRecords)
    } else {
      setRecords([])
    }
  }, [doctors, agendas, consultorios, buildings, specialties, buildingFloors])

  // Filtrar registros
  const filteredRecords = useMemo(() => {
    let filtered = records

    // Filtro por especialidad
    if (filters.especialidad && filters.especialidad !== "todas") {
      filtered = filtered.filter(record => record.especialidad === filters.especialidad)
    }

    // Filtro por edificio
    if (filters.edificio && filters.edificio !== "todos") {
      filtered = filtered.filter(record => record.edificio === filters.edificio)
    }

    // Filtro por piso
    if (filters.piso && filters.piso !== "todos") {
      filtered = filtered.filter(record => record.piso === filters.piso)
    }

    // Filtro por tipo
    if (filters.tipo && filters.tipo !== "todos") {
      filtered = filtered.filter(record => record.tipo === filters.tipo)
    }

    // Filtro por búsqueda
    if (filters.search) {
      filtered = filterByText(filtered, filters.search, [
        'nombre', 'especialidad', 'edificio', 'piso', 'dia', 'consultorioDescripcion'
      ])
    }

    // Mantener el orden original de los registros (no ordenar)
    return filtered
  }, [records, filters])

  // Paginación
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * APP_CONFIG.ITEMS_PER_PAGE
    const endIndex = startIndex + APP_CONFIG.ITEMS_PER_PAGE
    return filteredRecords.slice(startIndex, endIndex)
  }, [filteredRecords, currentPage])

  const totalPages = Math.ceil(filteredRecords.length / APP_CONFIG.ITEMS_PER_PAGE)

  // Funciones helper optimizadas con useMemo y useCallback
  const getEspecialidadIdByDescripcion = useCallback((descripcion: string): number | null => {
    if (!descripcion || descripcion === "todas") return null
    const especialidad = specialties.find((esp: Especialidad) => esp.descripcion === descripcion)
    return especialidad?.especialidadId || null
  }, [specialties])

  const getDoctorsBySpecialty = useCallback((especialidadDescripcion: string): Doctor[] => {
    if (!especialidadDescripcion || especialidadDescripcion === "todas") {
      return sortByName(doctors)
    }
    const especialidadId = getEspecialidadIdByDescripcion(especialidadDescripcion)
    if (!especialidadId) return []
    
    return sortByName(doctors.filter((doctor: Doctor) => 
      doctor.especialidades && 
      doctor.especialidades.some((esp: any) => esp.especialidadId === especialidadId)
    ))
  }, [doctors, getEspecialidadIdByDescripcion])

  const getAvailableFloors = useCallback(async (edificio: string): Promise<string[]> => {
    console.log('getAvailableFloors - Parámetros:', { edificio })
    
    if (!edificio) {
      console.log('getAvailableFloors - Retornando array vacío por falta de edificio')
      return []
    }

    const building = buildings.find((e: Edificio) => 
      e.descripcion_edificio === edificio || 
      (e.codigo_edificio && e.codigo_edificio.toString() === edificio)
    )
    
    console.log('getAvailableFloors - Building encontrado:', building)
    
    if (building && building.codigo_edificio) {
      const codigoEdificio = building.codigo_edificio.toString()
      
      // Verificar si ya tenemos los pisos en caché
      if (buildingFloors[codigoEdificio]) {
        console.log('getAvailableFloors - Pisos desde caché:', buildingFloors[codigoEdificio])
        return buildingFloors[codigoEdificio].map((piso: any) => piso.descripcion_piso)
      }
      
      // Cargar pisos desde el backend
      console.log('getAvailableFloors - Cargando pisos desde backend para edificio:', codigoEdificio)
      const pisos = await loadBuildingFloors(building.codigo_edificio)
      
      // Guardar en caché
      setBuildingFloors(prev => ({
        ...prev,
        [codigoEdificio]: pisos
      }))
      
      console.log('getAvailableFloors - Pisos cargados del backend:', pisos)
      return pisos.map((piso: any) => piso.descripcion_piso)
    }
    
    console.log('getAvailableFloors - No se encontró building, retornando array vacío')
    return []
  }, [buildings, buildingFloors, loadBuildingFloors])

  const getDefaultBuildingFloors = useCallback((): string[] => {
    // Retornar solo los pisos del edificio con código 2
    const pisos = buildingFloors['2'] || []
    console.log('🏢 Pisos del edificio 2 (por defecto):', pisos)
    return pisos.map(piso => piso.descripcion_piso)
  }, [buildingFloors])

    // Versión síncrona para usar en el dashboard (usa caché)
  const getAvailableFloorsSync = useCallback((edificio: string): string[] => {
    if (!edificio) return []

    const building = buildings.find((e: Edificio) => 
      e.descripcion_edificio === edificio || 
      (e.codigo_edificio && e.codigo_edificio.toString() === edificio)
    )
    
    if (building && building.codigo_edificio) {
      const codigoEdificio = building.codigo_edificio.toString()
      const pisos = buildingFloors[codigoEdificio] || []
      return pisos.map((piso: any) => piso.descripcion_piso)
    }
    
    return []
  }, [buildings, buildingFloors])

  // Función para cargar pisos cuando se selecciona un edificio
  const loadFloorsForBuilding = useCallback(async (edificio: string): Promise<string[]> => {
    if (!edificio) return []
    
    const building = buildings.find((e: Edificio) => 
      e.descripcion_edificio === edificio || 
      (e.codigo_edificio && e.codigo_edificio.toString() === edificio)
    )
    
    if (building && building.codigo_edificio) {
      const codigoEdificio = building.codigo_edificio.toString()
      
      // Si no está en caché, cargarlo
      if (!buildingFloors[codigoEdificio]) {
        const pisos = await loadBuildingFloors(building.codigo_edificio)
        setBuildingFloors(prev => ({
          ...prev,
          [codigoEdificio]: pisos
        }))
        return pisos.map((piso: any) => piso.descripcion_piso)
      }
      
      return buildingFloors[codigoEdificio].map((piso: any) => piso.descripcion_piso)
    }
    
    return []
  }, [buildings, buildingFloors, loadBuildingFloors])

  // Función para obtener el código del piso por su descripción
  const getPisoCodeByDescription = useCallback((edificio: string, descripcionPiso: string): number | null => {
    if (!edificio || !descripcionPiso) return null
    
    const building = buildings.find((e: Edificio) => 
      e.descripcion_edificio === edificio || 
      (e.codigo_edificio && e.codigo_edificio.toString() === edificio)
    )
    
    if (building && building.codigo_edificio) {
      const codigoEdificio = building.codigo_edificio.toString()
      const pisos = buildingFloors[codigoEdificio] || []
      const piso = pisos.find((p: any) => p.descripcion_piso === descripcionPiso)
      return piso ? piso.codigo_piso : null
    }
    
    return null
  }, [buildings, buildingFloors])

    const obtenerCodigoConsultorio = useCallback((edificio: string, descripcionPiso: string): number => {
    console.log('obtenerCodigoConsultorio - Parámetros:', { edificio, descripcionPiso })
    
    const building = buildings.find((e: Edificio) => e.descripcion_edificio === edificio)
    console.log('obtenerCodigoConsultorio - Building encontrado:', building)
    
    if (!building) {
      console.log('obtenerCodigoConsultorio - No se encontró building, retornando 1')
      return 1
    }
    
    // Obtener el código del piso usando la descripción
    const codigoPiso = getPisoCodeByDescription(edificio, descripcionPiso)
    console.log('obtenerCodigoConsultorio - Código del piso obtenido:', codigoPiso)
    
    if (!codigoPiso) {
      console.log('obtenerCodigoConsultorio - No se encontró código de piso, retornando 1')
      return 1
    }
    
    // Buscar consultorio por código de edificio y código de piso
    const consultorio = consultorios.find((c: Consultorio) => 
      c.codigo_edificio === building.codigo_edificio && c.codigo_piso === codigoPiso
    )
    
    console.log('obtenerCodigoConsultorio - Consultorio encontrado:', consultorio)
    const resultado = consultorio?.codigo_consultorio || 1
    console.log('obtenerCodigoConsultorio - Resultado final:', resultado)
    
    return resultado
  }, [buildings, consultorios, getPisoCodeByDescription])

  // Funciones de manejo de datos optimizadas
  const handleFilterChange = useCallback((key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      especialidad: "",
      edificio: "",
      piso: "",
      tipo: "",
      search: "",
    })
    setCurrentPage(1)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handleFieldChange = (id: string, field: keyof CombinedRecord, value: string | number) => {
    setRecords((prev) =>
      prev.map((record) => {
        if (record.id === id) {
          // Convertir a mayúsculas para campos de texto específicos
          let processedValue = value
          if (typeof value === 'string' && ['especialidad', 'nombre', 'dia', 'piso', 'consultorioDescripcion', 'tipo'].includes(field)) {
            processedValue = value.toUpperCase()
          }
          
          const updated = { ...record, [field]: processedValue }
          if (field === "edificio") {
            // Limpiar piso, consultorio cuando se cambia edificio
            updated.piso = ""
            updated.codigoConsultorio = 0
            updated.consultorioDescripcion = ""
            // Cargar pisos para el edificio seleccionado
            if (processedValue && typeof processedValue === 'string') {
              loadFloorsForBuilding(processedValue)
            }
          } else if (field === "piso") {
            // Limpiar consultorio cuando se cambia piso
            updated.codigoConsultorio = 0
            updated.consultorioDescripcion = ""
          }
          return updated
        }
        return record
      }),
    )
    setHasChanges(true)
  }

  const handleEdit = (id: string) => {
    setEditingId(id)
    setRecords((prev) =>
      prev.map((record) => (record.id === id ? { ...record, isEditing: true } : { ...record, isEditing: false })),
    )
  }

  const handleCancel = (id: string) => {
    const record = records.find(r => r.id === id)
    
    if (record && record.agendaId === 0) {
      // Si es una nueva agenda (agendaId === 0), eliminarla completamente
      setRecords((prev) => prev.filter((r) => r.id !== id))
    } else {
      // Si es una agenda existente, solo cancelar la edición
      setRecords((prev) => prev.map((record) => (record.id === id ? { ...record, isEditing: false } : record)))
    }
    
    setEditingId(null)
  }

  const handleSave = async (id: string) => {
    try {
      const record = records.find(r => r.id === id)
      if (!record) return
      
      // Validaciones
      const codigoItemAgendamiento = Number(record.codigoItemAgendamiento) || 0
      if (!codigoItemAgendamiento) {
        alert('Por favor complete todos los campos requeridos.')
        return
      }

      // Usar el consultorio elegido si existe; de lo contrario, inferir por edificio/piso
      const codigoConsultorioElegido = record.codigoConsultorio || obtenerCodigoConsultorio(record.edificio, record.piso)
      if (!record.doctorId || !codigoConsultorioElegido || !record.horaInicio || !record.horaFin || !record.dia) {
        alert('Por favor complete todos los campos requeridos, incluyendo las horas de inicio y fin.')
        return
      }
      
      if (!isValidTimeFormat(record.horaInicio) || !isValidTimeFormat(record.horaFin)) {
        alert('Por favor ingrese horas válidas en formato HH:MM')
        return
      }

      const horaInicioFormateada = formatTimeForBackend(record.horaInicio)
      const horaFinFormateada = formatTimeForBackend(record.horaFin)
      
      const codigoDia = mapDayToCode(record.dia)
      if (!codigoDia) {
        alert('Por favor seleccione un día válido.')
        return
      }

      const payload: AgendaPayload = {
        codigo_prestador: record.doctorId,
        codigo_consultorio: codigoConsultorioElegido,
        codigo_item_agendamiento: codigoItemAgendamiento,
        codigo_dia: codigoDia,
        hora_inicio: horaInicioFormateada,
        hora_fin: horaFinFormateada,
        tipo: record.tipo === "Consulta" ? "C" : "P"
      }
      
      let saveResult = null

      if (record.agendaId === 0) {
        // Crear nueva agenda
        const createPayload = { ...payload }
        delete createPayload.codigo_agenda
        saveResult = await createAgenda(createPayload as Omit<Agenda, "id">)
      } else {
        // Actualizar agenda existente
        if (payload.codigo_agenda === undefined) {
          payload.codigo_agenda = record.agendaId
        }
        saveResult = await updateAgenda(record.agendaId, payload)
      }
      
      if (saveResult) {
        setRecords(prev => prev.map(r => r.id === id ? { ...r, isEditing: false } : r))
        setHasChanges(false)
      }
    } catch (error) {
      console.error('Error guardando:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const record = records.find(r => r.id === id)
      if (!record || record.agendaId === 0) {
        setRecords((prev) => prev.filter((r) => r.id !== id))
        return
      }

      await deleteAgenda(record.agendaId)
    } catch (error) {
      console.error("Error deleting record:", error)
    }
  }

  const handleDuplicate = (record: CombinedRecord) => {
    const newId = generateUniqueId()

    // Duplicar heredando TODOS los valores y quedando en modo lectura
    const duplicatedRecord: CombinedRecord = {
      ...record,
      id: newId,
      agendaId: 0,
      isEditing: false,
    }

    setRecords((prev) => [duplicatedRecord, ...prev])
    
    setAlertState({
      isOpen: true,
      message: "Agenda duplicada correctamente. El nuevo registro aparece al inicio de la lista.",
      type: "success"
    })
  }

  const handleAddRecord = () => {
    // Verificar si hay filtros activos
    const hasActiveFilters = filters.search || filters.especialidad || filters.edificio || filters.piso || filters.tipo
    
    if (hasActiveFilters) {
      setAlertState({
        isOpen: true,
        message: "Primero debe limpiar filtros para poder agregar",
        type: "warning"
      })
      return
    }
    
    const newId = generateUniqueId()
    
    // Usar valores por defecto más inteligentes
    const defaultBuilding = buildings.find(b => b.codigo_edificio === 2) // Edificio 2 por defecto
    const defaultFloors = getDefaultBuildingFloors()
    
    const newRecord: CombinedRecord = {
      id: newId,
      doctorId: 0,
      agendaId: 0,
      nombre: "",
      especialidad: "",
      tipo: "Consulta",
      codigoItemAgendamiento: 0,
      edificio: defaultBuilding ? (defaultBuilding.descripcion_edificio || "") : "",
      piso: "", // Dejarlo vacío para que el usuario seleccione
      codigoConsultorio: 0,
      consultorioDescripcion: "",
      dia: "", // Usuario debe seleccionar el día
      horaInicio: "",
      horaFin: "",
      estado: "Activa",
      procedimiento: "",
      isEditing: true,
    }
    
    setRecords((prev) => [newRecord, ...prev])
    setEditingId(newId)
  }

  const handleAddRecordFromDoctor = (doctor: Doctor) => {
    // Verificar si hay filtros activos
    const hasActiveFilters = filters.search || filters.especialidad || filters.edificio || filters.piso || filters.tipo
    
    if (hasActiveFilters) {
      setAlertState({
        isOpen: true,
        message: "Primero debe limpiar filtros para poder agregar",
        type: "warning"
      })
      return
    }
    
    const newId = generateUniqueId()
    const firstSpecialty = doctor.especialidades && doctor.especialidades.length > 0 
      ? doctor.especialidades[0] 
      : null
    
    // Usar valores por defecto más inteligentes
    const defaultBuilding = buildings.find(b => b.codigo_edificio === 2) // Edificio 2 por defecto
    
    const newRecord: CombinedRecord = {
      id: newId,
      doctorId: doctor.id,
      agendaId: 0,
      nombre: doctor.nombres,
      especialidad: firstSpecialty?.descripcion || "",
      tipo: "Consulta",
      codigoItemAgendamiento: firstSpecialty?.especialidadId || 0,
      edificio: defaultBuilding ? (defaultBuilding.descripcion_edificio || "") : "",
      piso: "", // Dejarlo vacío para que el usuario seleccione
      codigoConsultorio: 0,
      consultorioDescripcion: "",
      dia: "", // Usuario debe seleccionar el día
      horaInicio: "",
      horaFin: "",
      estado: "Activa",
      procedimiento: "",
      isEditing: true,
    }
    
    setRecords((prev) => [newRecord, ...prev])
    setEditingId(newId)
  }

  // Funciones para popovers optimizadas
  const togglePopover = useCallback((key: string) => {
    setOpenPopovers(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const closePopover = useCallback((key: string) => {
    setOpenPopovers(prev => ({ ...prev, [key]: false }))
  }, [])

  const closeAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, isOpen: false }))
  }, [])

  // Función para guardar con Enter optimizada
  const handleKeyDown = useCallback((event: React.KeyboardEvent, recordId: string) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault()
      handleSave(recordId)
    }
  }, [])

  return {
    // Estados
    records,
    filteredRecords,
    paginatedRecords,
    loading,
    error,
    connectionStatus,
    filters,
    currentPage,
    totalPages,
    editingId,
    hasChanges,
    openPopovers,
    
    // Datos del backend
    doctors,
    specialties,
    buildings,
    consultorios,
    
    // Funciones
    handleFilterChange,
    clearFilters,
    handlePageChange,
    handleFieldChange,
    handleEdit,
    handleCancel,
    handleSave,
    handleDelete,
    handleDuplicate,
    handleAddRecord,
    handleAddRecordFromDoctor,
    handleKeyDown,
    togglePopover,
    closePopover,
    clearError,
    
    // Funciones helper
    getDoctorsBySpecialty,
    getAvailableFloors,
    getAvailableFloorsSync,
    getDefaultBuildingFloors,
    loadFloorsForBuilding,
    getPisoCodeByDescription,
    
    // Alert state
    alertState,
    closeAlert,
  }
}
