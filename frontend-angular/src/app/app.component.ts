import { Component } from '@angular/core';
import { Usuarios } from './components/usuarios/usuarios.component'; // Ajusta la ruta si está en otra carpeta
import { InicioSesion } from './components/inicio-sesion/inicio-sesion.component';
import { Registro } from './components/registro/registro.component';

@Component({
  selector: 'app-root',
  imports: [Registro],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

}