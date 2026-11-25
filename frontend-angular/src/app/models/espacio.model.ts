// Igual a la entidad Espacio.java (llega dentro del médico de cada reserva)
export interface Espacio {
    id: number;
    nombre: string;
    ubicacion?: string;
}

export interface FotoEspacio {
    url: string;
}