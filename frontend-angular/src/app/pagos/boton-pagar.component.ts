import { Component, Input } from '@angular/core';
import { PagoService } from '../services/pago.service';

/**
 * Boton "Pagar con Wompi". Uso en cualquier pagina:
 *   <app-boton-pagar [monto]="15000"></app-boton-pagar>
 * (monto en pesos colombianos)
 */
@Component({
  selector: 'app-boton-pagar',
  standalone: true,
  template: `
    <button type="button" (click)="pagar()" [disabled]="cargando">
      {{ cargando ? 'Redirigiendo a Wompi...' : 'Pagar $' + monto + ' con Wompi' }}
    </button>
  `
})
export class BotonPagarComponent {
  @Input() monto = 15000;
  cargando = false;

  constructor(private pagos: PagoService) {}

  pagar() {
    this.cargando = true;
    this.pagos.pagar(this.monto);
  }
}
