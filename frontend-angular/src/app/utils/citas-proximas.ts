import { Reserva } from '../models/reserva.model';

export function citasProximas(reservas: Reserva[], ahora = Date.now()): Reserva[] {
  return reservas
    .filter((reserva) => reserva.estado?.nombre === 'Confirmada')
    .map((reserva) => ({
      reserva,
      inicio: Date.parse(`${reserva.fecha}T${reserva.horaInicio.slice(0, 5)}:00-05:00`),
    }))
    .filter(({ inicio }) => inicio >= ahora)
    .sort((a, b) => a.inicio - b.inicio)
    .map(({ reserva }) => reserva);
}
