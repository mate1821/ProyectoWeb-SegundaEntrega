import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Reserva } from '../../models/reserva.model';
import { ReservaService } from '../../services/reserva.service';
import { UsuarioService } from '../../services/usuario.service';
import { mensajeError } from '../../utils/mensaje-error';

import { citasProximas } from '../../utils/citas-proximas';

@Component({
  imports: [DatePipe, RouterLink],
  selector: 'app-inicio',
  styleUrl: '../panel-agenda.css',
  templateUrl: './inicio.component.html',
})
export class Inicio implements OnInit {

  private route = inject(ActivatedRoute);
  private usuarioService = inject(UsuarioService);
  private reservaService = inject(ReservaService);

  usuarioId = Number(this.route.snapshot.paramMap.get('id'));
  nombreUsuario = signal('Usuario');
  error = signal('');
  proximaCita = signal<Reserva | null>(null);
  cargandoCita = signal(true);
  errorCita = signal('');

  ngOnInit(): void {
    this.usuarioService.buscarPorId(this.usuarioId).subscribe({
      next: (u) => this.nombreUsuario.set(u.nombre),
      error: (err: unknown) => this.error.set(mensajeError(err, 'No se pudo cargar tu información.'))
    });
    this.reservaService.obtenerMisReservas(this.usuarioId).subscribe({
      next: (reservas) => {
        const [siguiente] = citasProximas(reservas);
        this.proximaCita.set(siguiente ?? null);
        this.cargandoCita.set(false);
      },
      error: (err: unknown) => {
        this.errorCita.set(mensajeError(err, 'No pudimos consultar tu próxima cita.'));
        this.cargandoCita.set(false);
      },
    });
  }
}
