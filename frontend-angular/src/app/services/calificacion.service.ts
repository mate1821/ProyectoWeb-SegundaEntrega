import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CalificacionRequest, EstadoCalificaciones, ListadoResenas, TipoCalificacion } from '../models/calificacion.model';

/**
 * Consume CalificacionRestController (backend, puerto 8090):
 *   GET  /api/reservas/{id}/calificaciones        -> obtenerEstado()
 *   POST /api/reservas/{id}/calificacion-medico   -> calificar('medico', ...)
 *   POST /api/reservas/{id}/calificacion-espacio  -> calificar('espacio', ...)
 */
@Injectable({ providedIn: 'root' })
export class CalificacionService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8090/api/reservas';

    obtenerResenas(tipo: TipoCalificacion, id: number): Observable<ListadoResenas> {
        return this.http.get<ListadoResenas>(`http://localhost:8090/api/resenas/${tipo}/${id}`,
            { withCredentials: true });
    }

    obtenerEstado(reservaId: number): Observable<EstadoCalificaciones> {
        return this.http.get<EstadoCalificaciones>(`${this.apiUrl}/${reservaId}/calificaciones`,
            { withCredentials: true });
    }

    calificar(reservaId: number, tipo: TipoCalificacion, datos: CalificacionRequest): Observable<unknown> {
        return this.http.post(`${this.apiUrl}/${reservaId}/calificacion-${tipo}`, datos,
            { withCredentials: true });
    }
}
