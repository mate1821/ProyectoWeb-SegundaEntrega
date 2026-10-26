import { Component, inject, signal, OnInit } from '@angular/core';
import { ReservaService } from '../../services/reserva.service';
import { MedicoService } from '../../services/medico.service';
import { ReservaComponent } from '../reserva-form/reserva-form.component';
import { Especialidad } from '../../models/especialidad.model';
import { Medico } from '../../models/medico.model';
import { Servicio } from '../../models/servicio.model';
import { Reserva } from '../../models/reserva.model';
import { EspecialidadService } from '../../services/especialidades.service';
import { ServiciosService } from '../../services/servicios.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  imports: [ReservaComponent],
  selector: 'app-reservas',
  styleUrl: './reservas.component.css',
  templateUrl: './reservas.component.html',
})
export class Reservas implements OnInit {
  router = inject(Router)
  reservaService = inject(ReservaService)
  medicoService = inject(MedicoService)
  especialidadService = inject(EspecialidadService)
  servicioService = inject(ServiciosService)

  mensaje = signal('');
  error = signal('');


  especialidades = signal<Especialidad[]>([]);
  medicos = signal<Medico[]>([]);
  servicios = signal<Servicio[]>([]);


  ngOnInit(): void {
    this.especialidadService.obtenerEspecialidades().subscribe({
      next: (data) => this.especialidades.set(data),
      error: (err: unknown) => this.mostrarError(err),
    });

    this.servicioService.obtenerServicios().subscribe({
      next: (data) => this.servicios.set(data),
      error: (err: unknown) => this.mostrarError(err),
    });
  }

  cargarMedicos(especialidadId: number): void {
    this.medicos.set([]);
    this.medicoService.obtenerPorEspecialidad(especialidadId).subscribe({
      next: (data) => this.medicos.set(data),
      error: (err: unknown) => this.mostrarError(err),
    });
  }

    guardarReserva(reserva: Reserva): void {
    this.mensaje.set('');
    this.error.set('');
    this.reservaService.crearReserva(reserva).subscribe({
      next: (creada) => {
        this.mensaje.set(`Reserva #${creada.idReserva} creada. Total: $${creada.total}`);
        console.log("Si se logro la reserva ")
        this.router.navigate(['/inicio']);

      },
      error: (err: unknown) => this.mostrarError(err),
    });
  }

  private mostrarError(err: unknown): void {
    const cuerpo: unknown = err instanceof HttpErrorResponse ? err.error : null;
    if (typeof cuerpo === 'object' && cuerpo !== null && 'error' in cuerpo && typeof cuerpo.error === 'string') {
      this.error.set(cuerpo.error);
    } else {
      this.error.set('No se pudo completar la operación. Verifica que el backend esté encendido.');
    }
  }
}






