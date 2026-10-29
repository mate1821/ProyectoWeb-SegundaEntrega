package com.health.project.controllers;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * JSON que Angular envía en POST y PUT de /api/reservas.
 *
 * Se usa esta clase y no la entidad Reserva a propósito: al leer {"usuario": {"id": 2}} directo
 * en la entidad, Jackson intenta construir Usuario/Medico con sus constructores de varios
 * parámetros (que tienen un boolean primitivo "activo") y falla con
 * "Cannot map `null` into type `boolean`". Aquí solo se reciben los ids y el controlador
 * busca las entidades reales en la base de datos.
 *
 * Ejemplo:
 * {"usuario": {"id": 2}, "medico": {"id": 8}, "fecha": "2026-11-05", "horaInicio": "09:00",
 *  "observaciones": "Control", "servicios": [{"id": 1}]}
 *
 * "estado" y "servicios" son opcionales; todo campo desconocido se ignora.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record ReservaRequest(
        Referencia usuario,
        Referencia medico,
        LocalDate fecha,
        LocalTime horaInicio,
        String observaciones,
        Referencia estado,
        List<Referencia> servicios) {

    /** Referencia a otra entidad por su id: {"id": 2}. */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Referencia(Long id) {
    }
}
