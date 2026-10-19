import { Component, input, output } from '@angular/core';
import { Credenciales } from '../../models/credencial.model';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [FormsModule],
  selector: 'app-login-form',
  styleUrl: './login-form.component.css',
  templateUrl: './login-form.component.html',
})
export class LoginForm {
  correo: string="";
  contrasena: string="";
  titulo=input<string>('Iniciar sesion');

  loginEnviado=output<Credenciales>();

  enviarLogin() {

  this.loginEnviado.emit({
    correo: this.correo,
    contrasena: this.contrasena
  });

}


}
