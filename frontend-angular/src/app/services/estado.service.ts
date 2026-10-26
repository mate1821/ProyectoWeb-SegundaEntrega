import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EstadoReserva } from '../models/estado.model';

@Service()
export class EstadoService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8090/api/estados';

    obtenerEstados(): Observable<EstadoReserva[]> {
        return this.http.get<EstadoReserva[]>(this.apiUrl);
    }
}