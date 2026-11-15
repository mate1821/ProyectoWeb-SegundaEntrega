import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario.model';
import { Credenciales } from '../models/credencial.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'http://localhost:8090/api/usuarios';

  constructor(private http: HttpClient) { }

  obtenerUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl,
        { withCredentials: true });
  }

  buscarPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`, {withCredentials: true} );
  }

  agregarUsuario(usuario: Usuario): Observable<void> {
    const { especialidadId, espacioId, ...datos } = usuario;
    let params = new HttpParams(); //Se usa para mandar los parámetros especiales de médico, fuente: https://angular.dev/api/common/http/HttpParams
    if (especialidadId != null) params = params.set('especialidadId', especialidadId);
    if (espacioId != null) params = params.set('espacioId', espacioId);
    return this.http.post<void>(this.apiUrl, datos, { params, withCredentials: true  });
  }

  activar(id: number): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/activar/${id}`, {withCredentials: true });
  }

  desactivar(id: number): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/desactivar/${id}`, {withCredentials: true });
  }

  // DELETE /api/usuarios/{id}
  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`,{withCredentials: true });
  }

  login(credenciales: Credenciales): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credenciales, { withCredentials: true });
  }
}