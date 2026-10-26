import { Usuario } from "./usuario.model";

// Referencia mínima a otra entidad: al crear/editar una reserva solo hace falta enviar el id.
export interface Referencia {
  id: number;
  nombre?: string;
}

export interface ServicioReserva extends Referencia {
  costo?: number;
}

export interface MedicoReserva extends Referencia {
  espacio?: { id: number; nombre: string };
  especialidad?: { id: number; nombreEspecialidad: string };
}

export interface Reserva {
  idReserva?: number;
  usuario?: Usuario;          
  medico?: MedicoReserva;
  fecha: string;                
  horaInicio: string;            
  horaFin?: string;             
  estado?: Referencia;           
  fechaSolicitud?: string;
  observaciones?: string;
  total?: number;                
  servicios?: ServicioReserva[];
}
