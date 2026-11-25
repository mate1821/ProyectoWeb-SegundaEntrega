import { Pipe, PipeTransform } from '@angular/core';
import { MedicoDirectorio } from '../models/medico-directorio.model';

/**
 * Pipe del issue #24: deja solo los médicos de la especialidad elegida en el desplegable.
 * Si no hay especialidad elegida (null o ''), devuelve la lista completa.
 *
 * Uso: medicos | filtroEspecialidad: especialidadId
 *
 * Es un pipe puro: Angular solo lo vuelve a ejecutar cuando cambia la lista
 * o la especialidad, no en cada ciclo de detección de cambios.
 */
@Pipe({ name: 'filtroEspecialidad' })
export class FiltroEspecialidadPipe implements PipeTransform {
  transform(medicos: MedicoDirectorio[] | null, especialidadId: number | string | null): MedicoDirectorio[] {
    if (!medicos) {
      return [];
    }
    if (especialidadId === null || especialidadId === '') {
      return medicos;
    }
    const id = Number(especialidadId);
    return medicos.filter((m) => m.especialidadId === id);
  }
}
