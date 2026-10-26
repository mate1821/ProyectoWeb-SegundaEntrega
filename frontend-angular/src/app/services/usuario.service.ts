import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario.model'; 
import { Credenciales } from '../models/credencial.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'http://localhost:8090/api/usuarios';

  constructor(private http: HttpClient) {}

  obtenerUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  agregarUsuario(usuario: Usuario): Observable<Usuario> {
  return this.http.post<Usuario>(this.apiUrl, usuario);
}

  activar(id: number): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/activar/${id}`, {});
  }

  desactivar(id: number): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/desactivar/${id}`, {});
  }

  // DELETE /api/usuarios/{id}
  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  login(credenciales: Credenciales): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/login`, credenciales, { withCredentials: true });
  }
}