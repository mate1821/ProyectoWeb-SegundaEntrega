import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { Reserva } from '../models/reserva.model';
import { EstadoReserva } from '../models/estado.model';

import { ReservaService } from './reserva.service';
import { EstadoService } from './estado.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private reservaService = inject(ReservaService);
  private estadoService = inject(EstadoService);

  readonly nombreAdmin = signal('Administrador');
  readonly contadorModificaciones = signal(0);

  // Al iniciar sesión el admin: guarda el nombre y reinicia el contador
  iniciarSesion(nombre: string): void {
    this.nombreAdmin.set(nombre?.trim() || 'Administrador');
    this.contadorModificaciones.set(0);
  }

  // Al cerrar sesión: vuelve a los valores iniciales
  cerrarSesion(): void {
    this.nombreAdmin.set('Administrador');
    this.contadorModificaciones.set(0);
  }

  obtenerReservas(): Observable<Reserva[]> {
    return this.reservaService.obtenerReservas();
  }

  obtenerEstados(): Observable<EstadoReserva[]> {
    return this.estadoService.obtenerEstados();
  }

  // Cambia el estado y, si el backend responde bien, suma 1 al contador
  cambiarEstado(idReserva: number, idEstado: number): Observable<Reserva> {
    return this.reservaService
      .cambiarEstado(idReserva, idEstado)
      .pipe(tap(() => this.contadorModificaciones.update(c => c + 1)));
  }
}