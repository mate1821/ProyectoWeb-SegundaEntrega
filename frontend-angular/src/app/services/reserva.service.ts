import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reserva } from '../models/reserva.model';

/**
 * Consume los 4 requestMapping de ReservaRestController (backend, puerto 8090):
 *   GET    /api/reservas        -> obtenerReservas()
 *   POST   /api/reservas        -> crearReserva()
 *   PUT    /api/reservas/{id}   -> actualizarReserva()
 *   DELETE /api/reservas/{id}   -> cancelarReserva()
 */
@Service()
export class ReservaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8090/api/reservas';

  obtenerReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.apiUrl);
  }

  crearReserva(reserva: Reserva): Observable<Reserva> {
    return this.http.post<Reserva>(this.apiUrl, reserva);
  }

  actualizarReserva(id: number, reserva: Reserva): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.apiUrl}/${id}`, reserva);
  }

  // El backend no borra la reserva: la deja en estado "Cancelada"
  cancelarReserva(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
