
package com.health.project.entitys;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Disponibilidad {

    private Integer idDisponibilidad;
    private Espacio espacio;
    private LocalDate fecha;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private EstadoDisponibilidad estado;


    public enum EstadoDisponibilidad {
        DISPONIBLE,
        BLOQUEADO
    }
}