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
        const rol = usuario?.rol?.nombre?.trim().toLowerCase();

        if (rol === 'administrador') {
          this.adminService.iniciarSesion(usuario.nombre);
          this.router.navigate(['/admin']);
          return;
        }

        this.adminService.cerrarSesion();
        this.router.navigate([rol === 'medico' ? '/inicio-medico' : '/inicio', usuario.id]);
      },
      error: (error) => {
        console.error('Error de autenticación:', error);
      }
    });
  }
}
