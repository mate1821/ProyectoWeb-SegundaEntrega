import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reserva } from '../models/reserva.model';

@Injectable({ providedIn: 'root' })

/**
 * Consume los 4 requestMapping de ReservaRestController (backend, puerto 8090):
 *   GET    /api/reservas        -> obtenerReservas()
 *   POST   /api/reservas        -> crearReserva()
 *   PUT    /api/reservas/{id}   -> actualizarReserva()
 *   DELETE /api/reservas/{id}   -> cancelarReserva()
 */

export class ReservaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8090/api/reservas';

  obtenerReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.apiUrl, { withCredentials: true });
  }

  actualizarReserva(id: number, reserva: Reserva): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.apiUrl}/${id}`, reserva, { withCredentials: true });
  }

  // El backend no borra la reserva: la deja en estado "Cancelada"
  cancelarReserva(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  cambiarEstado(idReserva: number, idEstado: number): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.apiUrl}/${idReserva}/estado`, { id: idEstado }, { withCredentials: true });
  }

  obtenerMisReservas(usuarioId: number): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/usuario/${usuarioId}`, { withCredentials: true });
  }

  crearReserva(pacienteId: number, reserva: Reserva): Observable<Reserva> {
    return this.http.post<Reserva>(`${this.apiUrl}/usuario/${pacienteId}`, reserva, { withCredentials: true });
  }

  obtenerReservasMedico(medicoId: number): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/medico/${medicoId}`, { withCredentials: true });
  }
  
  obtenerReserva(id: number): Observable<Reserva> {
    return this.http.get<Reserva>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }




}
