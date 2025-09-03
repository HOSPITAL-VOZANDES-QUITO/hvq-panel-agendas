// Tipos para el sistema de agendamiento médico del Hospital Vozandes Quito

export interface Especialidad {
  especialidadId: number
  descripcion: string
  tipo?: string
  icono?: string
}

export interface Doctor {
  id: number
  nombres: string
  retrato?: string
  especialidades: Array<{
    especialidadId: number
    descripcion: string
    tipo: string
  }>
  // Campos legacy para compatibilidad
  nombre?: string
  especialidad?: string
  codigo_item?: string
  estadisticas?: {
    pacientes: number
  }
}

export interface Agenda {
  codigo_agenda: number
  codigo_consultorio: number
  codigo_prestador: number
  codigo_item_agendamiento: number
  codigo_dia: number
  hora_inicio: string
  hora_fin: string
  tipo: string // "C" = Consulta, "P" = Procedimiento
  // Campos legacy para compatibilidad
  id?: number
  edificio?: string
  piso?: string
  dia?: string
  horaInicio?: string
  horaFin?: string
  estado?: "Activa" | "Inactiva" | "Cancelada"
  procedimiento?: string
}

export interface Edificio {
  // Soporte para estructura nueva del backend
  codigo_edificio?: number
  descripcion_edificio?: string
  // Soporte legacy para compatibilidad
  codigo?: string
  nombre?: string
  descripcion?: string
  pisos?: string[]
}

// Especialidades disponibles en el sistema
export const especialidades = [
  "Cardiología",
  "Pediatría",
  "Neurología",
  "Ginecología",
  "Traumatología",
  "Dermatología",
  "Oftalmología",
  "Otorrinolaringología",
]