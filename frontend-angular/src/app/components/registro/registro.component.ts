import { Component, inject  } from '@angular/core';
import { UsuarioForm } from '../usuario-form/usuario-form.component';
import { Usuario } from '../../models/usuario.model';
import { UsuarioService } from '../../services/usuario.service';
import { Router } from '@angular/router';

@Component({
  imports: [UsuarioForm],
  selector: 'app-registro',
  styleUrl: './registro.component.css',
  templateUrl: './registro.component.html',
})
export class Registro {
  usuarioService=inject(UsuarioService);
  private router = inject(Router);

  usuarios: Usuario[] = [];

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (data) => {this.usuarios = data;},
      error: (err) => console.error('Error al cargar usuarios:', err)
    });
  }
  
  guardarUsuario(usuario: Usuario) {
  console.log('--- EVENTO RECIBIDO EN EL PADRE ---');
  this.usuarioService.agregarUsuario(usuario).subscribe({
    next: () => {
      this.cargarUsuarios();
      this.router.navigate(['/inicio-sesion']);
    },
    error: (err) => console.error('Error al guardar:', err)
  });
}
}
