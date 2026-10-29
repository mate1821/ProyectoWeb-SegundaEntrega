import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  imports: [RouterLink],
  selector: 'app-inicio',
  styleUrl: './inicio.component.css',
  templateUrl: './inicio.component.html',
})
export class Inicio implements OnInit {

  private route = inject(ActivatedRoute);
  private usuarioService = inject(UsuarioService);

  usuarioId = Number(this.route.snapshot.paramMap.get('id'));
  nombreUsuario = signal('Usuario');

  ngOnInit(): void {
    this.usuarioService.buscarPorId(this.usuarioId).subscribe({
      next: (u) => this.nombreUsuario.set(u.nombre),
      error: (e) => console.error('No se pudo cargar el usuario', e)
    });
  }
}