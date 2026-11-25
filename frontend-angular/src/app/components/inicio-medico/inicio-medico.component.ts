import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AgendaSemanal } from '../agenda-semanal/agenda-semanal.component';
import { Reserva } from '../../models/reserva.model';
import { ReservaService } from '../../services/reserva.service';
import { citasProximas } from '../../utils/citas-proximas';
import { UsuarioService } from '../../services/usuario.service';
import { mensajeError } from '../../utils/mensaje-error';

@Component({
  imports: [AgendaSemanal, RouterLink],
  selector: 'app-inicio-medico',
  styleUrls: ['../panel-agenda.css', './inicio-medico.component.css'],
  templateUrl: './inicio-medico.component.html',
})
export class InicioMedico implements OnInit {
  private route = inject(ActivatedRoute);
  private usuarioService = inject(UsuarioService);

  private reservaService = inject(ReservaService);

  medicoId = Number(this.route.snapshot.paramMap.get('id'));
  nombre = signal('Doctor');
  error = signal('');
  agenda = signal<{ reservas: Reserva[]; proximas: number } | null>(null);
  errorAgenda = signal('');

  ngOnInit(): void {
    this.usuarioService.buscarPorId(this.medicoId).subscribe({
      next: (u) => this.nombre.set(u.nombre),
      error: (err: unknown) => this.error.set(mensajeError(err, 'No se pudo cargar tu información.'))
    });
    this.reservaService.obtenerReservasMedico(this.medicoId).subscribe({
      next: (reservas) => this.agenda.set({ reservas, proximas: citasProximas(reservas).length }),
      error: (err: unknown) => this.errorAgenda.set(mensajeError(err, 'No pudimos consultar tu agenda.')),
    });
  }
}
