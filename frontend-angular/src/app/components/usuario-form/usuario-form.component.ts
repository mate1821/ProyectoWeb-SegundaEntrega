import { Component, inject, output } from '@angular/core';
import { Usuario } from '../../models/usuario.model';
import {FormsModule,ReactiveFormsModule,FormGroup,FormControl,Validators} from '@angular/forms';
import { Espacio } from '../../models/espacio.model';
import { Especialidad } from '../../models/especialidad.model';
import { ActivatedRoute, Router } from '@angular/router';
import { EspacioService } from '../../services/espacio.service';
import { EspecialidadService } from '../../services/especialidades.service';

@Component({
  imports: [FormsModule, ReactiveFormsModule],
  selector: 'app-usuario-form',
  styleUrl: './usuario-form.component.css',
  templateUrl: './usuario-form.component.html',
})
export class UsuarioForm {

  router = inject(Router)
  route = inject(ActivatedRoute)
  espacioService = inject(EspacioService)
  especialidadService = inject(EspecialidadService)


  listaEspecialidades: Especialidad[] = [];
  listaEspacios: Espacio[] = [];


   ngOnInit(): void {
    this.especialidadService.obtenerEspecialidades().subscribe({
      next: (d) => this.listaEspecialidades = d,
      error: (e) => console.error('Error al cargar especialidades', e)
    });
    this.espacioService.obtenerEspacios().subscribe({
      next: (d) => this.listaEspacios = d,
      error: (e) => console.error('Error al cargar espacios', e)
    });
  }
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
  }),

  especialidadId: new FormControl<number | null>(null),
  
  espacioId: new FormControl<number | null>(null)

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

    if (Number(datos.rolId) === 1) {
      nuevoUsuario.especialidadId = datos.especialidadId ? Number(datos.especialidadId) : null;
      nuevoUsuario.espacioId = datos.espacioId ? Number(datos.espacioId) : null;
    }
    this.usuarioGuardado.emit(nuevoUsuario);
  }
}

