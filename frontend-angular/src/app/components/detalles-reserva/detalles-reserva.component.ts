import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CurrencyPipe, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ReservaService } from '../../services/reserva.service';
import { EspacioService } from '../../services/espacio.service';
import { CalificacionService } from '../../services/calificacion.service';
import { Reserva } from '../../models/reserva.model';
import { EstadoCalificaciones, TipoCalificacion } from '../../models/calificacion.model';
import { mensajeError } from '../../utils/mensaje-error';

@Component({
  imports: [CurrencyPipe, FormsModule],
  selector: 'app-detalles-reserva',
  styleUrl: './detalles-reserva.component.css',
  templateUrl: './detalles-reserva.component.html',
})
export class DetallesReserva implements OnInit {
  route = inject(ActivatedRoute)
  location = inject(Location)
  reservaService = inject(ReservaService)
  espacioService = inject(EspacioService)
  calificacionService = inject(CalificacionService)
  sanitizer = inject(DomSanitizer)

  reserva = signal<Reserva | null>(null);
  fotoUrl = signal<string | null>(null);
  sinFoto = signal(false);

  calificaciones = signal<EstadoCalificaciones>({ medico: false, espacio: false });
  calificando = signal<TipoCalificacion | null>(null); 
  enviando = signal(false);
  mensaje = signal('');
  error = signal('');
  puntuacion = 5;   
  comentario = '';  

  private idRuta = Number(this.route.snapshot.paramMap.get('id'));

  citaTerminada = computed(() => {
    const r = this.reserva();
    if (!r || !r.horaFin) {
      return false;
    }
    const fin = new Date(`${r.fecha}T${r.horaFin}`); // "2026-11-21T08:00:00"
    return Date.now() > fin.getTime();
  });

  citaCancelada = computed(() => this.reserva()?.estado?.nombre === 'Cancelada');

  // Mapa de OpenStreetMap centrado en el espacio (sin librerías ni API key)
  mapaUrl = computed<SafeResourceUrl | null>(() => {
    const e = this.reserva()?.medico?.espacio;
    if (!e?.latitud || !e?.longitud) {
      return null;
    }
    const d = 0.002; 
    const bbox = `${e.longitud - d},${e.latitud - d},${e.longitud + d},${e.latitud + d}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${e.latitud},${e.longitud}`
    );
  });

  ngOnInit(): void {
    this.reservaService.obtenerReserva(this.idRuta).subscribe({
      next: (data) => {
        this.reserva.set(data);
        this.cargarCalificaciones();
        const espacioId = data.medico?.espacio?.id;
        if (espacioId !== undefined) {
          this.cargarFoto(espacioId);
        }
      },
      error: (err: unknown) => this.error.set(mensajeError(err, 'No se pudo cargar la reserva.')),
    });
  }

  private cargarFoto(espacioId: number): void {
    this.espacioService.obtenerFoto(espacioId).subscribe({
      next: (data) => this.fotoUrl.set(data.url),
      error: () => this.sinFoto.set(true),
    });
  }

  // Pregunta al backend si ya calificó al médico / al espacio (para apagar los botones)
  private cargarCalificaciones(): void {
    this.calificacionService.obtenerEstado(this.idRuta).subscribe({
      next: (data) => this.calificaciones.set(data),
    });
  }

  calificarMedico(): void {
    this.abrirFormulario('medico');
  }

  calificarEspacio(): void {
    this.abrirFormulario('espacio');
  }

  private abrirFormulario(tipo: TipoCalificacion): void {
    this.puntuacion = 5;
    this.comentario = '';
    this.mensaje.set('');
    this.error.set('');
    this.calificando.set(tipo);
  }

  cancelarCalificacion(): void {
    this.calificando.set(null);
  }

  enviarCalificacion(): void {
    const tipo = this.calificando();
    if (!tipo) {
      return;
    }
    this.enviando.set(true);
    this.error.set('');
    this.calificacionService
      .calificar(this.idRuta, tipo, { puntuacion: this.puntuacion, comentario: this.comentario })
      .subscribe({
        next: () => {
          // Se marca como calificado para que el botón quede apagado
          this.calificaciones.update((c) => ({ ...c, [tipo]: true }));
          this.mensaje.set(tipo === 'medico' ? '¡Gracias! Calificaste al médico.' : '¡Gracias! Calificaste el espacio.');
          this.calificando.set(null);
          this.enviando.set(false);
        },
        error: (err: unknown) => {
          this.mostrarError(err);
          this.enviando.set(false);
        },
      });
  }

  private mostrarError(err: unknown): void {
    this.error.set(mensajeError(err, 'No se pudo guardar la calificación.'));
  }

  // Vuelve a la página anterior (sirve para paciente y médico)
  volver(): void {
    this.location.back();
  }
}