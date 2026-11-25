package com.health.project.service;

import java.util.List;

import com.health.project.entitys.Espacio;

public interface EspacioService {

    List<Espacio> buscarTodos();

    Espacio buscarPorId(Long id);
}