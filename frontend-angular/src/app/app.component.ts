import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { TemaService } from './services/tema.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend-gestion';
  private readonly router = inject(Router);
  private readonly temas = inject(TemaService);
  private readonly ruta = toSignal(
    this.router.events.pipe(
      filter(evento => evento instanceof NavigationEnd),
      map(evento => evento.urlAfterRedirects.split(/[?#]/)[0]),
    ),
    { initialValue: '/' },
  );
  readonly tema = computed(() =>
    ['/', '/inicio-sesion', '/registro'].includes(this.ruta()) ? null : this.temas.activo(),
  );
}
