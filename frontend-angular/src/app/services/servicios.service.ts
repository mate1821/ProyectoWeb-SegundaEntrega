
import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Servicio} from '../models/servicio.model';




@Service()
export class ServiciosService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8090/api/servicios';

    obtenerServicios(): Observable<Servicio[]> {
        return this.http.get<Servicio[]>(this.apiUrl);
    }
}