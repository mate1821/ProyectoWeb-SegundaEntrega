import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medico } from '../models/medico.model';
import { MedicoDirectorio } from '../models/medico-directorio.model';

@Injectable({ providedIn: 'root' })
export class MedicoService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8090/api/medicos';

    obtenerPorEspecialidad(especialidadId: number): Observable<Medico[]> {
        return this.http.get<Medico[]>(this.apiUrl, { params: { especialidadId }, withCredentials: true  });
    }

    // Médicos con especialidad y espacio, para la búsqueda (issue #24)
    obtenerDirectorio(): Observable<MedicoDirectorio[]> {
        return this.http.get<MedicoDirectorio[]>(`${this.apiUrl}/directorio`, { withCredentials: true });
    }
}