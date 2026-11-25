import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Espacio } from '../models/espacio.model';
import { FotoEspacio } from '../models/espacio.model';

@Injectable({ providedIn: 'root' })
export class EspacioService {
  private http = inject(HttpClient);
  private apiUrl = 'https://proyectoweb-segundaentrega.onrender.com/api/espacios';

  obtenerEspacios(): Observable<Espacio[]> {
    return this.http.get<Espacio[]>(this.apiUrl,
        { withCredentials: true });
  }
  obtenerFoto(id: number): Observable<FotoEspacio> {
    return this.http.get<FotoEspacio>(`${this.apiUrl}/${id}/foto`, { withCredentials: true });
  }
}
