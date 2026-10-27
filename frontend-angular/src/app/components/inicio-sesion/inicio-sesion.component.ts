import { Component, inject } from '@angular/core';
import { LoginForm } from '../login-form/login-form.component';
import { Credenciales } from '../../models/credencial.model';
import { UsuarioService } from '../../services/usuario.service';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';

@Component({
  imports: [LoginForm],
  selector: 'app-inicio-sesion',
  styleUrl: './inicio-sesion.component.css',
  templateUrl: './inicio-sesion.component.html',
})
export class InicioSesion {
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);
  private adminService = inject(AdminService);

  procesarLogin(credenciales: Credenciales) {
    console.log('Enviando credenciales al backend:', credenciales);

    this.usuarioService.login(credenciales).subscribe({
      next: (usuario) => {
      console.log('¡Inicio de sesión exitoso!', usuario);

      const esAdmin =
        usuario?.rol?.nombre?.trim().toLowerCase() === 'administrador';

      if (esAdmin) {
        this.adminService.iniciarSesion(usuario.nombre);
      } else {
        this.adminService.cerrarSesion();
      }
      this.router.navigate([esAdmin ? '/admin' : '/inicio'],{
        state: { nombre: usuario.nombre }
      });
      },
      error: (error) => {
        console.error('Error de autenticación:', error);
      }
    });
  }
}
