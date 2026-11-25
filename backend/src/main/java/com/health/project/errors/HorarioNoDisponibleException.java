package com.health.project.errors;

import java.time.LocalDate;
import java.time.LocalTime;

import com.health.project.entitys.Medico;

public class HorarioNoDisponibleException extends RuntimeException{
    public HorarioNoDisponibleException(Medico m, LocalDate f, LocalTime h){
        super("El horario seleccionado para la cita con el Dr(a). " + m.getNombre()+" especialista en: "+m.getEspecialidad().getNombreEspecialidad().toLowerCase() +
        " el dia: " + f + " a las: "+ h +", ya está ocupado");
    }
    
}
