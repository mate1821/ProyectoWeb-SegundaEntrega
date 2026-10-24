import { Routes } from '@angular/router';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { Registro } from './components/registro/registro.component';
import { InicioSesion } from './components/inicio-sesion/inicio-sesion.component';
import { Inicio } from './components/inicio/inicio.component';
import { ReservaComponent } from './components/reserva/reserva.component';

export const routes: Routes = [
  { path: 'inicio', component: Inicio },
  { path: 'reservas', component: ReservaComponent },
  { path: 'usuarios', component: UsuariosComponent },
  { path: 'registro', component: Registro },
  { path: 'inicio-sesion', component: InicioSesion },
];