import { Pipe, PipeTransform } from '@angular/core';
import { MedicoDirectorio } from '../models/medico-directorio.model';
import { normalizar } from './normalizar';

/**
 * Pipe del issue #24: filtra por lo que el usuario escribe en la barra de búsqueda.
 * Busca el texto en el nombre del médico y en el nombre del espacio (clínica).
 * No distingue mayúsculas ni tildes, y cada palabra debe aparecer en alguno de
 * los dos campos: "shaio laura" encuentra a Laura Gómez de la Clínica Shaio.
 *
 * Uso: medicos | filtroBusqueda: texto
 */
@Pipe({ name: 'filtroBusqueda' })
export class FiltroBusquedaPipe implements PipeTransform {
  transform(medicos: MedicoDirectorio[] | null, texto: string | null): MedicoDirectorio[] {
    if (!medicos) {
      return [];
    }
    const palabras = normalizar(texto).split(' ').filter((p) => p.length > 0);
    if (palabras.length === 0) {
      return medicos;
    }
    return medicos.filter((m) => {
      const contenido = normalizar(`${m.nombre} ${m.espacio ?? ''}`);
      return palabras.every((p) => contenido.includes(p));
    });
  }
}
