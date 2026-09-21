package com.health.project.errors;

public class ReservaNoEncontradaException extends RuntimeException {

    public ReservaNoEncontradaException(Long id) {
        super("No se encontró ninguna reserva con el ID: " + id);
    }
}