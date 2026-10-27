import { Component, OnInit, inject, signal } from '@angular/core';

import { AdminService } from '../../services/admin.service';

import { Reserva } from '../../models/reserva.model';
import { EstadoReserva } from '../../models/estado.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {

  // Inyectamos el servicio del administrador.
  private adminService = inject(AdminService);

  // Obtenemos el nombre y el contador desde el servicio.
  readonly nombreAdmin = this.adminService.nombreAdmin;

  readonly contadorModificaciones =
    this.adminService.contadorModificaciones;

  // Datos que mostraremos en la pantalla.
  readonly reservas = signal<Reserva[]>([]);

  readonly estados = signal<EstadoReserva[]>([]);

  // Mensajes para el usuario.
  readonly mensaje = signal('');

  readonly error = signal('');

  // Identificador de la reserva que se está guardando.
  readonly guardandoId = signal<number | null>(null);

  // Se ejecuta cuando se abre el componente.
  ngOnInit(): void {

    this.cargarReservas();

    this.cargarEstados();
  }

  // Obtener las reservas desde el servicio.
  cargarReservas(): void {

    this.adminService.obtenerReservas().subscribe({

      next: (datos) => {
        this.reservas.set(datos);
      },

      error: () => {
        this.error.set(
          'No se pudieron cargar las consultas. Verifica que el backend esté encendido.'
        );
      }

    });
  }

  // Obtener los estados disponibles.
  cargarEstados(): void {

    this.adminService.obtenerEstados().subscribe({

      next: (datos) => {
        this.estados.set(datos);
      },

      error: () => {
        this.error.set(
          'No se pudieron cargar los estados de las consultas.'
        );
      }

    });
  }

  // Modificar el estado de una consulta.
  cambiarEstado(
    reserva: Reserva,
    selector: HTMLSelectElement
  ): void {

    const idReserva = reserva.idReserva;

    const idEstadoNuevo = Number(selector.value);

    const idEstadoAnterior = reserva.estado?.id;

    // Verificamos que los datos sean válidos.
    if (
      idReserva === undefined ||
      !Number.isInteger(idEstadoNuevo) ||
      !this.estados().some(estado => estado.id === idEstadoNuevo)
    ) {
      return;
    }

    // Si el estado no cambió, no contamos modificación.
    if (idEstadoAnterior === idEstadoNuevo) {
      return;
    }

    // Evitamos guardar varias modificaciones simultáneamente.
    if (this.guardandoId() !== null) {
      return;
    }

    this.mensaje.set('');

    this.error.set('');

    this.guardandoId.set(idReserva);

    // Solicitamos el cambio al backend.
    this.adminService.cambiarEstado(
      idReserva,
      idEstadoNuevo
    ).subscribe({

      next: (reservaActualizada) => {

        // Actualizamos la reserva mostrada en pantalla.
        this.reservas.update(lista =>
          lista.map(item =>
            item.idReserva === idReserva
              ? reservaActualizada
              : item
          )
        );

        this.mensaje.set(
          `La consulta #${idReserva} se modificó correctamente.`
        );

        this.guardandoId.set(null);

        // IMPORTANTE:
        // No incrementamos el contador aquí.
        // AdminService ya lo incrementa después del éxito.
      },

      error: () => {

        this.error.set(
          'No se pudo modificar la consulta. Inténtalo nuevamente.'
        );

        // Devolvemos el selector a su estado anterior.
        if (idEstadoAnterior !== undefined) {
          selector.value = String(idEstadoAnterior);
        }

        this.guardandoId.set(null);

        // El contador permanece igual porque hubo un error.
      }

    });
  }
}