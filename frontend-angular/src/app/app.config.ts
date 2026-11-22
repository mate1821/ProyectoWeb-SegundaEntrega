import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEsCo from '@angular/common/locales/es-CO';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { erroresInterceptor } from './interceptors/errores.interceptor';
import { routes } from './app.routes';

// Formato colombiano para el pipe currency: $ 120.000 (issue #25)
registerLocaleData(localeEsCo);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    { provide: LOCALE_ID, useValue: 'es-CO' },
    // erroresInterceptor: cookie de sesión en cada llamada y redirección al login con 401 (issue #19)
    provideHttpClient(withInterceptors([erroresInterceptor]))
  ]
};
