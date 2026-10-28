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
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  imports: [ReservaComponent],
  selector: 'app-reservas',
  styleUrl: './reservas.component.css',
  templateUrl: './reservas.component.html',
})
export class Reservas implements OnInit {
  router = inject(Router)
  route = inject(ActivatedRoute)
  reservaService = inject(ReservaService)
  medicoService = inject(MedicoService)
  especialidadService = inject(EspecialidadService)
  servicioService = inject(ServiciosService)

  mensaje = signal('');
  error = signal('');
  reservaEditando = signal<Reserva | null>(null); // la reserva que se edita (ruta /reservas/editar/:id)

  private idRuta = Number(this.route.snapshot.paramMap.get('id'));
  private modoEditar = this.route.snapshot.data['editar'] === true;

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

    // En /reservas/editar/:id se busca la reserva para llenar el formulario
    if (this.modoEditar) {
      this.cargarReservaAEditar(this.idRuta);
    }
  }


   private cargarReservaAEditar(id: number): void {
    this.reservaService.obtenerReserva(id).subscribe({
      next: (reserva) => {
        this.reservaEditando.set(reserva);
        const especialidadId = reserva.medico?.especialidad?.id;
        if (especialidadId !== undefined) {
          this.cargarMedicos(especialidadId);
        }
      },
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

    const idEditando = this.reservaEditando()?.idReserva;
    if (idEditando !== undefined) {
      this.reservaService.actualizarReserva(idEditando, reserva).subscribe({
        next: () => this.router.navigate(['/mostrar-reservas', this.reservaEditando()?.usuario?.id]),
        error: (err: unknown) => this.mostrarError(err),
      });
      return;
    }

    this.reservaService.crearReserva(this.idRuta, reserva).subscribe({
      next: () => this.router.navigate(['/inicio', this.idRuta]),
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






