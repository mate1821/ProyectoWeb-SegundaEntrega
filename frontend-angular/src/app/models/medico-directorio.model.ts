// Igual al record MedicoDirectorio de MedicoRestController (GET /api/medicos/directorio)
export interface MedicoDirectorio {
  id: number;
  nombre: string;
  especialidadId: number | null;
  especialidad: string | null;
  espacioId: number | null;
  espacio: string | null;      // nombre de la clínica / consultorio
  ubicacion: string | null;
}
