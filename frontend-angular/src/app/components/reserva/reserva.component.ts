import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormField, FormRoot, form, maxLength, required } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { Reserva } from '../../models/reserva.model';
import { Usuario } from '../../models/usuario.model';
import { ReservaService } from '../../services/reserva.service';
import { UsuarioService } from '../../services/usuario.service';

// Mismos ids de rol que usa el DataLoader del backend
const ROL_MEDICO = 1;
const ROL_PACIENTE = 2;

// Los <select> trabajan con texto, por eso los ids del formulario son string
// y se convierten a número solo al armar la petición.
interface ReservaFormModel {
  pacienteId: string;
  medicoId: string;
  fecha: string;
  horaInicio: string;
  observaciones: string;
}

const FORMULARIO_VACIO: ReservaFormModel = {
  pacienteId: '',
  medicoId: '',
  fecha: '',
  horaInicio: '',
  observaciones: '',
};

@Component({
  imports: [FormField, FormRoot],
  selector: 'app-reserva',
  styleUrl: './reserva.component.css',
  templateUrl: './reserva.component.html',
})
export class ReservaComponent implements OnInit {
  private reservaService = inject(ReservaService);
  private usuarioService = inject(UsuarioService);

  reservas = signal<Reserva[]>([]);
  pacientes = signal<Usuario[]>([]);
  medicos = signal<Usuario[]>([]);
  mensaje = signal('');
  error = signal('');

  // Si es null el formulario crea una reserva (POST); si tiene un id, la edita (PUT)
  idEditando = signal<number | null>(null);

  private modelo = signal<ReservaFormModel>({ ...FORMULARIO_VACIO });

  formulario = form(
    this.modelo,
    (campos) => {
      required(campos.pacienteId, { message: 'Selecciona un paciente.' });
      required(campos.medicoId, { message: 'Selecciona un médico.' });
      required(campos.fecha, { message: 'Selecciona la fecha de la reserva.' });
      required(campos.horaInicio, { message: 'Selecciona la hora de inicio.' });
      maxLength(campos.observaciones, 255, { message: 'Máximo 255 caracteres.' });
    },
    {
      // Solo se ejecuta si el formulario es válido
      submission: { action: () => this.enviar() },
    },
  );

  ngOnInit(): void {
    this.cargarReservas();
    this.cargarUsuarios();
  }

  // GET /api/reservas
  cargarReservas(): void {
    this.reservaService.obtenerReservas().subscribe({
      next: (data) => this.reservas.set(data),
      error: (err: unknown) => this.mostrarError(err),
    });
  }

  // Solo para llenar los <select> de paciente y médico con lo que ya expone /api/usuarios
  private cargarUsuarios(): void {
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (usuarios) => {
        this.pacientes.set(usuarios.filter((u) => u.rol?.id === ROL_PACIENTE));
        this.medicos.set(usuarios.filter((u) => u.rol?.id === ROL_MEDICO));
      },
      error: (err: unknown) => this.mostrarError(err),
    });
  }

  // POST /api/reservas (reserva nueva) o PUT /api/reservas/{id} (si se está editando)
  private async enviar(): Promise<undefined> {
    this.limpiarMensajes();
    const datos = this.modelo();
    const reserva: Reserva = {
      usuario: { id: Number(datos.pacienteId) },
      medico: { id: Number(datos.medicoId) },
      fecha: datos.fecha,
      horaInicio: datos.horaInicio,
      observaciones: datos.observaciones,
    };

    const id = this.idEditando();
    try {
      await firstValueFrom(
        id === null
          ? this.reservaService.crearReserva(reserva)
          : this.reservaService.actualizarReserva(id, reserva),
      );
      this.mensaje.set(id === null ? 'Reserva creada correctamente.' : 'Reserva actualizada correctamente.');
      this.limpiarFormulario();
      this.cargarReservas();
    } catch (err: unknown) {
      this.mostrarError(err);
    }
    return undefined;
  }

  // Carga la fila en el formulario; al guardar se usará el PUT
  editar(reserva: Reserva): void {
    this.limpiarMensajes();
    this.idEditando.set(reserva.idReserva ?? null);
    this.formulario().reset({
      pacienteId: reserva.usuario ? String(reserva.usuario.id) : '',
      medicoId: reserva.medico ? String(reserva.medico.id) : '',
      fecha: reserva.fecha,
      horaInicio: reserva.horaInicio.substring(0, 5), // "09:00:00" -> "09:00"
      observaciones: reserva.observaciones ?? '',
    });
  }

  // DELETE /api/reservas/{id}
  cancelar(reserva: Reserva): void {
    if (reserva.idReserva === undefined) {
      return;
    }
    this.limpiarMensajes();
    this.reservaService.cancelarReserva(reserva.idReserva).subscribe({
      next: () => {
        this.mensaje.set(`Reserva #${reserva.idReserva} cancelada.`);
        this.cargarReservas();
      },
      error: (err: unknown) => this.mostrarError(err),
    });
  }

  limpiarFormulario(): void {
    this.idEditando.set(null);
    this.formulario().reset({ ...FORMULARIO_VACIO });
  }

  private limpiarMensajes(): void {
    this.mensaje.set('');
    this.error.set('');
  }

  // El backend responde {"error": "..."} en los errores de reservas
  private mostrarError(err: unknown): void {
    const cuerpo: unknown = err instanceof HttpErrorResponse ? err.error : null;
    if (typeof cuerpo === 'object' && cuerpo !== null && 'error' in cuerpo && typeof cuerpo.error === 'string') {
      this.error.set(cuerpo.error);
    } else {
      this.error.set('No se pudo completar la operación. Verifica que el backend esté encendido.');
    }
  }
}
