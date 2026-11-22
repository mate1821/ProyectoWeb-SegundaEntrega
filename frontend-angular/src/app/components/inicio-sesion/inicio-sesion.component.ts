import { Component, inject, OnInit, signal } from '@angular/core';
import { LoginForm } from '../login-form/login-form.component';
import { Credenciales } from '../../models/credencial.model';
import { UsuarioService } from '../../services/usuario.service';
import { ActivatedRoute, Router } from '@angular/router';
import { mensajeError } from '../../utils/mensaje-error';
import { AdminService } from '../../services/admin.service';
import { TemaService } from '../../services/tema.service';

@Component({
  imports: [LoginForm],
  selector: 'app-inicio-sesion',
  styleUrl: './inicio-sesion.component.css',
  templateUrl: './inicio-sesion.component.html',
})
export class InicioSesion implements OnInit {
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);
  private adminService = inject(AdminService);
  private temaService = inject(TemaService);
  private route = inject(ActivatedRoute);

  error = signal('');
  aviso = signal('');

  // El interceptor manda ?sesion=expirada cuando el backend responde 401,
  // y el registro manda ?registro=ok cuando la cuenta se creó bien
  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    if (params.get('sesion') === 'expirada') {
      this.aviso.set('Tu sesión no está activa o expiró. Inicia sesión de nuevo.');
    } else if (params.get('registro') === 'ok') {
      this.aviso.set('Registro exitoso. Ya puedes iniciar sesión.');
    }
  }

  procesarLogin(credenciales: Credenciales) {
    this.error.set('');
    this.aviso.set('');
    if (!credenciales.correo?.trim() || !credenciales.contrasena) {
      this.error.set('Debes ingresar el correo y la contraseña.');
      return;
    }

    this.usuarioService.login(credenciales).subscribe({
      next: (usuario) => {
        const rol = usuario?.rol?.nombre?.trim().toLowerCase();
        this.temaService.aplicar(rol);

        if (rol === 'administrador') {
          this.adminService.iniciarSesion(usuario.nombre);
          this.router.navigate(['/admin']);
          return;
        }

        this.adminService.cerrarSesion();
        this.router.navigate([rol === 'medico' ? '/inicio-medico' : '/inicio', usuario.id]);
      },
      // 401: credenciales incorrectas, 403: cuenta desactivada, 0: backend apagado
      error: (err: unknown) => this.error.set(mensajeError(err, 'No se pudo iniciar sesión.'))
    });
  }
}
