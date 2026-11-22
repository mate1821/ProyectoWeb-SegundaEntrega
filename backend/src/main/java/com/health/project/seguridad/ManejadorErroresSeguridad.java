package com.health.project.seguridad;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import com.health.project.errors.RespuestaError;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Errores personalizados de Spring Security (issue #19).
 *
 * Antes, como no hay formLogin ni httpBasic, Spring respondía 403 con el texto
 * "Forbidden" tanto si el usuario no había iniciado sesión como si no tenía
 * permisos. Ahora se distinguen los dos casos y se responde en JSON:
 *
 * - 401: no hay sesión iniciada (o expiró) -> AuthenticationEntryPoint
 * - 403: hay sesión, pero el rol no tiene permiso -> AccessDeniedHandler
 */
@Component
public class ManejadorErroresSeguridad implements AuthenticationEntryPoint, AccessDeniedHandler {

    public static final String MENSAJE_SIN_SESION = "Debes iniciar sesión para acceder a esta información.";
    public static final String MENSAJE_SIN_PERMISO = "No tienes permisos para realizar esta acción.";

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException authException) throws IOException {
        RespuestaError.escribir(response, HttpStatus.UNAUTHORIZED, MENSAJE_SIN_SESION);
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
            AccessDeniedException accessDeniedException) throws IOException {
        RespuestaError.escribir(response, HttpStatus.FORBIDDEN, MENSAJE_SIN_PERMISO);
    }
}
