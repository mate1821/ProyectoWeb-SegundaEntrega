package com.health.project.service;

import java.util.List;

import com.health.project.entitys.EstadoReserva;

public interface EstadoResService {
    List<EstadoReserva> buscarTodos();

    EstadoReserva buscarPorId(Long id);
}
