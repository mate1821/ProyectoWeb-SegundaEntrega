
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { timer } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';

import { PagoService } from '../services/pago.service';
import { Reserva } from '../models/reserva.model';

@Component({
  selector: 'app-boton-pagar',
  standalone: true,
  template: `
    <button type="button" (click)="pagar()" [disabled]="cargando">
      {{ cargando ? 'Esperando confirmación del pago...' : 'Reservar y pagar' }}
    </button>

    @if (mensaje) {
      <p>{{ mensaje }}</p>
    }
  `
})
export class BotonPagarComponent {
  @Input() reserva!: Reserva;

  cargando = false;
  mensaje = '';

  constructor(
    private pagos: PagoService,
    private router: Router
  ) {}

  pagar(): void {
    const pacienteId = Number(sessionStorage.getItem('reservaUsuarioId'));

    if (!pacienteId || !this.reserva) {
      this.mensaje = 'Faltan los datos de la reserva o del paciente.';
      return;
    }

    // Abrir la nueva pestaña directamente desde el clic del usuario.
    const ventanaPago = window.open('about:blank', '_blank');

    if (!ventanaPago) {
      this.mensaje = 'Permite las ventanas emergentes para continuar con el pago.';
      return;
    }

    this.cargando = true;
    this.mensaje = 'Abriendo Wompi...';

    this.pagos.pagar(pacienteId, this.reserva).subscribe({
      next: (respuesta) => {
        sessionStorage.setItem('ultimaReferencia', respuesta.referencia);

        // Enviar la nueva pestaña al checkout de Wompi.
        ventanaPago.location.href = respuesta.url;

        this.mensaje = 'Completa el pago en la otra pestaña. Estamos esperando la confirmación.';

        // Consultar periódicamente el estado de la orden.
        timer(0, 3000).pipe(
          switchMap(() => this.pagos.estado(respuesta.referencia)),
          takeWhile((orden) =>
            !(orden.estado === 'APPROVED' && orden.reservaCreada) &&
            !['DECLINED', 'ERROR', 'VOIDED'].includes(orden.estado),
            true
          )
        ).subscribe({
          next: (orden) => {
            if (orden.estado === 'APPROVED' && orden.reservaCreada) {
              this.mensaje = '¡Pago aprobado y reserva confirmada!';

              this.router.navigate(['/inicio', pacienteId]);
            } else if (['DECLINED', 'ERROR', 'VOIDED'].includes(orden.estado)) {
              this.cargando = false;
              this.mensaje = 'El pago no fue aprobado. Puedes intentarlo nuevamente.';
            }
          },
          error: (error) => {
            console.error('Error consultando el estado del pago:', error);
            this.cargando = false;
            this.mensaje = 'No pudimos consultar el estado del pago. Intenta nuevamente.';
          }
        });
      },
      error: (error) => {
        console.error('Error al iniciar el pago:', error);

        ventanaPago.close();

        this.cargando = false;
        this.mensaje = 'No fue posible iniciar el pago.';
      }
    });
  }
}
