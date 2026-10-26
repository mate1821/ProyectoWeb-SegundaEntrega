
import { Component, OnInit, inject, signal, } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Reserva } from '../../models/reserva.model';
import { EstadoReserva } from '../../models/estado.model';
import { ReservaService } from '../../services/reserva.service';
import { EstadoService } from '../../services/estado.service';

@Component({
  imports: [RouterLink],
  selector: 'app-mostrar-reservas',
  styleUrl: './mostrar-reservas.component.css',
  templateUrl: './mostrar-reservas.component.html',
})
export class MostrarReservas implements OnInit  {


  private reservaService = inject(ReservaService);
  private estadoService = inject(EstadoService);

  reservas = signal<Reserva[]>([]);
  estados = signal<EstadoReserva[]>([]);
  mensaje = signal('');
  error = signal('');

  ngOnInit(): void {
    this.cargarReservas();
    this.estadoService.obtenerEstados().subscribe({
      next: (data) => this.estados.set(data),
      error: (err: unknown) => this.mostrarError(err),
    });
  }

  cargarReservas(): void {
    this.reservaService.obtenerMisReservas().subscribe({
      next: (data) => this.reservas.set(data),
      error: (err: unknown) => this.mostrarError(err),
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

  private mostrarError(err: unknown): void {
    if (err instanceof HttpErrorResponse && err.status === 401) {
      this.error.set('Debes iniciar sesión para ver tus reservas.');
      return;
    }
    const cuerpo: unknown = err instanceof HttpErrorResponse ? err.error : null;
    if (typeof cuerpo === 'object' && cuerpo !== null && 'error' in cuerpo && typeof cuerpo.error === 'string') {
      this.error.set(cuerpo.error);
    } else {
      this.error.set('No se pudo completar la operación. Verifica que el backend esté encendido.');
    }
  }
}






















