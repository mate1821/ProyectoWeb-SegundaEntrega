package com.health.project.errors;

/**
 * Se lanza al intentar eliminar un usuario (paciente o médico) que todavía tiene reservas:
 * borrarlo rompería la llave foránea de la tabla de reservas.
 */
public class UsuarioConReservasException extends RuntimeException {

    public UsuarioConReservasException(Long id) {
        super("No se puede eliminar el usuario con ID " + id
                + " porque tiene reservas asociadas. Puede desactivarlo en su lugar.");
    }
}
