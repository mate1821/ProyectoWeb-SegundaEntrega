import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ReservaComponent } from './reserva.component';
import { Reserva } from '../../models/reserva.model';

/**
 * Prueba el TypeScript de reserva usando el formulario real (DOM) y verifica
 * que se llaman los 4 enlaces del backend: GET, POST, PUT y DELETE.
 */
describe('ReservaComponent', () => {
  const URL_RESERVAS = 'http://localhost:8090/api/reservas';
  const URL_USUARIOS = 'http://localhost:8090/api/usuarios';

  const usuarios = [
    { id: 2, nombre: 'Ana Torres', rol: { id: 2, nombre: 'Paciente' } },
    { id: 3, nombre: 'Carlos Ruiz', rol: { id: 3, nombre: 'Administrador' } },
    { id: 8, nombre: 'Laura Gómez', rol: { id: 1, nombre: 'Medico' } },
  ];

  const reservaExistente: Reserva = {
    idReserva: 5,
    usuario: { id: 2, nombre: 'Ana Torres' },
    medico: { id: 8, nombre: 'Laura Gómez' },
    fecha: '2026-11-05',
    horaInicio: '09:00:00',
    horaFin: '10:00:00',
    estado: { id: 1, nombre: 'Confirmada' },
    total: 120000,
    observaciones: 'Control',
  };

  let fixture: ComponentFixture<ReservaComponent>;
  let http: HttpTestingController;
  let el: HTMLElement;

  // Arranca el componente (ngOnInit dispara GET reservas y GET usuarios) y responde ambas
  async function iniciar(reservas: Reserva[] = [reservaExistente]): Promise<void> {
    fixture.detectChanges();
    http.expectOne({ method: 'GET', url: URL_RESERVAS }).flush(reservas);
    http.expectOne({ method: 'GET', url: URL_USUARIOS }).flush(usuarios);
    await fixture.whenStable();
  }

  function escribir(selector: string, valor: string): void {
    const control = el.querySelector<HTMLInputElement | HTMLSelectElement>(selector)!;
    control.value = valor;
    control.dispatchEvent(new Event('input', { bubbles: true }));
    control.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function llenarFormulario(): void {
    escribir('#paciente', '2');
    escribir('#medico', '8');
    escribir('#fecha', '2026-11-06');
    escribir('#horaInicio', '09:30');
    escribir('#observaciones', 'Primera consulta');
  }

  async function enviarFormulario(): Promise<void> {
    el.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await fixture.whenStable();
  }

  function boton(texto: string): HTMLButtonElement {
    return Array.from(el.querySelectorAll<HTMLButtonElement>('button'))
      .find((b) => b.textContent?.trim() === texto)!;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservaComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservaComponent);
    http = TestBed.inject(HttpTestingController);
    el = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => http.verify());

  it('GET: al iniciar muestra las reservas y llena los selects de paciente y médico', async () => {
    await iniciar();

    expect(el.querySelectorAll('tbody tr').length).toBe(1);
    expect(el.querySelector('tbody')!.textContent).toContain('Ana Torres');
    expect(el.querySelector('tbody')!.textContent).toContain('Confirmada');
    // placeholder + 1 paciente (el administrador no aparece) / placeholder + 1 médico
    expect(el.querySelectorAll('#paciente option').length).toBe(2);
    expect(el.querySelectorAll('#medico option').length).toBe(2);
  });

  it('POST: crea la reserva con los datos del formulario y recarga la lista', async () => {
    await iniciar();

    llenarFormulario();
    await enviarFormulario();

    const post = http.expectOne({ method: 'POST', url: URL_RESERVAS });
    expect(post.request.body).toEqual({
      usuario: { id: 2 },
      medico: { id: 8 },
      fecha: '2026-11-06',
      horaInicio: '09:30',
      observaciones: 'Primera consulta',
    });
    post.flush({ ...reservaExistente, idReserva: 6 }, { status: 201, statusText: 'Created' });
    await fixture.whenStable();

    // Después de crear vuelve a pedir la lista (GET) y limpia el formulario
    http.expectOne({ method: 'GET', url: URL_RESERVAS }).flush([reservaExistente]);
    await fixture.whenStable();
    expect(el.textContent).toContain('Reserva creada correctamente.');
    expect(el.querySelector<HTMLInputElement>('#fecha')!.value).toBe('');
  });

  it('POST: si faltan datos no llama al backend y muestra los errores', async () => {
    await iniciar();

    await enviarFormulario();

    http.expectNone({ method: 'POST', url: URL_RESERVAS });
    expect(el.textContent).toContain('Selecciona un paciente.');
    expect(el.textContent).toContain('Selecciona la fecha de la reserva.');
  });

  it('POST: muestra el mensaje de error que responde el backend (horario ocupado)', async () => {
    await iniciar();

    llenarFormulario();
    await enviarFormulario();

    http.expectOne({ method: 'POST', url: URL_RESERVAS })
      .flush({ error: 'El horario seleccionado ya está ocupado' }, { status: 409, statusText: 'Conflict' });
    await fixture.whenStable();
    fixture.detectChanges(); // el error se guarda en una señal tras la respuesta: se repinta la vista

    expect(fixture.componentInstance.error()).toBe('El horario seleccionado ya está ocupado');
    expect(el.querySelector('p[role="alert"]')!.textContent).toContain('El horario seleccionado ya está ocupado');
  });

  it('PUT: editar carga la fila en el formulario y guarda con PUT /api/reservas/{id}', async () => {
    await iniciar();

    boton('Editar').click();
    await fixture.whenStable();

    expect(el.querySelector('h2')!.textContent).toContain('Editar reserva #5');
    expect(el.querySelector<HTMLSelectElement>('#paciente')!.value).toBe('2');
    expect(el.querySelector<HTMLSelectElement>('#medico')!.value).toBe('8');
    expect(el.querySelector<HTMLInputElement>('#fecha')!.value).toBe('2026-11-05');
    expect(el.querySelector<HTMLInputElement>('#horaInicio')!.value).toBe('09:00');

    escribir('#observaciones', 'Cambio de observación');
    await enviarFormulario();

    const put = http.expectOne({ method: 'PUT', url: `${URL_RESERVAS}/5` });
    expect(put.request.body).toEqual({
      usuario: { id: 2 },
      medico: { id: 8 },
      fecha: '2026-11-05',
      horaInicio: '09:00',
      observaciones: 'Cambio de observación',
    });
    put.flush(reservaExistente);
    await fixture.whenStable();

    http.expectOne({ method: 'GET', url: URL_RESERVAS }).flush([reservaExistente]);
    await fixture.whenStable();
    expect(el.textContent).toContain('Reserva actualizada correctamente.');
    expect(el.querySelector('h2')!.textContent).toContain('Nueva reserva');
  });

  it('DELETE: cancelar llama DELETE /api/reservas/{id} y recarga la lista', async () => {
    await iniciar();

    boton('Cancelar').click();
    await fixture.whenStable();

    const del = http.expectOne({ method: 'DELETE', url: `${URL_RESERVAS}/5` });
    del.flush(null, { status: 204, statusText: 'No Content' });
    await fixture.whenStable();

    const cancelada: Reserva = { ...reservaExistente, estado: { id: 2, nombre: 'Cancelada' } };
    http.expectOne({ method: 'GET', url: URL_RESERVAS }).flush([cancelada]);
    await fixture.whenStable();

    expect(el.textContent).toContain('Reserva #5 cancelada.');
    expect(el.querySelector('tbody')!.textContent).toContain('Cancelada');
    expect(boton('Cancelar').disabled).toBe(true);
  });
});
