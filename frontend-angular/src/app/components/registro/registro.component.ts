import { Component, inject, signal } from '@angular/core';
import { UsuarioForm } from '../usuario-form/usuario-form.component';
import { Usuario } from '../../models/usuario.model';
import { UsuarioService } from '../../services/usuario.service';
import { Router } from '@angular/router';
import { mensajeError } from '../../utils/mensaje-error';

@Component({
  imports: [UsuarioForm],
  selector: 'app-registro',
  styleUrl: './registro.component.css',
  templateUrl: './registro.component.html',
})
export class Registro {
  usuarioService = inject(UsuarioService);
  private router = inject(Router);

  error = signal('');

  // Antes se llamaba GET /api/usuarios al abrir la pantalla, pero ese endpoint es
  // solo para ADMIN y quien se registra aún no tiene sesión: el backend respondía
  // "forbidden". No se necesitaba la lista para registrar, así que se quitó (issue #19).

  guardarUsuario(usuario: Usuario) {
    this.error.set('');
    this.usuarioService.agregarUsuario(usuario).subscribe({
      next: () => this.router.navigate(['/inicio-sesion'], { queryParams: { registro: 'ok' } }),
      // Ej.: 409 "Ya existe un usuario con ese correo" (UsuarioDuplicado en el backend)
      error: (err: unknown) => this.error.set(mensajeError(err, 'No se pudo completar el registro.')),
    });
  }
}
