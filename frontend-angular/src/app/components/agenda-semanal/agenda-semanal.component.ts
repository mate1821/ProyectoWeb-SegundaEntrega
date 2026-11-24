import { DatePipe } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { Reserva } from '../../models/reserva.model';

const fechaBogota = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' });

interface Bloque {
  cita: Reserva;
  inicio: number;
  fin: number;
  carril: number;
}

@Component({
  selector: 'app-agenda-semanal',
  imports: [DatePipe],
  templateUrl: './agenda-semanal.component.html',
  styleUrl: './agenda-semanal.component.css',
})
export class AgendaSemanal {
  readonly reservas = input.required<Reserva[]>();
  readonly hoy = fechaBogota.format(new Date());
  readonly lunes = signal(this.lunesActual());
  readonly citaSeleccionada = signal<Reserva | null>(null);

  readonly semana = computed(() => {
    const dias = Array.from({ length: 7 }, (_, i) => sumarDias(this.lunes(), i));
    const porFecha = new Map<string, Bloque[]>(dias.map(fecha => [fecha, []]));
    for (const cita of this.reservas()) {
      const bloques = porFecha.get(cita.fecha);
      if (!bloques || !/^\d{2}:\d{2}/.test(cita.horaInicio ?? '')) continue;
      const inicio = minutos(cita.horaInicio);
      const finRegistrado = cita.horaFin ? minutos(cita.horaFin) : inicio + 30;
      bloques.push({ cita, inicio, fin: Math.max(finRegistrado, inicio + 15), carril: 0 });
    }

    let horaInicial = 8;
    let horaFinal = 18;
    const columnas = dias.map(fecha => {
      const bloques = porFecha.get(fecha)!.sort((a, b) => a.inicio - b.inicio);
      const finales: number[] = [];
      for (const bloque of bloques) {
        const libre = finales.findIndex(fin => fin <= bloque.inicio);
        bloque.carril = libre === -1 ? finales.length : libre;
        finales[bloque.carril] = bloque.fin;
        horaInicial = Math.min(horaInicial, Math.floor(bloque.inicio / 60));
        horaFinal = Math.max(horaFinal, Math.ceil(bloque.fin / 60));
      }
      return { fecha, bloques, carriles: Math.max(finales.length, 1) };
    });

    return {
      dias: columnas,
      inicio: horaInicial * 60,
      horas: Array.from({ length: horaFinal - horaInicial }, (_, i) =>
        String(horaInicial + i).padStart(2, '0') + ':00'),
      total: columnas.reduce((total, dia) => total + dia.bloques.length, 0),
    };
  });

  moverSemana(delta: number): void {
    this.lunes.update(fecha => sumarDias(fecha, delta * 7));
  }

  volverAHoy(): void {
    this.lunes.set(this.lunesActual());
  }

  irAFecha(fecha: string): void {
    if (!fecha) return;
    const dia = new Date(fecha + 'T00:00:00Z').getUTCDay();
    this.lunes.set(sumarDias(fecha, -((dia + 6) % 7)));
  }

  abrirCita(cita: Reserva, dialogo: HTMLDialogElement): void {
    this.citaSeleccionada.set(cita);
    dialogo.showModal();
  }

  private lunesActual(): string {
    const dia = new Date(this.hoy + 'T00:00:00Z').getUTCDay();
    return sumarDias(this.hoy, -((dia + 6) % 7));
  }
}

function sumarDias(iso: string, dias: number): string {
  const fecha = new Date(iso + 'T00:00:00Z');
  fecha.setUTCDate(fecha.getUTCDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

function minutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}
