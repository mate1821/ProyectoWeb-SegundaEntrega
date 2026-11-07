package com.health.project.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.health.project.entitys.Servicio;

public interface ServicioService {
    public List<Servicio> searchAll();
    public Servicio searchById(Long id);
    List<Object[]> serviciosEnOrden();
    List<Servicio> buscarPorIds(List<Long> ids); 

}
