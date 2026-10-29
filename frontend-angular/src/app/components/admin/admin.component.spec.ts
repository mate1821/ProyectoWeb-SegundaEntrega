import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClient } from '@angular/common/http';

import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { AdminComponent } from './admin.component';

import { AdminService } from '../../services/admin.service';

import { Reserva } from '../../models/reserva.model';

describe('AdminComponent', () => {

  let component: AdminComponent;

  let fixture: ComponentFixture<AdminComponent>;

  let adminService: AdminService;

  let http: HttpTestingController;

  const urlReservas = 'http://localhost:8090/api/reservas';

  const urlEstados = 'http://localhost:8090/api/estados';

  const reserva: Reserva = {
    idReserva: 15,
    fecha: '2026-10-27',
    horaInicio: '09:00',
    estado: {
      id: 1,
      nombre: 'Confirmada'
    }
  };

  const estados = [
    { id: 1, nombre: 'Confirmada' },
    { id: 2, nombre: 'Pendiente' }
  ];

  beforeEach(async () => {

    sessionStorage.removeItem('admin-sesion');

    await TestBed.configureTestingModule({
      imports: [AdminComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminComponent);

    component = fixture.componentInstance;

    adminService = TestBed.inject(AdminService);

    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {

    http.verify();

    sessionStorage.removeItem('admin-sesion');
  });


  // Función auxiliar para cargar los datos de prueba.
  function cargarPantalla(): void {

    fixture.detectChanges();

    const peticionReservas = http.expectOne(urlReservas);

    peticionReservas.flush([reserva]);

    const peticionEstados = http.expectOne(urlEstados);

    peticionEstados.flush(estados);

    fixture.detectChanges();
  }


  // PRUEBA 1
  it('debe mostrar el nombre del administrador mediante interpolación', () => {

    adminService.iniciarSesion('Juan Manuel');

    cargarPantalla();

    expect(component).toBeTruthy();

    const titulo = fixture.nativeElement.querySelector('h2');

    expect(titulo.textContent).toContain('Juan Manuel');

  });


  // PRUEBA 2
  it('debe mostrar las consultas disponibles', () => {

    cargarPantalla();

    const contenido = fixture.nativeElement.textContent;

    expect(contenido).toContain('#15');

    expect(contenido).toContain('Confirmada');

  });


  // PRUEBA 3
  it('debe aumentar el contador después de modificar una consulta', () => {

    adminService.iniciarSesion('Juan Manuel');

    cargarPantalla();

    const selector: HTMLSelectElement =
      fixture.nativeElement.querySelector('select');

    // Seleccionamos un estado diferente.
    selector.value = '2';

    selector.dispatchEvent(new Event('change'));

    // Simulamos una respuesta exitosa del backend.
    const peticion = http.expectOne(
      `${urlReservas}/15/estado`
    );

    expect(peticion.request.method).toBe('PUT');

    peticion.flush({
      ...reserva,
      estado: {
        id: 2,
        nombre: 'Pendiente'
      }
    });

    fixture.detectChanges();

    expect(adminService.contadorModificaciones()).toBe(1);

  });


  // PRUEBA 4
  it('no debe aumentar el contador si selecciona el mismo estado', () => {

    adminService.iniciarSesion('Juan Manuel');

    cargarPantalla();

    const selector: HTMLSelectElement =
      fixture.nativeElement.querySelector('select');

    // La consulta ya estaba Confirmada (estado 1).
    selector.value = '1';

    selector.dispatchEvent(new Event('change'));

    // No debe enviarse una modificación.
    http.expectNone(`${urlReservas}/15/estado`);

    expect(adminService.contadorModificaciones()).toBe(0);

  });


  // PRUEBA 5
  it('no debe aumentar el contador si falla el backend', () => {

    adminService.iniciarSesion('Juan Manuel');

    cargarPantalla();

    const selector: HTMLSelectElement =
      fixture.nativeElement.querySelector('select');

    selector.value = '2';

    selector.dispatchEvent(new Event('change'));

    const peticion = http.expectOne(
      `${urlReservas}/15/estado`
    );

    // Simulamos un error del backend.
    peticion.flush(
      { error: 'Error al modificar la consulta' },
      {
        status: 500,
        statusText: 'Error interno'
      }
    );

    fixture.detectChanges();

    // El contador debe permanecer en cero.
    expect(adminService.contadorModificaciones()).toBe(0);

    // El selector debe regresar al estado anterior.
    expect(selector.value).toBe('1');

  });

});