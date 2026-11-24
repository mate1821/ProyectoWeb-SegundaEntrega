
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Reserva } from '../models/reserva.model';

@Injectable({ providedIn: 'root' })
export class PagoService {
  private api = 'https://proyectoweb-segundaentrega.onrender.com/api/pagos';

  constructor(private http: HttpClient) {}

  /** Solicita al backend la creación de la orden y obtiene el enlace de Wompi. */
  pagar(pacienteId: number, reserva: Reserva) {
    return this.http.post<{ url: string; referencia: string }>(
      `${this.api}/checkout/${pacienteId}`,
      reserva,
      { withCredentials: true }
    );
  }

  /** Consulta el estado de una orden en el backend. */
  estado(referencia: string) {
    return this.http.get<{ referencia: string; estado: string }>(
      `${this.api}/orden/${referencia}`,
      { withCredentials: true }
    );
  }
}
