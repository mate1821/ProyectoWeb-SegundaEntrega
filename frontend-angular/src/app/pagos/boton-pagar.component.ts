
import { Component, Input } from '@angular/core';
import { PagoService } from '../services/pago.service';
import { Reserva } from '../models/reserva.model';

@Component({
  selector: 'app-boton-pagar',
  standalone: true,
  template: `
    <button type="button" (click)="pagar()" [disabled]="cargando">
      {{ cargando ? 'Redirigiendo a Wompi...' : 'Reservar y pagar' }}
    </button>
  `
})
export class BotonPagarComponent {
  @Input() reserva!: Reserva;
  cargando = false;

  constructor(private pagos: PagoService) {}

  pagar(): void {
    const pacienteId = Number(sessionStorage.getItem('reservaUsuarioId'));

    if (!pacienteId || !this.reserva) {
      console.error('Faltan los datos de la reserva o el paciente.');
      return;
    }

    this.cargando = true;

    this.pagos.pagar(pacienteId, this.reserva).subscribe({
      next: (respuesta) => {
        sessionStorage.setItem('ultimaReferencia', respuesta.referencia);
        window.location.href = respuesta.url;
      },
      error: (error) => {
        console.error('Error al iniciar el pago:', error);
        this.cargando = false;
      }
    });
  }
}
