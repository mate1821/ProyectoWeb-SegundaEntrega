import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario.model';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];

  usuarioService=inject(UsuarioService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.cargarUsuarios();
    console.log("HOLA SE SUPONE QUE CARGUE LOS USUARIOS")
  }

  cargarUsuarios(): void {
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (data) => { console.log("esta llegando esto:", data);
        this.usuarios = data;
      this.cdr.detectChanges();}, // Esta cosa es un parche temporal porque no supe como hacer que refrescara
      error: (err) => {console.error('Error al cargar usuarios:', err);}
    });
  }

  activarUsuario(id: number | undefined): void {
    if (!id) return;
    this.usuarioService.activar(id).subscribe({
      next: () => {this.cargarUsuarios()},
      error: (err) => {console.error('Error al activar:', err)}
    });
  }

  desactivarUsuario(id: number | undefined): void {
    if (!id) return;
    this.usuarioService.desactivar(id).subscribe({
      next: () => {this.cargarUsuarios()}, 
      error: (err) => {console.error('Error al desactivar:', err)}

    });
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
}