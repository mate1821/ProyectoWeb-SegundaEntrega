import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { Reservas } from './reservas.component';
import { Reserva } from '../../models/reserva.model';

/** Página de reserva: sin id crea (POST) y en /reservas/editar/:id carga la reserva y la actualiza (PUT). */
describe('Reservas', () => {
  const API = 'http://localhost:8090/api';

  const especialidades = [
    { id: 1, nombreEspecialidad: 'PEDIATRIA', costo: 70000 },
    { id: 2, nombreEspecialidad: 'CARDIOLOGIA', costo: 90000 },
  ];
  const servicios = [
    { id: 1, nombre: 'Nocturno', costo: 50000 },
    { id: 2, nombre: 'Domicilio', costo: 30000 },
  ];
  const medicosPediatria = [
    { id: 8, nombre: 'Laura Gómez' },
    { id: 9, nombre: 'Ansu Fati' },
  ];

  const reserva: Reserva = {
    idReserva: 5,
    usuario: { id: 2, nombre: 'Ana Torres', cedula: 1, fecha_nacimiento: '1990-01-01', correo: 'a@a.com', contrasena: 'x' },
    medico: { id: 8, nombre: 'Laura Gómez', especialidad: { id: 1, nombreEspecialidad: 'PEDIATRIA' } },
    fecha: '2026-11-05',
    horaInicio: '09:00:00',
    horaFin: '10:00:00',
    estado: { id: 1, nombre: 'Confirmada' },
    observaciones: 'Control mensual',
    servicios: [{ id: 1, nombre: 'Nocturno', costo: 50000 }],
  };

  let fixture: ComponentFixture<Reservas>;
  let http: HttpTestingController;
  let el: HTMLElement;

  function configurar(id: string | null): void {
    TestBed.configureTestingModule({
      imports: [Reservas],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap(id ? { id } : {}) } } },
      ],
    });
    fixture = TestBed.createComponent(Reservas);
    http = TestBed.inject(HttpTestingController);
    el = fixture.nativeElement as HTMLElement;
  }

  function pedirMedicos(especialidadId: number) {
    return http.expectOne(
      (r) => r.method === 'GET' && r.url === `${API}/medicos` && r.params.get('especialidadId') === String(especialidadId),
    );
  }

  async function estabilizar(): Promise<void> {
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
  }

  async function iniciarEditando(): Promise<void> {
    configurar('5');
    fixture.detectChanges();
    http.expectOne(`${API}/especialidades`).flush(especialidades);
    http.expectOne(`${API}/servicios`).flush(servicios);
    http.expectOne({ method: 'GET', url: `${API}/reservas/mias` }).flush([reserva]);
    pedirMedicos(1).flush(medicosPediatria);
    await estabilizar();
  }

  function escribir(selector: string, valor: string): void {
    const control = el.querySelector<HTMLInputElement | HTMLSelectElement>(selector)!;
    control.value = valor;
    control.dispatchEvent(new Event('input', { bubbles: true }));
    control.dispatchEvent(new Event('change', { bubbles: true }));
  }

  afterEach(() => http.verify());

  it('editar: carga la reserva y llena el formulario con sus datos', async () => {
    await iniciarEditando();

    expect(el.querySelector('h1')!.textContent).toContain('Editar reserva #5');
    expect(el.querySelector<HTMLSelectElement>('#especialidad')!.value).toBe('1');
    expect(el.querySelector<HTMLSelectElement>('#medico')!.value).toBe('8');
    expect(el.querySelector<HTMLInputElement>('#fecha')!.value).toBe('2026-11-05');
    expect(el.querySelector<HTMLInputElement>('#fecha_inicio')!.value).toBe('09:00');
    expect(el.querySelector<HTMLInputElement>('#observaciones')!.value).toBe('Control mensual');
    expect(el.querySelector<HTMLInputElement>('input[type="checkbox"][id="1"]')!.checked).toBe(true);
    expect(el.querySelector<HTMLInputElement>('input[type="checkbox"][id="2"]')!.checked).toBe(false);
    expect(el.querySelector('button[type="submit"]')!.textContent).toContain('Guardar cambios');
  });

  it('editar: al guardar llama PUT /api/reservas/{id} con los datos cambiados y vuelve a Mis Reservas', async () => {
    await iniciarEditando();
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    escribir('#fecha_inicio', '14:30');
    escribir('#observaciones', 'Cambio de hora');
    await estabilizar();
    el.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await fixture.whenStable();

    const put = http.expectOne({ method: 'PUT', url: `${API}/reservas/5` });
    expect(put.request.body).toEqual({
      medico: { id: 8 },
      fecha: '2026-11-05',
      horaInicio: '14:30',
      observaciones: 'Cambio de hora',
      servicios: [{ id: 1 }],
    });
    put.flush({ ...reserva, horaInicio: '14:30:00' });
    await fixture.whenStable();

    expect(navegar).toHaveBeenCalledWith(['/mostrar-reservas']);
  });

  it('editar: si el backend rechaza el cambio muestra el mensaje y no sale de la página', async () => {
    await iniciarEditando();
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    el.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await fixture.whenStable();
    http.expectOne({ method: 'PUT', url: `${API}/reservas/5` })
      .flush({ error: 'El horario seleccionado ya está ocupado' }, { status: 409, statusText: 'Conflict' });
    await estabilizar();

    expect(el.querySelector('p[role="alert"]')!.textContent).toContain('El horario seleccionado ya está ocupado');
    expect(navegar).not.toHaveBeenCalled();
  });

  it('editar: si la reserva no es del usuario vuelve a Mis Reservas', async () => {
    configurar('99');
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
    http.expectOne(`${API}/especialidades`).flush(especialidades);
    http.expectOne(`${API}/servicios`).flush(servicios);
    http.expectOne({ method: 'GET', url: `${API}/reservas/mias` }).flush([reserva]);
    await estabilizar();

    expect(navegar).toHaveBeenCalledWith(['/mostrar-reservas']);
    expect(el.querySelector('h1')!.textContent).toContain('Nueva reserva');
  });

  it('editar: si no se pueden pedir las reservas (sin sesión) vuelve a Mis Reservas', async () => {
    configurar('5');
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
    http.expectOne(`${API}/especialidades`).flush(especialidades);
    http.expectOne(`${API}/servicios`).flush(servicios);
    http.expectOne({ method: 'GET', url: `${API}/reservas/mias` })
      .flush({ error: 'Debe primero iniciar sesión' }, { status: 401, statusText: 'Unauthorized' });
    await estabilizar();

    expect(navegar).toHaveBeenCalledWith(['/mostrar-reservas']);
  });

  it('nueva reserva: sin id no pide ninguna reserva y guarda con POST', async () => {
    configurar(null);
    fixture.detectChanges();
    http.expectOne(`${API}/especialidades`).flush(especialidades);
    http.expectOne(`${API}/servicios`).flush(servicios);
    await estabilizar();

    expect(el.querySelector('h1')!.textContent).toContain('Nueva reserva');
    expect(el.querySelector('button[type="submit"]')!.textContent).toContain('Guardar');

    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    escribir('#especialidad', '1');
    await estabilizar();
    pedirMedicos(1).flush(medicosPediatria);
    await estabilizar();
    escribir('#medico', '9');
    escribir('#fecha', '2026-12-01');
    escribir('#fecha_inicio', '08:00');
    escribir('#observaciones', 'Primera consulta');
    await estabilizar();
    el.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await fixture.whenStable();

    const post = http.expectOne({ method: 'POST', url: `${API}/reservas` });
    expect(post.request.body).toEqual({
      medico: { id: 9 },
      fecha: '2026-12-01',
      horaInicio: '08:00',
      observaciones: 'Primera consulta',
      servicios: [],
    });
    post.flush({ ...reserva, idReserva: 6, total: 70000 }, { status: 201, statusText: 'Created' });
    await fixture.whenStable();

    expect(navegar).toHaveBeenCalledWith(['/inicio']);
  });
});
