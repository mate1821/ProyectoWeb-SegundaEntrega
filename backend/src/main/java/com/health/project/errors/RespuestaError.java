package com.health.project.errors;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import jakarta.servlet.http.HttpServletResponse;

/**
 * Formato único de los errores de la API REST (issue #19).
 *
 * Todas las respuestas de error llevan el mismo JSON, así Angular siempre
 * puede leer err.error.error:
 *
 * { "error": "mensaje para el usuario", "estado": 403, "fecha": "2026-11-22T10:00" }
 */
public final class RespuestaError {

    private RespuestaError() {
    }

    public static Map<String, Object> cuerpo(HttpStatus estado, String mensaje) {
        return Map.of(
                "error", mensaje,
                "estado", estado.value(),
                "fecha", LocalDateTime.now().withNano(0).toString());
    }

    // Para los controladores y el @RestControllerAdvice
    public static ResponseEntity<Map<String, Object>> respuesta(HttpStatus estado, String mensaje) {
        return ResponseEntity.status(estado).body(cuerpo(estado, mensaje));
    }

    // Para los filtros de Spring Security, que no pasan por los controladores
    public static void escribir(HttpServletResponse response, HttpStatus estado, String mensaje) throws IOException {
        response.setStatus(estado.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"error\":\"" + escapar(mensaje) + "\",\"estado\":" + estado.value()
                + ",\"fecha\":\"" + LocalDateTime.now().withNano(0) + "\"}");
    }

    private static String escapar(String texto) {
        return texto.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
