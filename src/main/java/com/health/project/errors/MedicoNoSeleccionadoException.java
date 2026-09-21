package com.health.project.errors;

import com.health.project.entitys.Especialidad;

public class MedicoNoSeleccionadoException extends RuntimeException {

public MedicoNoSeleccionadoException(String especialidad) {
    super("No se encontró ningún médico disponible para la especialidad: " + especialidad);
}

}
