import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

const API = 'http://localhost:8090/api';

/**
 * Interceptor global de la API (issue #19). Pasa por aquí toda petición de HttpClient.
 *
 * 1. Agrega withCredentials a las llamadas al backend, para que siempre viaje la
 *    cookie de sesión (JSESSIONID). Si algún servicio la olvidaba, Spring Security
 *    respondía 401/403 y la pantalla quedaba sin datos.
 * 2. Si el backend responde 401 (sin sesión o sesión vencida), lleva al usuario a
 *    la pantalla de inicio de sesión con un aviso. El login se excluye porque ahí
 *    el 401 significa "correo o contraseña incorrectos".
 * 3. Vuelve a lanzar el error para que cada componente muestre su mensaje.
 */
export const erroresInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const esApi = req.url.startsWith(API);
  const peticion = esApi && !req.withCredentials ? req.clone({ withCredentials: true }) : req;

  return next(peticion).pipe(
    catchError((err: unknown) => {
      const esLogin = req.url.endsWith('/usuarios/login');
      if (esApi && !esLogin && err instanceof HttpErrorResponse && err.status === 401) {
        router.navigate(['/inicio-sesion'], { queryParams: { sesion: 'expirada' } });
      }
      return throwError(() => err);
    }),
  );
};
