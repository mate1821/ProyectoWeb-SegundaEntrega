import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AdminService } from '../../services/admin.service';
import { Reserva } from '../../models/reserva.model';
import { EstadoReserva } from '../../models/estado.model';
import { mensajeError } from '../../utils/mensaje-error';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css', './admin-tabla.css']
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
  cargando = signal(true);
  busqueda = signal('');
  filtroEstado = signal('');
  soloHoy = signal(false);
  readonly hoy = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date());
  readonly deHoy = computed(() => this.reservas().filter(r => r.fecha === this.hoy).length);

  readonly distribucion = computed(() => {
    const cantidades = new Map<string, number>();
    for (const reserva of this.reservas()) {
      const estado = reserva.estado?.nombre || 'Sin estado';
      cantidades.set(estado, (cantidades.get(estado) ?? 0) + 1);
    }
    return Array.from(cantidades, ([estado, cantidad]) => ({ estado, cantidad }));
  });

  readonly indicadores = computed(() => ['Confirmada', 'Completada', 'Cancelada'].map(estado => ({
    estado,
    cantidad: this.distribucion().find(dato => dato.estado === estado)?.cantidad ?? 0,
  })));

  readonly meses = computed(() => {
    const cantidades = new Map<string, number>();
    for (const reserva of this.reservas()) {
      const mes = reserva.fecha.slice(0, 7);
      cantidades.set(mes, (cantidades.get(mes) ?? 0) + 1);
    }
    return Array.from(cantidades, ([mes, cantidad]) => ({ mes, cantidad }))
      .sort((a, b) => a.mes.localeCompare(b.mes)).slice(-6);
  });

  readonly maxMes = computed(() => Math.max(1, ...this.meses().map(mes => mes.cantidad)));

  readonly grupos = computed(() => {
    const texto = normalizar(this.busqueda().trim().replace(/^#/, ''));
    const grupos = new Map<string, Reserva[]>();
    for (const reserva of this.reservas()) {
      const estado = reserva.estado?.nombre || 'Sin estado';
      if (this.soloHoy() && reserva.fecha !== this.hoy) continue;
      if (this.filtroEstado() && estado !== this.filtroEstado()) continue;
      if (texto && !normalizar(reserva.usuario?.nombre ?? '').includes(texto)
        && !String(reserva.idReserva ?? '').includes(texto)) continue;

      const mes = reserva.fecha.slice(0, 7);
      const citas = grupos.get(mes) ?? [];
      citas.push(reserva);
      grupos.set(mes, citas);
    }
    return Array.from(grupos, ([mes, reservas]) => ({ mes, reservas }))
      .sort((a, b) => b.mes.localeCompare(a.mes));
  });

  iniciales(nombre: string): string {
    return nombre.trim().split(/\s+/).slice(0, 2).map(parte => parte.charAt(0)).join('').toUpperCase();
  }

  ngOnInit(): void {
    this.cargarReservas();

    this.adminService.obtenerEstados().subscribe({
      next: (datos) => this.estados.set(datos),
      error: (err: unknown) => this.error.set(mensajeError(err, 'No se pudieron cargar los estados.'))
    });
  }

  cargarReservas(): void {
    this.adminService.obtenerReservas().subscribe({
      next: (datos) => {
        this.reservas.set(datos);
        this.cargando.set(false);
      },
      error: (err: unknown) => {
        this.cargando.set(false);
        this.error.set(mensajeError(err, 'No se pudieron cargar las reservas.'));
      }
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
      error: (err: unknown) => {
        this.error.set(mensajeError(err, 'No se pudo modificar la reserva.'));
        this.cargarReservas(); // devuelve el select a su valor real
      }
    });
  }
}

function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}
