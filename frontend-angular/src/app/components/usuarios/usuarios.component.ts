import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-usuarios',
  styleUrl: './usuarios.component.css',
  templateUrl: './usuarios.component.html',
})
export class Usuarios {
  usuarios = [
    {
      id: 1,
      nombre: 'Carlos Andrés Mendoza',
      correo: 'carlos.mendoza@email.com',
      rol: { nombre: 'PACIENTE' },
      telefono: '3101234567',
      activo: true
    },
    {
      id: 2,
      nombre: 'Dra. María Paula Gómez',
      correo: 'maria.gomez@healthpoint.com',
      rol: { nombre: 'MEDICO' },
      telefono: '3159876543',
      activo: true
    },
    {
      id: 3,
      nombre: 'Juan José Rodríguez',
      correo: 'juan.rodriguez@email.com',
      rol: { nombre: 'PACIENTE' },
      telefono: '3001112233',
      activo: false
    }
  ];
}
