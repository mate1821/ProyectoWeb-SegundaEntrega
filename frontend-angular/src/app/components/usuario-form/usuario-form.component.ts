import { Component, output } from '@angular/core';
import { Usuario } from '../../models/usuario.model';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [FormsModule],
  selector: 'app-usuario-form',
  styleUrl: './usuario-form.component.css',
  templateUrl: './usuario-form.component.html',
})
export class UsuarioForm {
  
  id: number | null=null;
  cedula: number | null=null;
  nombre: string = '';
  fecha_nacimiento: string = '';
  telefono: string = '';
  correo: string = '';
  contrasena: string = '';
  activo: boolean = true;
  rolId: number = 2;
  antecedentes: string = '';
  especialidadId: number | string = '';
  espacioId: number | string = '';

  usuarioGuardado = output<Usuario>()

  guardar() {
    const nuevoUsuario: Usuario = {
      cedula: Number(this.cedula),
      nombre: this.nombre,
      fecha_nacimiento: this.fecha_nacimiento,
      telefono: this.telefono,
      correo: this.correo,
      contrasena: this.contrasena,
      activo: this.activo,
      rol: { id: Number(this.rolId) },
      antecedentes: this.rolId == 2 ? this.antecedentes : ''
    };

    /* ESTO ESTÁ TEMPORALMENTE COMENTADO PORQUE NO HEMOS TRAIDO LA CLASE MEDICO
    if (this.rolId == 1) {
      console.log('Especialidad seleccionada:', this.especialidadId);
      console.log('Espacio seleccionado:', this.espacioId);
    }
    */
    this.usuarioGuardado.emit(nuevoUsuario);
  }
}

