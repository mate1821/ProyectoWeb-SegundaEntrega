import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UsuarioService } from './usuario.service';
import { Usuario } from '../models/usuario.model';

describe('UsuarioService', () => {
  const url = 'http://localhost:8090/api/usuarios';
  const usuario: Usuario = {
    id: 3,
    cedula: 123,
    nombre: 'Ana Torres',
    fecha_nacimiento: '1990-01-01',
    correo: 'ana@correo.com',
    contrasena: 'clave',
  };

  let service: UsuarioService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UsuarioService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('obtenerUsuarios hace GET /api/usuarios', () => {
    let recibidos: Usuario[] = [];
    service.obtenerUsuarios().subscribe((u) => (recibidos = u));

    const req = http.expectOne(url);
    expect(req.request.method).toBe('GET');
    req.flush([usuario]);

    expect(recibidos).toEqual([usuario]);
  });

  it('agregarUsuario hace POST /api/usuarios con el usuario en el cuerpo', () => {
    service.agregarUsuario(usuario).subscribe();

    const req = http.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(usuario);
    req.flush(usuario);
  });

  it('activar y desactivar hacen PUT a /activar/{id} y /desactivar/{id}', () => {
    service.activar(3).subscribe();
    const activar = http.expectOne(`${url}/activar/3`);
    expect(activar.request.method).toBe('PUT');
    activar.flush(null);

    service.desactivar(3).subscribe();
    const desactivar = http.expectOne(`${url}/desactivar/3`);
    expect(desactivar.request.method).toBe('PUT');
    desactivar.flush(null);
  });

  it('eliminarUsuario hace DELETE /api/usuarios/{id}', () => {
    service.eliminarUsuario(3).subscribe();

    const req = http.expectOne(`${url}/3`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
