import { Component, inject } from '@angular/core';
import { LoginForm } from '../login-form/login-form.component';
import { Credenciales } from '../../models/credencial.model';
import { UsuarioService } from '../../services/usuario.service';
import { Router } from '@angular/router';

@Component({
  imports: [LoginForm],
  selector: 'app-inicio-sesion',
  styleUrl: './inicio-sesion.component.css',
  templateUrl: './inicio-sesion.component.html',
})
export class InicioSesion {
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  procesarLogin(credenciales: Credenciales) {
    console.log('Enviando credenciales al backend:', credenciales);

    this.usuarioService.login(credenciales).subscribe({
      next: (usuario) => {
        console.log('¡Inicio de sesión exitoso!', usuario);
        this.router.navigate(['/inicio'], {
        state: {nombre: usuario.nombre}
        });
      },
      error: (error) => {
        console.error('Error de autenticación:', error);
      }
    });
  }
}
