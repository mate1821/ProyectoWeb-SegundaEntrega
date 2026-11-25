export interface CalificacionRequest {
    puntuacion: number;
    comentario: string;
}

export interface EstadoCalificaciones {
    medico: boolean;
    espacio: boolean;
}

export type TipoCalificacion = 'medico' | 'espacio';

export interface ListadoResenas {
    nombre: string;
    resenas: Resena[];
}

export interface Resena {
    puntuacion: number;
    comentario: string | null;
    fecha: string;
}
