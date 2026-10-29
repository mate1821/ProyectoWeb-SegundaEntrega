import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ReservaService } from './reserva.service';
import { Reserva } from '../models/reserva.model';

describe('ReservaService', () => {
  const url = 'http://localhost:8090/api/reservas';
  const reserva: Reserva = {
    usuario: { id: 2 },
    medico: { id: 8 },
    fecha: '2026-11-05',
    horaInicio: '09:00',
    observaciones: 'Control',
  };

  let service: ReservaService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ReservaService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('obtenerReservas hace GET /api/reservas', () => {
    let recibidas: Reserva[] = [];
    service.obtenerReservas().subscribe((r) => (recibidas = r));

    const req = http.expectOne(url);
    expect(req.request.method).toBe('GET');
    req.flush([{ ...reserva, idReserva: 1 }]);

    expect(recibidas.length).toBe(1);
    expect(recibidas[0].idReserva).toBe(1);
  });

  it('crearReserva hace POST /api/reservas con la reserva en el cuerpo', () => {
    service.crearReserva(reserva).subscribe();

    const req = http.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(reserva);
    req.flush({ ...reserva, idReserva: 1 }, { status: 201, statusText: 'Created' });
  });

  it('actualizarReserva hace PUT /api/reservas/{id} con la reserva en el cuerpo', () => {
    service.actualizarReserva(5, reserva).subscribe();

    const req = http.expectOne(`${url}/5`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(reserva);
    req.flush({ ...reserva, idReserva: 5 });
  });

  it('cancelarReserva hace DELETE /api/reservas/{id}', () => {
    service.cancelarReserva(5).subscribe();

    const req = http.expectOne(`${url}/5`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
