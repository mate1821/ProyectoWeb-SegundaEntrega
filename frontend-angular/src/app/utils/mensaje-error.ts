import { HttpErrorResponse } from '@angular/common/http';

/**
 * Convierte cualquier error HTTP en un mensaje para mostrar al usuario (issue #19).
 *
 * 1. Si el backend mandó {"error": "..."} se usa ese mensaje (es el formato de
 *    ApiExceptionHandler y ManejadorErroresSeguridad en Spring Boot).
 * 2. Si no, se arma un mensaje según el código HTTP.
 * 3. Si tampoco aplica, se usa el mensaje por defecto que pasa el componente.
 */
export function mensajeError(err: unknown, porDefecto = 'No se pudo completar la operación.'): string {
  if (!(err instanceof HttpErrorResponse)) {
    return porDefecto;
  }

  const cuerpo: unknown = err.error;
  if (typeof cuerpo === 'object' && cuerpo !== null && 'error' in cuerpo && typeof cuerpo.error === 'string') {
    return cuerpo.error;
  }

  switch (err.status) {
    case 0:
      return 'No hay conexión con el servidor. Verifica que el backend esté encendido.';
    case 400:
      return 'Los datos enviados no son válidos.';
    case 401:
      return 'Debes iniciar sesión para acceder a esta información.';
    case 403:
      return 'No tienes permisos para realizar esta acción.';
    case 404:
      return 'No se encontró la información solicitada.';
    case 409:
      return 'La operación entra en conflicto con datos existentes.';
    default:
      return err.status >= 500
        ? 'Ocurrió un error en el servidor. Intenta de nuevo más tarde.'
        : porDefecto;
  }
}
