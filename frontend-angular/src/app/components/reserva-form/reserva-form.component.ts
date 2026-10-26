import { Component, effect, inject, OnInit, signal,input,output } from '@angular/core';
import { Reserva } from '../../models/reserva.model';
import { Medico } from '../../models/medico.model';
import { Especialidad } from '../../models/especialidad.model';
import {Servicio} from '../../models/servicio.model'


import { FormsModule } from '@angular/forms';






@Component({
  imports: [FormsModule],
  selector: 'app-reserva-form',
  styleUrl: './reserva-form.component.css',
  templateUrl: './reserva-form.component.html',
})

export class ReservaComponent {



  especialidades = input<Especialidad[]>([]); 
  medicos = input<Medico[]>([]);             
  servicios = input<Servicio[]>([]); 
  reservaEditando = input<Reserva | null>(null); // si viene, el formulario se llena con sus datos
  mensaje = signal('');
  error = signal('');
  


  especialidadCambiada = output<number>();   
  reservaGuardada = output<Reserva>(); 

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
  }

  private cargarReserva(reserva: Reserva): void {
    this.especialidadId = reserva.medico?.especialidad ? String(reserva.medico.especialidad.id) : '';
    this.medicoId = reserva.medico ? String(reserva.medico.id) : '';
    this.fecha = reserva.fecha;
    this.horaInicio = reserva.horaInicio.substring(0, 5); // "09:00:00" -> "09:00"
    this.observaciones = reserva.observaciones ?? '';
    this.servicioIds = (reserva.servicios ?? []).map((s) => s.id);
  }


  cambiarEspecialidad(valor: string): void {
    this.especialidadId = valor;
    this.medicoId = '';
    this.especialidadCambiada.emit(Number(valor));
  }

  alternarServicio(id: number): void {
    if (this.servicioIds.includes(id)) {
      this.servicioIds = this.servicioIds.filter((x) => x !== id);
    } else {
      this.servicioIds = [...this.servicioIds, id];
    }
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




















































//   // ngOnInit(): void {

//   //   this.especialidades = 

//   // }



//   private reservaService = inject(ReservaService);
//   private usuarioService = inject(UsuarioService);


//   especialidades = input<Especialidad[]>([]);
//   medicos = input<Medico[]>([]);
//   servicios = input<Servicio[]>([]);
//   pacientes = input<Usuario[]>([]);
//   reservaEditando = input<Reserva | null>(null); 

//   especialidadCambiada = output<number>();     

//   pacienteId = signal<number | null>(null);
//   especialidadId = signal<number | null>(null);
//   medicoId = signal<number | null>(null);
//   fecha = signal('');
//   horaInicio = signal('');
//   observaciones = signal('');
//   serviciosSeleccionados = signal<number[]>([]);

































































//   // formulario = form(
//   //   this.modelo,
//   //   (campos) => {
//   //     required(campos.pacienteId, { message: 'Selecciona un paciente.' });
//   //     required(campos.medicoId, { message: 'Selecciona un médico.' });
//   //     required(campos.fecha, { message: 'Selecciona la fecha de la reserva.' });
//   //     required(campos.horaInicio, { message: 'Selecciona la hora de inicio.' });
//   //     maxLength(campos.observaciones, 255, { message: 'Máximo 255 caracteres.' });
//   //   },
//   //   {
//   //     // Solo se ejecuta si el formulario es válido
//   //     submission: { action: () => this.enviar() },
//   //   },
//   // );

//   // ngOnInit(): void {
//   //   this.cargarReservas();
//   //   this.cargarUsuarios();
//   // }

































//   // GET /api/reservas
//   cargarReservas(): void {
//     this.reservaService.obtenerReservas().subscribe({
//       next: (data) => this.reservas.set(data),
//       error: (err: unknown) => this.mostrarError(err),
//     });
//   }

//   // Solo para llenar los <select> de paciente y médico con lo que ya expone /api/usuarios
//   private cargarUsuarios(): void {
//     this.usuarioService.obtenerUsuarios().subscribe({
//       next: (usuarios) => {
//         this.pacientes.set(usuarios.filter((u) => u.rol?.id === ROL_PACIENTE));
//         this.medicos.set(usuarios.filter((u) => u.rol?.id === ROL_MEDICO));
//       },
//       error: (err: unknown) => this.mostrarError(err),
//     });
//   }

//   // POST /api/reservas (reserva nueva) o PUT /api/reservas/{id} (si se está editando)
//   private async enviar(): Promise<undefined> {
//     this.limpiarMensajes();
//     const datos = this.modelo();
//     const reserva: Reserva = {
//       usuario: { id: Number(datos.pacienteId) },
//       medico: { id: Number(datos.medicoId) },
//       fecha: datos.fecha,
//       horaInicio: datos.horaInicio,
//       observaciones: datos.observaciones,
//     };

//     const id = this.idEditando();
//     try {
//       await firstValueFrom(
//         id === null
//           ? this.reservaService.crearReserva(reserva)
//           : this.reservaService.actualizarReserva(id, reserva),
//       );
//       this.mensaje.set(id === null ? 'Reserva creada correctamente.' : 'Reserva actualizada correctamente.');
//       this.limpiarFormulario();
//       this.cargarReservas();
//     } catch (err: unknown) {
//       this.mostrarError(err);
//     }
//     return undefined;
//   }

//   // Carga la fila en el formulario; al guardar se usará el PUT
//   editar(reserva: Reserva): void {
//     this.limpiarMensajes();
//     this.idEditando.set(reserva.idReserva ?? null);
//     this.formulario().reset({
//       pacienteId: reserva.usuario ? String(reserva.usuario.id) : '',
//       medicoId: reserva.medico ? String(reserva.medico.id) : '',
//       fecha: reserva.fecha,
//       horaInicio: reserva.horaInicio.substring(0, 5), // "09:00:00" -> "09:00"
//       observaciones: reserva.observaciones ?? '',
//     });
//   }

//   // DELETE /api/reservas/{id}
//   cancelar(reserva: Reserva): void {
//     if (reserva.idReserva === undefined) {
//       return;
//     }
//     this.limpiarMensajes();
//     this.reservaService.cancelarReserva(reserva.idReserva).subscribe({
//       next: () => {
//         this.mensaje.set(`Reserva #${reserva.idReserva} cancelada.`);
//         this.cargarReservas();
//       },
//       error: (err: unknown) => this.mostrarError(err),
//     });
//   }

//   limpiarFormulario(): void {
//     this.idEditando.set(null);
//     this.formulario().reset({ ...FORMULARIO_VACIO });
//   }

//   private limpiarMensajes(): void {
//     this.mensaje.set('');
//     this.error.set('');
//   }

//   // El backend responde {"error": "..."} en los errores de reservas
//   private mostrarError(err: unknown): void {
//     const cuerpo: unknown = err instanceof HttpErrorResponse ? err.error : null;
//     if (typeof cuerpo === 'object' && cuerpo !== null && 'error' in cuerpo && typeof cuerpo.error === 'string') {
//       this.error.set(cuerpo.error);
//     } else {
//       this.error.set('No se pudo completar la operación. Verifica que el backend esté encendido.');
//     }
//   }
// }

