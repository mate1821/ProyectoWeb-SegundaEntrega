import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AdminService } from '../../services/admin.service';
import { Reserva } from '../../models/reserva.model';
import { EstadoReserva } from '../../models/estado.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {

  private adminService = inject(AdminService);

  // Signals del servicio: nombre y contador de modificaciones
  nombreAdmin = this.adminService.nombreAdmin;
  contadorModificaciones = this.adminService.contadorModificaciones;

  reservas = signal<Reserva[]>([]);
  estados = signal<EstadoReserva[]>([]);
  mensaje = signal('');
  error = signal('');

  ngOnInit(): void {
    this.cargarReservas();

    this.adminService.obtenerEstados().subscribe({
      next: (datos) => this.estados.set(datos),
      error: () => this.error.set('No se pudieron cargar los estados.')
    });
  }

  cargarReservas(): void {
    this.adminService.obtenerReservas().subscribe({
      next: (datos) => this.reservas.set(datos),
      error: () => this.error.set('No se pudieron cargar las reservas. Verifica que el backend esté encendido.')
    });
  }

  cambiarEstado(reserva: Reserva, valor: string): void {
    const idEstado = Number(valor);

    if (reserva.idReserva === undefined || idEstado === reserva.estado?.id) {
      return;
    }

    this.mensaje.set('');
    this.error.set('');

    this.adminService.cambiarEstado(reserva.idReserva, idEstado).subscribe({
      next: (actualizada) => {
        this.reservas.update(lista =>
          lista.map(r => r.idReserva === actualizada.idReserva ? actualizada : r)
        );
        this.mensaje.set(`La reserva #${reserva.idReserva} se modificó correctamente.`);
      },
      error: () => {
        this.error.set('No se pudo modificar la reserva.');
        this.cargarReservas(); // devuelve el select a su valor real
      }
    });
  }
}