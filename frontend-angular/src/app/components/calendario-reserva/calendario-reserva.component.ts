import { Component, computed, input, linkedSignal, output } from '@angular/core';

const mesEnEspanol = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' });
const diaEnEspanol = new Intl.DateTimeFormat('es-CO', { dateStyle: 'full' });

@Component({
  selector: 'app-calendario-reserva',
  templateUrl: './calendario-reserva.component.html',
  styleUrl: './calendario-reserva.component.css',
})
export class CalendarioReserva {
  readonly fecha = input.required<string>();
  readonly minima = input.required<string>();
  readonly fechaElegida = output<string>();
  readonly semana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  private readonly mes = linkedSignal(() => {
    const base = this.fecha() >= this.minima() ? this.fecha() : this.minima();
    const [anio, mes] = base.split('-').map(Number);
    return new Date(anio, mes - 1, 1);
  });

  readonly titulo = computed(() => mesEnEspanol.format(this.mes()));
  readonly puedeRetroceder = computed(() => isoLocal(this.mes()).slice(0, 7) > this.minima().slice(0, 7));

  readonly dias = computed(() => {
    const mes = this.mes();
    const desplazamiento = (mes.getDay() + 6) % 7;
    const ultimoDia = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
    return Array.from({ length: Math.ceil((desplazamiento + ultimoDia) / 7) * 7 }, (_, indice) => {
      const fecha = new Date(mes.getFullYear(), mes.getMonth(), indice - desplazamiento + 1);
      const iso = isoLocal(fecha);
      const delMes = fecha.getMonth() === mes.getMonth();
      return { iso, delMes, numero: fecha.getDate(), etiqueta: diaEnEspanol.format(fecha) };
    });
  });

  desplazarMes(delta: number): void {
    const mes = this.mes();
    this.mes.set(new Date(mes.getFullYear(), mes.getMonth() + delta, 1));
  }
}

function isoLocal(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}
