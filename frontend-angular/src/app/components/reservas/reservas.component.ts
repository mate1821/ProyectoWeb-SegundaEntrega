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
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.cargarReservaAEditar(id);
    }
  }

  private cargarReservaAEditar(id: number): void {
    this.reservaService.obtenerMisReservas().subscribe({
      next: (reservas) => {
        const reserva = reservas.find((r) => r.idReserva === id);
        if (!reserva) {
          this.router.navigate(['/mostrar-reservas']); // no existe o no es del usuario
          return;
        }
        this.reservaEditando.set(reserva);
        const especialidadId = reserva.medico?.especialidad?.id;
        if (especialidadId !== undefined) {
          this.cargarMedicos(especialidadId); // para que el médico actual aparezca en la lista
        }
      },
      error: () => this.router.navigate(['/mostrar-reservas']), // ahí se muestra el error (ej. sin sesión)
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

    // Si se está editando se actualiza la reserva (PUT); si no, se crea una nueva (POST)
    const idEditando = this.reservaEditando()?.idReserva;
    if (idEditando !== undefined) {
      this.reservaService.actualizarReserva(idEditando, reserva).subscribe({
        next: () => this.router.navigate(['/mostrar-reservas']),
        error: (err: unknown) => this.mostrarError(err),
      });
      return;
    }

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






