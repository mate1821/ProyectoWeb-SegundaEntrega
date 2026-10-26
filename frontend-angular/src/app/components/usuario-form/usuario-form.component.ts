import { Component, output } from '@angular/core';
import { Usuario } from '../../models/usuario.model';
import {FormsModule,ReactiveFormsModule,FormGroup,FormControl,Validators} from '@angular/forms';

@Component({
  imports: [FormsModule, ReactiveFormsModule],
  selector: 'app-usuario-form',
  styleUrl: './usuario-form.component.css',
  templateUrl: './usuario-form.component.html',
})
export class UsuarioForm {
formularioUsuario = new FormGroup({

  cedula: new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.pattern(/^[0-9]{6,10}$/)
    ]
  }),

  nombre: new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(100)
    ]
  }),

  fecha_nacimiento: new FormControl('', {
    nonNullable: true,
    validators: [Validators.required]
  }),

  telefono: new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.pattern(/^[0-9]{10}$/)
    ]
  }),

  correo: new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.email,
      Validators.maxLength(120)
    ]
  }),

  contrasena: new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(120)
    ]
  }),

  rolId: new FormControl(2, {
    nonNullable: true,
    validators: [Validators.required]
  }),

  antecedentes: new FormControl('', {
    nonNullable: true
  })

});


  usuarioGuardado = output<Usuario>()

  guardar() {

  this.formularioUsuario.markAllAsTouched();
  if (this.formularioUsuario.invalid) {
    return;
  }
  const datos = this.formularioUsuario.getRawValue();
  const nuevoUsuario: Usuario = {
      cedula: Number(datos.cedula),
      nombre: datos.nombre,
      fecha_nacimiento: datos.fecha_nacimiento,
      telefono: datos.telefono,
      correo: datos.correo,
      contrasena: datos.contrasena,
      activo: true,
      rol: { id: datos.rolId },
      antecedentes: datos.rolId === 2 ? datos.antecedentes : ''
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

