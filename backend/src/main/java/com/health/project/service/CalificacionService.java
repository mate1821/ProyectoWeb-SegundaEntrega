package com.health.project.service;

import com.health.project.entitys.Reserva;

public interface CalificacionService {

    boolean yaCalificoMedico(Reserva reserva);

    boolean yaCalificoEspacio(Reserva reserva);

    void calificarMedico(Reserva reserva, int puntuacion, String comentario);

    void calificarEspacio(Reserva reserva, int puntuacion, String comentario);
}