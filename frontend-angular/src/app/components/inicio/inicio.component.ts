import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-inicio',
  styleUrl: './inicio.component.css',
  templateUrl: './inicio.component.html',
})
export class Inicio {

  private location = inject(Location);

  nombreUsuario: string =
    (this.location.getState() as { nombre?: string } | null)?.nombre?.trim() || 'Usuario';

}