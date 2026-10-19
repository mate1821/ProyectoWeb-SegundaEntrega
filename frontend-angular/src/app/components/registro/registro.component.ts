import { Component, inject  } from '@angular/core';
import { UsuarioForm } from '../usuario-form/usuario-form.component';
import { Usuario } from '../../models/usuario.model';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  imports: [UsuarioForm],
  selector: 'app-registro',
  styleUrl: './registro.component.css',
  templateUrl: './registro.component.html',
})
export class Registro {
  usuarioService=inject(UsuarioService);
  usuarios: Usuario[] = this.usuarioService.obtenerUsuarios();
  guardarUsuario(usuario: Usuario){
     console.log('--- EVENTO RECIBIDO EN EL PADRE ---');
     console.log('Datos del usuario capturados:', usuario);

     this.usuarioService.agregarUsuario(usuario);

     this.usuarios = [...this.usuarioService.obtenerUsuarios()];

  }
}
