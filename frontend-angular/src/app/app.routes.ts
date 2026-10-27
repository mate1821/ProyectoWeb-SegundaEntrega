import { Routes } from '@angular/router';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { Registro } from './components/registro/registro.component';
import { InicioSesion } from './components/inicio-sesion/inicio-sesion.component';
import { Inicio } from './components/inicio/inicio.component';
import { Reservas } from './components/reservas/reservas.component';
import { MostrarReservas } from './components/mostrar-reservas/mostrar-reservas.component'; 
import { AdminComponent } from './components/admin/admin.component';

export const routes: Routes = [
  { path: 'inicio', component: Inicio },
  { path: 'reservas', component: Reservas },
  { path: 'reservas/editar/:id', component: Reservas },
  { path: 'usuarios', component: UsuariosComponent },
  { path: 'registro', component: Registro },
  { path: 'inicio-sesion', component: InicioSesion },
  { path: 'mostrar-reservas', component: MostrarReservas },
  { path: 'admin', component: AdminComponent },
];