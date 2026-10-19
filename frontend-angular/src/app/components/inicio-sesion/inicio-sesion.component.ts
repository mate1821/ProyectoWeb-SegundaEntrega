import { Component } from '@angular/core';
import { LoginForm } from '../login-form/login-form.component';
import { Credenciales } from '../../models/credencial.model';

@Component({
  imports: [LoginForm],
  selector: 'app-inicio-sesion',
  styleUrl: './inicio-sesion.component.css',
  templateUrl: './inicio-sesion.component.html',
})
export class InicioSesion {
  procesarLogin(credenciales: Credenciales) {
    console.log('Credenciales recibidas en el padre:', credenciales);
  // AQUI DEBERIA IR LA VALIDACIÓN QUE TENEMOS AUNQUE POSTERIORMENTE DEBERIAMOS MEJORARLA

}

}
