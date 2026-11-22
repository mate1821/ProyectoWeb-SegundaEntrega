
import { Component, OnInit, inject, signal, } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Reserva } from '../../models/reserva.model';
import { EstadoReserva } from '../../models/estado.model';
import { ReservaService } from '../../services/reserva.service';
import { mensajeError } from '../../utils/mensaje-error';
import { EstadoService } from '../../services/estado.service';
import { DetallesReserva } from '../detalles-reserva/detalles-reserva.component';


@Component({
  imports: [RouterLink],
  selector: 'app-mostrar-reservas',
  styleUrl: './mostrar-reservas.component.css',
  templateUrl: './mostrar-reservas.component.html',
})
export class MostrarReservas implements OnInit {

  private route = inject(ActivatedRoute);
  usuarioId = Number(this.route.snapshot.paramMap.get('id'));
  esMedico = this.route.snapshot.data['rol'] === 'medico';


  private reservaService = inject(ReservaService);
  private estadoService = inject(EstadoService);

  reservas = signal<Reserva[]>([]);
  cargando = signal(true);
  estados = signal<EstadoReserva[]>([]);
  mensaje = signal('');
  error = signal('');
  reservaSeleccionada = signal<Reserva | null>(null);


  ngOnInit(): void {
    this.cargarReservas();
    this.estadoService.obtenerEstados().subscribe({
      next: (data) => this.estados.set(data),
      error: (err: unknown) => this.mostrarError(err),
    });
  }

  cargarReservas(): void {
    const peticion = this.esMedico
      ? this.reservaService.obtenerReservasMedico(this.usuarioId)
      : this.reservaService.obtenerMisReservas(this.usuarioId);

    peticion.subscribe({
      next: (data) => {
        this.reservas.set(data);
        this.cargando.set(false);
      },
      error: (err: unknown) => {
        this.cargando.set(false);
        this.mostrarError(err);
      },
    });
  }

  cambiarEstado(reserva: Reserva, idEstado: string): void {
    if (reserva.idReserva === undefined) {
      return;
    }

    this.mensaje.set('');
    this.error.set('');
    this.reservaService.cambiarEstado(reserva.idReserva, Number(idEstado)).subscribe({
      next: (actualizada) => {
        this.mensaje.set(`Reserva #${reserva.idReserva} ahora está ${actualizada.estado?.nombre}.`);
        this.cargarReservas();
      },
      error: (err: unknown) => this.mostrarError(err),
    });
  }
  verDetalles(reserva: Reserva): void {
    this.reservaSeleccionada.set(reserva);
  }

  cerrarDetalles(): void {
    this.reservaSeleccionada.set(null);
  }

  private mostrarError(err: unknown): void {
    this.error.set(mensajeError(err, 'No se pudo completar la operación.'));
  }


  
}






















