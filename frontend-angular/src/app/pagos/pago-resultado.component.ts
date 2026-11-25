import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagoService } from '../services/pago.service';
import { ReservaService } from '../services/reserva.service';
import { Reserva } from '../models/reserva.model';
import { Router } from '@angular/router';
/**
 * Pagina a la que Wompi devuelve al usuario (/pago/resultado).[cite: 6]
 * Consulta el estado de la orden y, si es APPROVED, crea la reserva pendiente y continúa el flujo.[cite: 6]
 */
@Component({
  selector: 'app-pago-resultado',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="pagina pagina-estrecha">
      <section class="tarjeta tarjeta-formulario" aria-labelledby="titulo-pago">
        <h1 id="titulo-pago">Resultado del pago</h1>
        <p class="mensaje mensaje-cargando" role="status"
          *ngIf="estado === 'PENDING'">Estamos confirmando tu pago...</p>
        <p class="mensaje mensaje-exito" role="status"
          *ngIf="estado === 'APPROVED'">¡Pago aprobado! Registrando tu reserva...</p>
        <p class="mensaje mensaje-error" role="alert"
          *ngIf="estado === 'DECLINED' || estado === 'ERROR'">El pago no se pudo completar ({{ estado }}).</p>
        <p class="mensaje mensaje-aviso" *ngIf="!estado">No encontramos tu orden.</p>
        <p class="mensaje mensaje-error" role="alert" *ngIf="errorReserva">{{ errorReserva }}</p>
      </section>
    </main>
  `
})
export class PagoResultadoComponent implements OnInit, OnDestroy {
  estado = '';
  errorReserva = '';
  private intervalo?: ReturnType<typeof setInterval>;
  private reservaProcesada = false;

  private router = inject(Router);
  private reservaService = inject(ReservaService);

  constructor(private pagos: PagoService) {}

  ngOnInit() {
    const referencia = sessionStorage.getItem('ultimaReferencia');
    if (!referencia) return;

    this.estado = 'PENDING';
    this.intervalo = setInterval(() => {
      this.pagos.estado(referencia).subscribe({
        next: (r) => {
          this.estado = r.estado;
          if (r.estado !== 'PENDING') {
            clearInterval(this.intervalo);
            this.manejarResultadoPago(r.estado);
          }
        },
        error: () => {
          this.errorReserva = 'No fue posible consultar el estado del pago.';
        }
      });
    }, 3000);
  }

  private manejarResultadoPago(estadoPago: string): void {
    if (this.reservaProcesada) return;
    this.reservaProcesada = true;

    const rawReserva = sessionStorage.getItem('reservaPendiente');
    const rawUsuarioId = sessionStorage.getItem('reservaUsuarioId');

    if (estadoPago !== 'APPROVED') {
      sessionStorage.removeItem('reservaPendiente');
      sessionStorage.removeItem('reservaUsuarioId');
      return;
    }

    if (!rawReserva || !rawUsuarioId) {
      return;
    }

    const reserva: Reserva = JSON.parse(rawReserva);
    const pacienteId = Number(rawUsuarioId);

    this.reservaService.crearReserva(pacienteId, reserva).subscribe({
      next: () => {
        sessionStorage.removeItem('reservaPendiente');
        sessionStorage.removeItem('reservaUsuarioId');
        this.router.navigate(['/inicio', pacienteId]);
      },
      error: () => {
        this.errorReserva = 'El pago fue aprobado, pero ocurrió un error al registrar la reserva.';
      }
    });
  }

  ngOnDestroy() {
    clearInterval(this.intervalo);
  }
}