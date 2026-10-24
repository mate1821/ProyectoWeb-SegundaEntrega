import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { UsuariosComponent } from './usuarios.component';
import { Usuario } from '../../models/usuario.model';

/** Prueba el borrado desde la lista de usuarios: llama a DELETE /api/usuarios/{id}. */
describe('UsuariosComponent', () => {
  const URL_USUARIOS = 'http://localhost:8090/api/usuarios';

  const usuarios: Usuario[] = [
    { id: 1, cedula: 1, nombre: 'Ana Torres', fecha_nacimiento: '1990-01-01', correo: 'ana@correo.com', contrasena: 'x', activo: true, rol: { id: 2, nombre: 'Paciente' } },
    { id: 2, cedula: 2, nombre: 'Luis Pérez', fecha_nacimiento: '1985-05-05', correo: 'luis@correo.com', contrasena: 'x', activo: false, rol: { id: 2, nombre: 'Paciente' } },
  ];

  let fixture: ComponentFixture<UsuariosComponent>;
  let http: HttpTestingController;
  let el: HTMLElement;

  async function iniciar(): Promise<void> {
    fixture.detectChanges();
    http.expectOne({ method: 'GET', url: URL_USUARIOS }).flush(usuarios);
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function boton(texto: string, fila = 0): HTMLButtonElement {
    const celdas = el.querySelectorAll('tbody tr')[fila];
    return Array.from(celdas.querySelectorAll<HTMLButtonElement>('button'))
      .find((b) => b.textContent?.trim() === texto)!;
  }

  async function clic(b: HTMLButtonElement): Promise<void> {
    b.click();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuariosComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(UsuariosComponent);
    http = TestBed.inject(HttpTestingController);
    el = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => http.verify());

  it('GET: al iniciar muestra los usuarios', async () => {
    await iniciar();

    expect(el.querySelectorAll('tbody tr').length).toBe(2);
    expect(el.querySelector('tbody')!.textContent).toContain('Ana Torres');
  });

  it('DELETE: pide confirmación y luego llama DELETE /api/usuarios/{id} y recarga la lista', async () => {
    await iniciar();

    await clic(boton('Eliminar', 0));
    http.expectNone({ method: 'DELETE', url: `${URL_USUARIOS}/1` }); // todavía no se borra
    expect(el.textContent).toContain('¿Eliminar a Ana Torres?');

    await clic(boton('Sí, eliminar', 0));
    http.expectOne({ method: 'DELETE', url: `${URL_USUARIOS}/1` })
      .flush(null, { status: 204, statusText: 'No Content' });
    await fixture.whenStable();

    http.expectOne({ method: 'GET', url: URL_USUARIOS }).flush([usuarios[1]]);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(el.querySelectorAll('tbody tr').length).toBe(1);
    expect(el.querySelector('tbody')!.textContent).not.toContain('Ana Torres');
  });

  it('DELETE: si se responde "No" no llama al backend', async () => {
    await iniciar();

    await clic(boton('Eliminar', 0));
    await clic(boton('No', 0));

    http.expectNone({ method: 'DELETE', url: `${URL_USUARIOS}/1` });
    expect(boton('Eliminar', 0)).toBeTruthy();
  });

  it('DELETE: muestra el mensaje del backend cuando el usuario tiene reservas (409)', async () => {
    await iniciar();

    await clic(boton('Eliminar', 1));
    await clic(boton('Sí, eliminar', 1));
    http.expectOne({ method: 'DELETE', url: `${URL_USUARIOS}/2` })
      .flush({ error: 'No se puede eliminar: tiene reservas asociadas' }, { status: 409, statusText: 'Conflict' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.error).toBe('No se puede eliminar: tiene reservas asociadas');
    expect(el.querySelector('p[role="alert"]')!.textContent).toContain('tiene reservas asociadas');
    expect(el.querySelectorAll('tbody tr').length).toBe(2); // la lista no cambia
  });
});
