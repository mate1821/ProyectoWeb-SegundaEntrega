import { Routes } from '@angular/router';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { Registro } from './components/registro/registro.component';
import { InicioSesion } from './components/inicio-sesion/inicio-sesion.component';
import { Inicio } from './components/inicio/inicio.component';
import { Reservas } from './components/reservas/reservas.component';
import { MostrarReservas } from './components/mostrar-reservas/mostrar-reservas.component';
import { AdminComponent } from './components/admin/admin.component';
import { InicioMedico } from './components/inicio-medico/inicio-medico.component';
import { Bienvenida } from './components/bienvenida/bienvenida.component';

export const routes: Routes = [


  { path: '', component: Bienvenida },
  { path: 'inicio/:id', component: Inicio },
  { path: 'inicio-medico/:id', component: InicioMedico },
  { path: 'reservas/:id', component: Reservas },                                 // crear (id = usuario)
  { path: 'reservas/editar/:id', component: Reservas, data: { editar: true } },  // editar (id = reserva)
  { path: 'mostrar-reservas/:id', component: MostrarReservas },                  // paciente
  { path: 'reservas-medico/:id', component: MostrarReservas, data: { rol: 'medico' } },
  { path: 'usuarios', component: UsuariosComponent },
  { path: 'registro', component: Registro },
  { path: 'inicio-sesion', component: InicioSesion },
  { path: 'admin', component: AdminComponent }
];