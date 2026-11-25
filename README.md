# Cambios de Rafa – última entrega

Rama: **`cambios-rafa-ultima-entrega`** (sale de `calificaciones`, ya incluye el commit #26 de Samuel).

Aquí resumo lo que hice para esta entrega, cómo correr el proyecto y cómo probar cada cosa.

| Issue | Qué es | Commit |
|---|---|---|
| #19 | Corregir manejo de errores (Angular + Spring Boot + Spring Security) | `1bcdaee` |
| #24 | Búsqueda por médico, especialidad y espacio (con pipes) | `8d1aafb` |
| #25 | Estilos de las pantallas nuevas | `7e9daae` |

---

## 1. Cómo correr el proyecto

### Requisitos

- **Java 25** (el `pom.xml` usa `java.version` 25).
- **Node.js 22 o superior** y **npm**.
- No hace falta instalar Maven: el repo trae el wrapper (`mvnw` / `mvnw.cmd`) en la raíz.

### Paso 1: bajar la rama

```bash
git fetch origin
git checkout cambios-rafa-ultima-entrega
git pull
```

### Paso 2: crear el archivo `backend/.env`

El backend lee la contraseña de Supabase desde un archivo `.env` que **no se sube a GitHub** (está en el `.gitignore`). Créenlo dentro de la carpeta `backend/` con este contenido:

```properties
spring.datasource.password=LA_CONTRASEÑA_DE_SUPABASE
PORT=8090
```

> ⚠️ **Importante – `PORT=8090`:** el commit #26 agregó `server.port=${PORT:8080}` al final de `application.properties` para desplegar en Render. Esa línea reemplaza a `server.port=8090`, así que si no definen `PORT` el backend sube en el **8080**, pero Angular lo busca en el **8090** y nada carga. Con `PORT=8090` en el `.env` se arregla en local sin tocar la configuración de Render.

### Paso 3: levantar el backend

Desde la **raíz** del repo:

```bash
# Git Bash / Linux / macOS
./mvnw -f backend/pom.xml spring-boot:run

# PowerShell / CMD
.\mvnw.cmd -f backend/pom.xml spring-boot:run
```

Queda en `http://localhost:8090`. La documentación de la API (Swagger) queda en `http://localhost:8090/swagger-ui.html`.

### Paso 4: levantar el frontend

En otra terminal:

```bash
cd frontend-angular
npm install
npx ng serve
```

Abrir `http://localhost:4200`.

---

## 2. Issue #19 – Manejo de errores

### El problema

- Spring Security respondía **403 "Forbidden"** para todo: tanto si el usuario no había iniciado sesión como si no tenía permiso. Como no hay `formLogin` ni `httpBasic`, Spring usa por defecto un *entry point* que siempre devuelve 403.
- `activar` / `desactivar` usuario mandaban `{ withCredentials: true }` como **cuerpo** del PUT y no como opciones, así que la cookie de sesión no viajaba y siempre fallaba.
- La pantalla de **Registro** llamaba a `GET /api/usuarios`, que es solo para ADMIN, y quien se registra no tiene sesión. Además el formulario no podía cargar especialidades ni espacios sin sesión.
- `GlobalHandlerException` (pensado para Thymeleaf) le devolvía **páginas HTML** a Angular. Por ejemplo, un usuario duplicado devolvía HTML en vez de un error JSON.
- Varias pantallas solo hacían `console.error`: el usuario no veía nada o se quedaba en "Cargando..." para siempre.

### Lo que hice en el backend

| Archivo | Qué hace |
|---|---|
| `seguridad/ManejadorErroresSeguridad.java` (nuevo) | Responde **401** "Debes iniciar sesión…" cuando no hay sesión y **403** "No tienes permisos…" cuando el rol no alcanza. Está registrado en `SecurityConfig` con `.exceptionHandling(...)`. |
| `errors/ApiExceptionHandler.java` (nuevo) | `@RestControllerAdvice` para todos los `@RestController`. Cada excepción tiene su código HTTP (usuario duplicado → 409, reserva no encontrada → 404, JSON mal formado → 400, error inesperado → 500 sin mostrar detalles técnicos). |
| `errors/RespuestaError.java` (nuevo) | Formato único de error: `{ "error": "mensaje", "estado": 403, "fecha": "..." }`. |
| `errors/GlobalHandlerException.java` | Ahora solo aplica a los controladores Thymeleaf. Corregí el nombre de la plantilla `horarioNoDisponible`, que estaba mal escrito. |
| `controllers/IndexRestController.java` (login) | Errores en JSON, mensaje propio si la cuenta está desactivada y validación de campos vacíos. |
| `seguridad/SecurityConfig.java` | `GET /api/especialidades/**` y `GET /api/espacios/**` quedan **públicos**, porque el formulario de registro los necesita antes de iniciar sesión. |

### Lo que hice en el frontend

| Archivo | Qué hace |
|---|---|
| `interceptors/errores.interceptor.ts` (nuevo) | Pasa por todas las peticiones: agrega `withCredentials` a toda llamada al backend y, si llega un **401**, lleva al login con el aviso "Tu sesión no está activa o expiró". |
| `utils/mensaje-error.ts` (nuevo) | `mensajeError(err)` devuelve el mensaje que manda el backend o uno según el código HTTP. Lo usan todas las pantallas. |
| `app.config.ts` | Registra el interceptor. |
| `services/usuario.service.ts` | Corrige el bug de `activar` / `desactivar`. |
| Componentes | Inicio, inicio médico, usuarios, registro, login, formulario de usuario, admin, detalles y mis reservas ahora **muestran el error en pantalla**. |

### Cómo probarlo

1. Iniciar sesión con una contraseña incorrecta → "Correo o contraseña incorrectos."
2. Entrar a `http://localhost:4200/usuarios` sin sesión → redirige al login con el aviso de sesión.
3. Registrar un usuario con un correo que ya existe → aparece el mensaje del backend.
4. Como admin, activar y desactivar un usuario en la pantalla de usuarios → ya funciona.
5. Apagar el backend y recargar cualquier pantalla → "No hay conexión con el servidor…"

---

## 3. Issue #24 – Búsqueda por médico, especialidad y espacio

### Lo que hice

- **Nueva opción en el inicio del paciente:** "Buscar médico o clínica", que abre `/buscar/:id`.
- **Barra de búsqueda** para escribir el nombre de un médico o de una clínica, con un **desplegable de especialidad** al lado. Los dos filtros se combinan: "Pediatría" + "clínica shaio" muestra solo los pediatras de la Shaio.
- **Pipes**, como pide el issue. Son dos pipes propios y se aplican en cadena en la plantilla:

  ```html
  @let resultados = medicos() | filtroEspecialidad: especialidadId() | filtroBusqueda: texto();
  ```

  - `pipes/filtro-especialidad.pipe.ts`: deja solo los médicos de la especialidad elegida.
  - `pipes/filtro-busqueda.pipe.ts`: busca el texto en el nombre del médico y del espacio. No distingue mayúsculas ni tildes ("clinica shaio" encuentra "Clínica Shaio"), y cada palabra puede estar en cualquiera de los dos campos ("shaio laura" encuentra a Laura en la Shaio).
  - `pipes/normalizar.ts`: función que quita tildes y pasa a minúscula.
  - Son pipes **puros**: Angular solo los vuelve a ejecutar cuando cambia la lista o lo que escribe el usuario.
- **Botón "Reservar"** en cada resultado: abre el formulario de cita con la **especialidad y el médico ya seleccionados**, usando query params `?especialidadId=3&medicoId=8`.
- **Backend:** nuevo endpoint `GET /api/medicos/directorio` en `MedicoRestController`. Devuelve cada médico activo con su especialidad y su espacio. No envía cédula, correo ni contraseña.

### Archivos

- `components/buscar-medicos/` (pantalla nueva: `.ts`, `.html`, `.css`)
- `pipes/` (los dos pipes y `normalizar.ts`)
- `models/medico-directorio.model.ts`
- `services/medico.service.ts` → `obtenerDirectorio()`
- `app.routes.ts` → ruta `buscar/:id`
- `components/inicio/inicio.component.html` → botón nuevo
- `components/reservas/` y `components/reserva-form/` → preselección del médico (`input` `preseleccion`)

### Cómo probarlo

1. Iniciar sesión como paciente → "Buscar médico o clínica".
2. Escribir parte del nombre de una clínica y luego elegir una especialidad → la lista se filtra con las dos cosas.
3. "Reservar" en un resultado → el formulario abre con la especialidad y el médico ya elegidos.

---

## 4. Issue #25 – Estilos

Mantuve el sistema de diseño que hizo Juan (`design-system.css`: colores sobrios y un tono por rol: verde azulado para el paciente, azul para el médico y morado para el admin) y ajusté las pantallas que faltaban:

- **Detalle de la reserva:** antes era una lista de párrafos sueltos. Ahora está en tarjetas (Cita, Lugar de la cita, Costos, Calificar), con el estado como etiqueta de color y el mapa y la foto lado a lado. Si la foto no carga, aparece "Este espacio no tiene foto" en vez del ícono roto.
- **Costos:** desglose de la consulta y de cada servicio, con el total resaltado.
- **Mis reservas:**
  - Precios con formato (`$ 120.000`) y horario en una sola columna.
  - "Ver detalles" y "Editar" como botones pequeños.
  - El selector de estado ya no se corta.
  - El paciente ve la columna **Médico**; el médico ve **Paciente** y el título "Reservas de mis pacientes".
- **Formulario de reserva:** el precio de cada servicio sale con formato.
- **Usuarios:** filtro, tabla y paginación dentro de una tarjeta, como las demás pantallas.
- **Toda la app:** formato de moneda colombiano (`LOCALE_ID = 'es-CO'` en `app.config.ts`).

Lo revisé en escritorio y en celular.

---

## 5. Cosas que nos afectan a todos

- **Formato de los errores:** si agregan un endpoint nuevo, lancen excepciones (`ResponseStatusException` o las del paquete `errors`) y `ApiExceptionHandler` las convierte solo en `{ "error": "..." }`. En Angular usen `mensajeError(err, 'mensaje por defecto')` para mostrarlas.
- **`withCredentials`:** el interceptor ya lo agrega a toda llamada a `http://localhost:8090/api`. Si cambian la URL del backend (por ejemplo para Render), hay que actualizar la constante `API` en `interceptors/errores.interceptor.ts`.
- **Permisos:** `GET /api/especialidades/**` y `GET /api/espacios/**` ahora son públicos.

---

## 6. Avisos / pendientes

- **Puerto 8080 vs 8090:** por el commit #26, el backend sube en el 8080 si no se define `PORT` (ver el paso 2). Esto también afecta el `compose.yaml`, que publica el `8090:8090`. Samuel, ¿lo dejamos con `PORT=8090` o cambiamos el default a 8090?
- **`ng test` está roto desde antes de estos cambios:** hay specs viejos (`App` en `app.component.spec.ts`, `crearReserva` con un solo argumento en `reserva.service.spec.ts`). `ng build` sí compila sin errores.
- **`backend/app.jar` (62 MB) está subido al repo:** es un archivo generado, debería ir en el `.gitignore`.
