import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Especialidad } from '../models/especialidad.model';

@Injectable({ providedIn: 'root' })
export class EspecialidadService {
  private http = inject(HttpClient);
  private apiUrl = 'https://proyectoweb-segundaentrega.onrender.com/api/especialidades';

  obtenerEspecialidades(): Observable<Especialidad[]> {
    return this.http.get<Especialidad[]>(this.apiUrl,
        { withCredentials: true });
  }
}