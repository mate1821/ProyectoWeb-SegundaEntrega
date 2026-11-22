import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { MedicoService } from '../../services/medico.service';
import { EspecialidadService } from '../../services/especialidades.service';
import { MedicoDirectorio } from '../../models/medico-directorio.model';
import { Especialidad } from '../../models/especialidad.model';
import { FiltroEspecialidadPipe } from '../../pipes/filtro-especialidad.pipe';
import { FiltroBusquedaPipe } from '../../pipes/filtro-busqueda.pipe';
import { mensajeError } from '../../utils/mensaje-error';

/**
 * Issue #24: búsqueda de médicos por nombre de médico, nombre de espacio (clínica)
 * y especialidad. Ruta: /buscar/:id  (id = usuario que busca).
 *
 * El componente solo carga los datos una vez; el filtrado lo hacen los pipes
 * en la plantilla:
 *   medicos() | filtroEspecialidad: especialidadId() | filtroBusqueda: texto()
 * Así, "Pediatría" + "clínica shaio" combina los dos filtros.
 */
@Component({
  selector: 'app-buscar-medicos',
  imports: [FormsModule, RouterLink, FiltroEspecialidadPipe, FiltroBusquedaPipe],
  templateUrl: './buscar-medicos.component.html',
  styleUrl: './buscar-medicos.component.css',
})
export class BuscarMedicos implements OnInit {
  private route = inject(ActivatedRoute);
  private medicoService = inject(MedicoService);
  private especialidadService = inject(EspecialidadService);

  usuarioId = Number(this.route.snapshot.paramMap.get('id'));

  medicos = signal<MedicoDirectorio[]>([]);
  especialidades = signal<Especialidad[]>([]);
  cargando = signal(true);
  error = signal('');

  // Lo que escribe/elige el usuario (son los argumentos de los pipes)
  texto = signal(this.route.snapshot.queryParamMap.get('texto') ?? '');
  especialidadId = signal(this.route.snapshot.queryParamMap.get('especialidadId') ?? '');

  ngOnInit(): void {
    forkJoin({
      medicos: this.medicoService.obtenerDirectorio(),
      especialidades: this.especialidadService.obtenerEspecialidades(),
    }).subscribe({
      next: ({ medicos, especialidades }) => {
        this.medicos.set(medicos);
        this.especialidades.set(especialidades);
        this.cargando.set(false);
      },
      error: (err: unknown) => {
        this.cargando.set(false);
        this.error.set(mensajeError(err, 'No se pudo cargar el directorio de médicos.'));
      },
    });
  }

  limpiar(): void {
    this.texto.set('');
    this.especialidadId.set('');
  }
}
