import { TestBed } from '@angular/core/testing';

import { provideHttpClient } from '@angular/common/http';

import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { AdminService } from './admin.service';

import { Reserva } from '../models/reserva.model';

describe('AdminService', () => {

  let service: AdminService;
  let http: HttpTestingController;

  const url = 'http://localhost:8090/api/reservas';

  const reserva: Reserva = {
    idReserva: 15,
    fecha: '2026-10-27',
    horaInicio: '09:00',
    estado: {
      id: 1,
      nombre: 'Confirmada'
    }
  };

  beforeEach(() => {

    // Limpiamos los datos de una prueba anterior.
    sessionStorage.removeItem('admin-sesion');

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(AdminService);

    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {

    // Verificamos que no queden peticiones pendientes.
    http.verify();

    sessionStorage.removeItem('admin-sesion');
  });


  // PRUEBA 1
  it('debe crear el servicio', () => {

    expect(service).toBeTruthy();

  });


  // PRUEBA 2
  it('debe iniciar la sesión con el nombre y contador en cero', () => {

    service.iniciarSesion('Juan Manuel');

    expect(service.nombreAdmin()).toBe('Juan Manuel');

    expect(service.contadorModificaciones()).toBe(0);

  });


  // PRUEBA 3
  it('debe contar dos modificaciones exitosas de la misma consulta', () => {

    service.iniciarSesion('Juan Manuel');

    // Primera modificación.
    service.cambiarEstado(15, 2).subscribe();

    const primeraPeticion = http.expectOne(
      `${url}/15/estado`
    );

    expect(primeraPeticion.request.method).toBe('PUT');

    expect(primeraPeticion.request.body).toEqual({
      id: 2
    });

    primeraPeticion.flush({
      ...reserva,
      estado: {
        id: 2,
        nombre: 'Pendiente'
      }
    });

    expect(service.contadorModificaciones()).toBe(1);


    // Segunda modificación de la misma consulta.
    service.cambiarEstado(15, 3).subscribe();

    const segundaPeticion = http.expectOne(
      `${url}/15/estado`
    );

    expect(segundaPeticion.request.method).toBe('PUT');

    segundaPeticion.flush({
      ...reserva,
      estado: {
        id: 3,
        nombre: 'Cancelada'
      }
    });

    expect(service.contadorModificaciones()).toBe(2);

  });


  // PRUEBA 4
  it('no debe aumentar el contador cuando falla una modificación', () => {

    service.iniciarSesion('Juan Manuel');

    service.cambiarEstado(15, 2).subscribe({
      error: () => {
        // El error es esperado durante esta prueba.
      }
    });

    const peticion = http.expectOne(
      `${url}/15/estado`
    );

    // Antes de recibir respuesta, el contador sigue en cero.
    expect(service.contadorModificaciones()).toBe(0);

    // Simulamos una respuesta de error del backend.
    peticion.flush(
      { error: 'No se pudo guardar la modificación' },
      {
        status: 500,
        statusText: 'Error interno'
      }
    );

    // Como falló, no contamos la modificación.
    expect(service.contadorModificaciones()).toBe(0);

  });


  // PRUEBA 5
  it('debe reiniciar el contador cuando comienza una nueva sesión', () => {

    service.iniciarSesion('Juan Manuel');

    service.cambiarEstado(15, 2).subscribe();

    const peticion = http.expectOne(
      `${url}/15/estado`
    );

    peticion.flush({
      ...reserva,
      estado: {
        id: 2,
        nombre: 'Pendiente'
      }
    });

    expect(service.contadorModificaciones()).toBe(1);

    // Inicia una sesión diferente.
    service.iniciarSesion('Administrador Dos');

    expect(service.nombreAdmin()).toBe('Administrador Dos');

    expect(service.contadorModificaciones()).toBe(0);

  });


  // PRUEBA 6
  it('debe limpiar los datos cuando se cierra la sesión', () => {

    service.iniciarSesion('Juan Manuel');

    expect(sessionStorage.getItem('admin-sesion')).not.toBeNull();

    service.cerrarSesion();

    expect(service.contadorModificaciones()).toBe(0);

    expect(service.nombreAdmin()).toBe('Administrador');

    expect(sessionStorage.getItem('admin-sesion')).toBeNull();

  });

});