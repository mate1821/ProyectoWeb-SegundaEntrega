export interface CalificacionRequest {
    puntuacion: number;
    comentario: string;
}

export interface EstadoCalificaciones {
    medico: boolean;
    espacio: boolean;
}

export type TipoCalificacion = 'medico' | 'espacio';