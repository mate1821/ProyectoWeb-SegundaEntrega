import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, map, of, startWith, switchMap } from 'rxjs';

import { ListadoResenas } from '../../models/calificacion.model';
import { CalificacionService } from '../../services/calificacion.service';
import { mensajeError } from '../../utils/mensaje-error';

type Estado =
  | { tipo: 'cargando' }
  | { tipo: 'error'; mensaje: string }
  | { tipo: 'listado'; titulo: string; listado: ListadoResenas };

const cargando: Estado = { tipo: 'cargando' };

@Component({
  selector: 'app-resenas',
  imports: [DatePipe, RouterLink],
  templateUrl: './resenas.component.html',
  styleUrl: './resenas.component.css',
})
export class Resenas {
  private readonly ruta = inject(ActivatedRoute);
  private readonly calificaciones = inject(CalificacionService);

  readonly usuarioId = toSignal(this.ruta.paramMap.pipe(map(params => params.get('id'))));

  readonly estado = toSignal(this.ruta.paramMap.pipe(
    switchMap(params => {
      const tipo = params.get('tipo');
      const id = Number(params.get('destinoId'));

      if ((tipo !== 'medico' && tipo !== 'espacio') || !Number.isSafeInteger(id) || id < 1) {
        return of<Estado>({ tipo: 'error', mensaje: 'La reseña solicitada no es válida.' });
      }

      const titulo = tipo === 'medico' ? 'Reseñas del médico' : 'Reseñas de la clínica';
      return this.calificaciones.obtenerResenas(tipo, id).pipe(
        map((listado): Estado => ({ tipo: 'listado', titulo, listado })),
        startWith(cargando),
        catchError((error: unknown) => of<Estado>({
          tipo: 'error',
          mensaje: mensajeError(error, 'No se pudieron cargar las reseñas.'),
        })),
      );
    }),
  ), { initialValue: cargando });
}
