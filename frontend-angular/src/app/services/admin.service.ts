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

  // Identificador para guardar los datos de esta sesión.
  private readonly claveSesion = 'admin-sesion';

  // Signals internos.
  private readonly _nombreAdmin = signal('Administrador');
  private readonly _contadorModificaciones = signal(0);

  // Valores que podrá consultar el componente.
  readonly nombreAdmin = this._nombreAdmin.asReadonly();
  readonly contadorModificaciones =
    this._contadorModificaciones.asReadonly();

  constructor() {
    this.recuperarSesion();
  }

  // Se ejecutará cuando un administrador inicie sesión.
  iniciarSesion(nombre: string): void {

    this._nombreAdmin.set(nombre?.trim() || 'Administrador');

    // Cada nuevo inicio de sesión comienza desde cero.
    this._contadorModificaciones.set(0);

    this.guardarSesion();
  }

  // Obtener las reservas utilizando el servicio existente.
  obtenerReservas(): Observable<Reserva[]> {
    return this.reservaService.obtenerReservas();
  }

  // Obtener los estados utilizando el servicio existente.
  obtenerEstados(): Observable<EstadoReserva[]> {
    return this.estadoService.obtenerEstados();
  }

  // Modificar el estado de una reserva.
  cambiarEstado(
    idReserva: number,
    idEstado: number
  ): Observable<Reserva> {

    return this.reservaService
      .cambiarEstado(idReserva, idEstado)
      .pipe(
        tap(() => {

          // Solo se ejecuta cuando la petición es exitosa.
          this._contadorModificaciones.update(
            contador => contador + 1
          );

          this.guardarSesion();
        })
      );
  }

  // Limpiar los datos del administrador al cerrar sesión.
  cerrarSesion(): void {

    this._nombreAdmin.set('Administrador');

    this._contadorModificaciones.set(0);

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(this.claveSesion);
    }
  }

  // Guardar los datos en la sesión de la pestaña.
  private guardarSesion(): void {

    if (typeof sessionStorage === 'undefined') {
      return;
    }

    const datos = {
      nombre: this._nombreAdmin(),
      contador: this._contadorModificaciones()
    };

    sessionStorage.setItem(
      this.claveSesion,
      JSON.stringify(datos)
    );
  }

  // Recuperar el contador al recargar la página.
  private recuperarSesion(): void {

    if (typeof sessionStorage === 'undefined') {
      return;
    }

    const guardado = sessionStorage.getItem(this.claveSesion);

    if (!guardado) {
      return;
    }

    try {

      const datos = JSON.parse(guardado);

      if (typeof datos.nombre === 'string') {
        this._nombreAdmin.set(datos.nombre);
      }

      if (
        Number.isInteger(datos.contador) &&
        datos.contador >= 0
      ) {
        this._contadorModificaciones.set(datos.contador);
      }

    } catch (error) {

      console.error('Error recuperando sesión del administrador:', error);

      sessionStorage.removeItem(this.claveSesion);
    }
  }
}