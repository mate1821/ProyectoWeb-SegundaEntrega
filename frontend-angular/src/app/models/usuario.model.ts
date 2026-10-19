import { Rol } from "./rol.model";

export interface Usuario {
  id?: number;
  cedula: number;
  nombre: string;
  fecha_nacimiento: string | Date;
  antecedentes?: string;
  correo: string;
  rol?: Rol;
  telefono?: string;
  activo?: boolean;
  contrasena: string;
  fechaRegistro?: string | Date;
}