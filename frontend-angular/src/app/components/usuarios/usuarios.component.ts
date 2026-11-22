import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario.model';
import { ChangeDetectorRef } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { mensajeError } from '../../utils/mensaje-error';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  idPorEliminar: number | null = null; // usuario que espera confirmación para eliminarse
  error = '';
  cargando = true;

  usuariosOriginales: Usuario[] = [];

  usuarioService=inject(UsuarioService);
  private cdr = inject(ChangeDetectorRef);

  filtroRol = new FormControl('');

  ngOnInit(): void {
    this.cargarUsuarios();
    this.configurarFiltro();
  }

  cargarUsuarios(): void {
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (data) => {
        this.cargando = false;
        this.usuarios = data;
        this.usuariosOriginales = data;
      this.cdr.detectChanges();}, // Esta cosa es un parche temporal porque no supe como hacer que refrescara
      error: (err: unknown) => {
        this.cargando = false;
        this.error = mensajeError(err, 'No se pudieron cargar los usuarios.');
        this.cdr.detectChanges();
      }
    });
  }

  activarUsuario(id: number | undefined): void {
    if (!id) return;
    this.error = '';
    this.usuarioService.activar(id).subscribe({
      next: () => {this.cargarUsuarios()},
      error: (err: unknown) => this.mostrarError(err, 'No se pudo activar el usuario.')
    });
  }

  desactivarUsuario(id: number | undefined): void {
    if (!id) return;
    this.error = '';
    this.usuarioService.desactivar(id).subscribe({
      next: () => {this.cargarUsuarios()}, 
      error: (err: unknown) => this.mostrarError(err, 'No se pudo desactivar el usuario.')

    });
  }

  pedirConfirmacion(id: number | undefined): void {
    if (!id) return;
    this.error = '';
    this.idPorEliminar = id;
  }

  cancelarEliminacion(): void {
    this.idPorEliminar = null;
  }

  // Llama a DELETE /api/usuarios/{id} y vuelve a cargar la lista
  eliminarUsuario(id: number | undefined): void {
    if (!id) return;
    this.usuarioService.eliminarUsuario(id).subscribe({
      next: () => {
        this.idPorEliminar = null;
        this.cargarUsuarios();
      },
      error: (err: HttpErrorResponse) => {
        this.idPorEliminar = null;
        this.error = mensajeError(err, 'No se pudo eliminar el usuario.');
        this.cdr.detectChanges();
      }
    });
  }

  private mostrarError(err: unknown, porDefecto: string): void {
    this.error = mensajeError(err, porDefecto);
    this.cdr.detectChanges();
  }


  paginaActual=1;
  usuariosPorPagina=5;

  //Funciones de paginación - Las intenté hacer idénticas a las que están en el documento
  get usuariosPagina() {
    const inicio = (this.paginaActual - 1) * this.usuariosPorPagina;
    const fin = inicio + this.usuariosPorPagina;
    return this.usuarios.slice(inicio, fin);
  }

  get totalPaginas() {
    return Math.ceil(this.usuarios.length / this.usuariosPorPagina);
  }

  siguiente() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
    }
  }

  anterior() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }

  //Para implementar la pipe, hago un filtro por rol:
  configurarFiltro(): void {
    this.filtroRol.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      map(rolId => {
        if (!rolId) {
          return this.usuariosOriginales; //Si no se le pone ID, se muestran todos
        }
        return this.usuariosOriginales.filter(u => { //Si hay id, entonces filtre todos los ussuarios y retorne el id usuario donde el id de rol sea el buscado
          return u.rol?.id == Number(rolId);
        });
      })
    ).subscribe({
      next: (filtrados) => {
        this.usuarios = filtrados;
        this.paginaActual = 1;
        this.cdr.detectChanges();
      }
    });
  }
}
