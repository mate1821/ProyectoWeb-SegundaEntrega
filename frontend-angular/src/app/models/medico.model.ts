import { Especialidad } from './especialidad.model';
import { Espacio } from './espacio.model';

// Dentro de cada reserva el médico llega completo (con especialidad y espacio).
// En GET /api/especialidades/{id}/medicos solo llegan id y nombre, por eso lo demás es opcional.
export interface Medico {
    id: number;
    nombre: string;
    especialidad?: Especialidad;
    espacio?: Espacio;
}