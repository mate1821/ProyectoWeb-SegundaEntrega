// Referencia mínima a otra entidad: al crear/editar una reserva solo hace falta enviar el id.
export interface Referencia {
  id: number;
  nombre?: string;
}

export interface ServicioReserva extends Referencia {
  costo?: number;
}

export interface Reserva {
  idReserva?: number;
  usuario?: Referencia;          // paciente
  medico?: Referencia;
  fecha: string;                 // "2026-11-05"
  horaInicio: string;            // "09:00"
  horaFin?: string;              // la calcula el backend (horaInicio + 1 hora)
  estado?: Referencia;           // el backend la crea "Confirmada"
  fechaSolicitud?: string;
  observaciones?: string;
  total?: number;                // lo calcula el backend (especialidad + servicios)
  servicios?: ServicioReserva[];
}
