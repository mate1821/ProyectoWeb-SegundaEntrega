import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  imports: [RouterLink],
  selector: 'app-inicio-medico',
  templateUrl: './inicio-medico.component.html',
})
export class InicioMedico implements OnInit {
  private route = inject(ActivatedRoute);
  private usuarioService = inject(UsuarioService);

  medicoId = Number(this.route.snapshot.paramMap.get('id'));
  nombre = signal('Doctor');

  ngOnInit(): void {
    this.usuarioService.buscarPorId(this.medicoId).subscribe({
      next: (u) => this.nombre.set(u.nombre),
      error: (e) => console.error('No se pudo cargar el médico', e)
    });
  }
}