import { Injectable, signal } from '@angular/core';

type Tema = 'paciente' | 'medico' | 'administrador';

@Injectable({ providedIn: 'root' })
export class TemaService {
  private readonly clave = 'reservas-tema';
  private readonly tema = signal(this.leerTema());
  readonly activo = this.tema.asReadonly();

  aplicar(rol: string | undefined): void {
    const tema = this.normalizar(rol);
    this.tema.set(tema);
    try {
      if (tema) {
        globalThis.sessionStorage?.setItem(this.clave, tema);
      } else {
        globalThis.sessionStorage?.removeItem(this.clave);
      }
    } catch {
      // El tema sigue disponible en memoria si el navegador bloquea el almacenamiento.
    }
  }

  private normalizar(rol: string | null | undefined): Tema | null {
    switch (rol?.trim().toLowerCase()) {
      case 'paciente': return 'paciente';
      case 'medico':
      case 'médico': return 'medico';
      case 'administrador': return 'administrador';
      default: return null;
    }
  }

  private leerTema(): Tema | null {
    try {
      return this.normalizar(globalThis.sessionStorage?.getItem(this.clave));
    } catch {
      return null;
    }
  }
}
