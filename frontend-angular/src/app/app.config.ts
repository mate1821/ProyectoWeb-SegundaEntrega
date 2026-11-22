import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { erroresInterceptor } from './interceptors/errores.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // erroresInterceptor: cookie de sesión en cada llamada y redirección al login con 401 (issue #19)
    provideHttpClient(withInterceptors([erroresInterceptor]))
  ]
};
