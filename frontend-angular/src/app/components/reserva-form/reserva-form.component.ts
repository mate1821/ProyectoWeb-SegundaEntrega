import { Component, effect, input, output } from '@angular/core';
import { Reserva } from '../../models/reserva.model';
import { Medico } from '../../models/medico.model';
import { Especialidad } from '../../models/especialidad.model';
import { Servicio } from '../../models/servicio.model';
import { BotonPagarComponent } from '../../pagos/boton-pagar.component';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';

@Component({
  imports: [FormsModule, CurrencyPipe, BotonPagarComponent],
  selector: 'app-reserva-form',
  styleUrl: './reserva-form.component.css',
  templateUrl: './reserva-form.component.html',
})
export class ReservaComponent {
  especialidades = input<Especialidad[]>([]);
  medicos = input<Medico[]>([]);
  servicios = input<Servicio[]>([]);
  reservaEditando = input<Reserva | null>(null);
  preseleccion = input<{ especialidadId: number; medicoId: number } | null>(null);
  horasDisponibles = input<string[]>([]);

  especialidadCambiada = output<number>();
  reservaGuardada = output<Reserva>();
  diaCambiado = output<{ medicoId: number; fecha: string }>();

  especialidadId: string = '';
  medicoId: string = '';
  fecha: string = '';
  horaInicio: string = '';
  observaciones: string = '';
  servicioIds: number[] = [];

  fechaMinima: string = fechaDeHoy();

  constructor() {
    effect(() => {
      const reserva = this.reservaEditando();
      if (reserva) {
        this.cargarReserva(reserva);
      }
    });

    effect(() => {
      const elegido = this.preseleccion();
      if (elegido && !this.reservaEditando()) {
        this.especialidadId = String(elegido.especialidadId);
        this.medicoId = String(elegido.medicoId);
      }
    });
  }

  private cargarReserva(reserva: Reserva): void {
    this.especialidadId = reserva.medico?.especialidad ? String(reserva.medico.especialidad.id) : '';
    this.medicoId = reserva.medico ? String(reserva.medico.id) : '';
    this.fecha = reserva.fecha;
    this.horaInicio = reserva.horaInicio.substring(0, 5);
    this.observaciones = reserva.observaciones ?? '';
    this.servicioIds = (reserva.servicios ?? []).map((s) => s.id);
  }

  cambiarEspecialidad(valor: string): void {
    this.especialidadId = valor;
    this.medicoId = '';
    this.horaInicio = '';
    this.especialidadCambiada.emit(Number(valor));
  }

  cambiarMedico(valor: string): void {
    this.medicoId = valor;
    this.pedirHoras();
  }

  cambiarFecha(valor: string): void {
    this.fecha = valor;
    this.pedirHoras();
  }

  pedirHoras(): void {
    this.horaInicio = '';
    if (this.medicoId && this.fecha) {
      this.diaCambiado.emit({ medicoId: Number(this.medicoId), fecha: this.fecha });
    }
  }

  horaFin(h: string): string {
    const siguiente = Number(h.substring(0, 2)) + 1;
    return `${String(siguiente).padStart(2, '0')}:00`;
  }

  alternarServicio(id: number): void {
    if (this.servicioIds.includes(id)) {
      this.servicioIds = this.servicioIds.filter((x) => x !== id);
    } else {
      this.servicioIds = [...this.servicioIds, id];
    }
  }

  totalReserva(): number {
    const seleccionados = this.servicios().filter((s) => this.servicioIds.includes(s.id));
    const suma = seleccionados.reduce((acc, s) => acc + (s.costo ?? 0), 0);
    return suma > 0 ? suma : 15000;
  }

  prepararPago(): void {
    const borradorReserva: Reserva = {
      medico: { id: Number(this.medicoId) },
      fecha: this.fecha,
      horaInicio: this.horaInicio,
      observaciones: this.observaciones,
      servicios: this.servicioIds.map((id) => ({ id })),
    };
    sessionStorage.setItem('reservaPendiente', JSON.stringify(borradorReserva));
  }

  guardar(): void {
    const reserva: Reserva = {
      medico: { id: Number(this.medicoId) },
      fecha: this.fecha,
      horaInicio: this.horaInicio,
      observaciones: this.observaciones,
      servicios: this.servicioIds.map((id) => ({ id })),
    };
    this.reservaGuardada.emit(reserva);
  }
}

function fechaDeHoy(): string {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}