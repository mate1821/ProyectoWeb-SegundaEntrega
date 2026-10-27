import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Espacio } from '../models/espacio.model';

@Injectable({ providedIn: 'root' })
export class EspacioService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8090/api/espacios';

  obtenerEspacios(): Observable<Espacio[]> {
    return this.http.get<Espacio[]>(this.apiUrl);
  }
}