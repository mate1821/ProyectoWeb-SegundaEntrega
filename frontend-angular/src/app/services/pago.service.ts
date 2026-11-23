import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
 // desde src/app/pagos/ hasta src/environments/

@Injectable({ providedIn: 'root' })
export class PagoService {
  private api = 'https://proyectoweb-segundaentrega.onrender.com/api/pagos';

  constructor(private http: HttpClient) {}

  /** Pide al backend el link de Wompi y lleva al usuario a pagar. */
  pagar(montoEnPesos: number) {
    this.http.post<{ url: string; referencia: string }>(`${this.api}/checkout`, { monto: montoEnPesos }, { withCredentials: true })
      .subscribe(r => {
        sessionStorage.setItem('ultimaReferencia', r.referencia);
        window.location.href = r.url;
      });
  }

  /** Consulta el estado de la orden en el backend. */
  estado(referencia: string) {
    return this.http.get<{ referencia: string; estado: string }>(`${this.api}/orden/${referencia}`, { withCredentials: true });
  }
}
