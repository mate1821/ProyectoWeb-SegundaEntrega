import { Component } from '@angular/core';
import { Usuarios } from './components/usuarios/usuarios.component'; // Ajusta la ruta si está en otra carpeta

@Component({
  selector: 'app-root',
  imports: [Usuarios],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

}