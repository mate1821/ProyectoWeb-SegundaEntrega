import { Component, inject, signal, OnInit } from '@angular/core';
import { ReservaService } from '../../services/reserva.service';
import { mensajeError } from '../../utils/mensaje-error';
import { MedicoService } from '../../services/medico.service';
import { ReservaComponent } from '../reserva-form/reserva-form.component';
import { Especialidad } from '../../models/especialidad.model';
import { Medico } from '../../models/medico.model';
import { Servicio } from '../../models/servicio.model';
import { Reserva } from '../../models/reserva.model';
import { EspecialidadService } from '../../services/especialidades.service';
import { ServiciosService } from '../../services/servicios.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  imports: [ReservaComponent],
  selector: 'app-reservas',
  styleUrl: './reservas.component.css',
  templateUrl: './reservas.component.html',
})
export class Reservas implements OnInit {
  router = inject(Router);
  route = inject(ActivatedRoute);
  reservaService = inject(ReservaService);
  medicoService = inject(MedicoService);
  especialidadService = inject(EspecialidadService);
  servicioService = inject(ServiciosService);

  mensaje = signal('');
  error = signal('');
  reservaEditando = signal<Reserva | null>(null);
  preseleccion = signal<{ especialidadId: number; medicoId: number } | null>(null);

  private idRuta = Number(this.route.snapshot.paramMap.get('id'));
  private modoEditar = this.route.snapshot.data['editar'] === true;

  especialidades = signal<Especialidad[]>([]);
  medicos = signal<Medico[]>([]);
  servicios = signal<Servicio[]>([]);
  horasDisponibles = signal<string[]>([]);

  ngOnInit(): void {
    if (!this.modoEditar && this.idRuta > 0) {
      sessionStorage.setItem('reservaUsuarioId', String(this.idRuta));
    }

    this.especialidadService.obtenerEspecialidades().subscribe({
      next: (data) => this.especialidades.set(data),
      error: (err: unknown) => this.mostrarError(err),
    });

    this.servicioService.obtenerServicios().subscribe({
      next: (data) => this.servicios.set(data),
      error: (err: unknown) => this.mostrarError(err),
    });

    if (this.modoEditar) {
      this.cargarReservaAEditar(this.idRuta);
    } else {
      const params = this.route.snapshot.queryParamMap;
      const especialidadId = Number(params.get('especialidadId'));
      const medicoId = Number(params.get('medicoId'));
      if (especialidadId > 0 && medicoId > 0) {
        this.cargarMedicos(especialidadId);
        this.preseleccion.set({ especialidadId, medicoId });
      }
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
        if (reserva.medico) {
          this.cargarHoras({ medicoId: reserva.medico.id, fecha: reserva.fecha });
        }
      },
      error: (err: unknown) => this.mostrarError(err),
    });
  }

  cargarMedicos(especialidadId: number): void {
    this.medicos.set([]);
    this.horasDisponibles.set([]);
    this.medicoService.obtenerPorEspecialidad(especialidadId).subscribe({
      next: (data) => this.medicos.set(data),
      error: (err: unknown) => this.mostrarError(err),
    });
  }

  cargarHoras(datos: { medicoId: number; fecha: string }): void {
    this.horasDisponibles.set([]);
    this.reservaService.obtenerHorasDisponibles(datos.medicoId, datos.fecha).subscribe({
      next: (horas) => {
        const lista = horas.map((h) => h.substring(0, 5));

        const r = this.reservaEditando();
        if (r && r.medico?.id === datos.medicoId && r.fecha === datos.fecha) {
          const propia = r.horaInicio.substring(0, 5);
          if (!lista.includes(propia)) {
            lista.push(propia);
            lista.sort();
          }
        }

        this.horasDisponibles.set(lista);
      },
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

    // Para reservas nuevas, el flujo pasa primero por el pago con Wompi y la creación se ejecuta al aprobarse el pago.
    sessionStorage.setItem('reservaPendiente', JSON.stringify(reserva));
    if (this.idRuta > 0) {
      sessionStorage.setItem('reservaUsuarioId', String(this.idRuta));
    }
  }

  private mostrarError(err: unknown): void {
    this.error.set(mensajeError(err, 'No se pudo completar la operación.'));
  }
}