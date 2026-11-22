package com.health.project.errors;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.ErrorResponse;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

import com.health.project.seguridad.ManejadorErroresSeguridad;

/**
 * Manejo global de errores de la API REST (issue #19).
 *
 * Solo aplica a los @RestController (los que consume Angular). Las vistas
 * Thymeleaf siguen usando GlobalHandlerException.
 *
 * Si un controlador tiene su propio @ExceptionHandler (por ejemplo
 * ReservaRestController), ese tiene prioridad sobre este.
 */
@RestControllerAdvice(annotations = RestController.class)
@Order(Ordered.HIGHEST_PRECEDENCE)
public class ApiExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    // ---------- Errores de negocio (excepciones propias del proyecto) ----------

    @ExceptionHandler(UsuarioDuplicado.class)
    public ResponseEntity<Map<String, Object>> usuarioDuplicado(UsuarioDuplicado ex) {
        return RespuestaError.respuesta(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(UsuarioConReservasException.class)
    public ResponseEntity<Map<String, Object>> usuarioConReservas(UsuarioConReservasException ex) {
        return RespuestaError.respuesta(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(MedicoNoSeleccionadoException.class)
    public ResponseEntity<Map<String, Object>> medicoNoSeleccionado(MedicoNoSeleccionadoException ex) {
        return RespuestaError.respuesta(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(ReservaNoEncontradaException.class)
    public ResponseEntity<Map<String, Object>> reservaNoEncontrada(ReservaNoEncontradaException ex) {
        return RespuestaError.respuesta(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(HorarioNoDisponibleException.class)
    public ResponseEntity<Map<String, Object>> horarioNoDisponible(HorarioNoDisponibleException ex) {
        return RespuestaError.respuesta(HttpStatus.CONFLICT, ex.getMessage());
    }

    // ---------- Seguridad ----------

    // Lo lanza @PreAuthorize cuando el usuario no cumple la regla. Se responde
    // aquí (y no con un 500) diferenciando "sin sesión" de "sin permiso".
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> accesoDenegado(AccessDeniedException ex) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth instanceof AnonymousAuthenticationToken) {
            return RespuestaError.respuesta(HttpStatus.UNAUTHORIZED, ManejadorErroresSeguridad.MENSAJE_SIN_SESION);
        }
        return RespuestaError.respuesta(HttpStatus.FORBIDDEN, ManejadorErroresSeguridad.MENSAJE_SIN_PERMISO);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> noAutenticado(AuthenticationException ex) {
        return RespuestaError.respuesta(HttpStatus.UNAUTHORIZED, ManejadorErroresSeguridad.MENSAJE_SIN_SESION);
    }

    // ---------- Errores de la petición ----------

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> conEstado(ResponseStatusException ex) {
        HttpStatus estado = HttpStatus.resolve(ex.getStatusCode().value());
        if (estado == null) {
            estado = HttpStatus.BAD_REQUEST;
        }
        String mensaje = ex.getReason() != null ? ex.getReason() : estado.getReasonPhrase();
        return RespuestaError.respuesta(estado, mensaje);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> jsonInvalido(HttpMessageNotReadableException ex) {
        return RespuestaError.respuesta(HttpStatus.BAD_REQUEST, "Los datos enviados no tienen un formato válido.");
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> tipoInvalido(MethodArgumentTypeMismatchException ex) {
        return RespuestaError.respuesta(HttpStatus.BAD_REQUEST,
                "El valor '" + ex.getValue() + "' no es válido para el parámetro " + ex.getName() + ".");
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<Map<String, Object>> faltaParametro(MissingServletRequestParameterException ex) {
        return RespuestaError.respuesta(HttpStatus.BAD_REQUEST,
                "Falta el parámetro obligatorio " + ex.getParameterName() + ".");
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Map<String, Object>> metodoNoPermitido(HttpRequestMethodNotSupportedException ex) {
        return RespuestaError.respuesta(HttpStatus.METHOD_NOT_ALLOWED,
                "El método " + ex.getMethod() + " no está permitido en esta ruta.");
    }

    // Llaves duplicadas, campos obligatorios vacíos, borrar algo referenciado...
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> integridadDatos(DataIntegrityViolationException ex) {
        log.warn("Violación de integridad de datos", ex);
        return RespuestaError.respuesta(HttpStatus.CONFLICT,
                "La operación no se pudo completar porque entra en conflicto con datos existentes.");
    }

    // ---------- Cualquier otro error ----------

    // No se muestra el detalle técnico al usuario, pero sí queda en el log del backend
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> inesperado(Exception ex) {
        // Excepciones propias de Spring MVC (415, 406, ...) ya traen su código HTTP
        if (ex instanceof ErrorResponse errorSpring) {
            HttpStatus estado = HttpStatus.resolve(errorSpring.getStatusCode().value());
            if (estado != null && !estado.is5xxServerError()) {
                return RespuestaError.respuesta(estado, "La petición no es válida: " + estado.getReasonPhrase() + ".");
            }
        }
        log.error("Error inesperado en la API", ex);
        return RespuestaError.respuesta(HttpStatus.INTERNAL_SERVER_ERROR,
                "Ocurrió un error inesperado en el servidor. Intenta de nuevo más tarde.");
    }
}
