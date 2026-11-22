package com.health.project.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.health.project.entitys.CalificacionEspacio;
import com.health.project.entitys.CalificacionMedico;
import com.health.project.entitys.Reserva;
import com.health.project.repository.CalificacionEspacioRepository;
import com.health.project.repository.CalificacionMedicoRepository;

@Service
public class CalificacionServiceImpl implements CalificacionService {

    @Autowired
    private CalificacionMedicoRepository calificacionMedicoRepo;

    @Autowired
    private CalificacionEspacioRepository calificacionEspacioRepo;

    @Override
    public boolean yaCalificoMedico(Reserva reserva) {
        return calificacionMedicoRepo.existsByUsuarioIdAndMedicoId(reserva.getUsuario().getId(), reserva.getMedico().getId());
    }

    @Override
    public boolean yaCalificoEspacio(Reserva reserva) {
        return calificacionEspacioRepo.existsByUsuarioIdAndEspacioId(
                reserva.getUsuario().getId(), reserva.getMedico().getEspacio().getId());
    }


    @Override
    public void calificarMedico(Reserva reserva, int puntuacion, String comentario) {
        CalificacionMedico c = new CalificacionMedico(puntuacion, comentario, LocalDateTime.now());
        c.setUsuario(reserva.getUsuario());
        c.setMedico(reserva.getMedico());
        calificacionMedicoRepo.save(c);
    }

    @Override
    public void calificarEspacio(Reserva reserva, int puntuacion, String comentario) {
        CalificacionEspacio c = new CalificacionEspacio(puntuacion, comentario, LocalDateTime.now());
        c.setUsuario(reserva.getUsuario());
        c.setEspacio(reserva.getMedico().getEspacio());
        calificacionEspacioRepo.save(c);
    }
}
