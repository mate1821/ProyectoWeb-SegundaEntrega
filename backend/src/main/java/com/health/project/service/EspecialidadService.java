package com.health.project.service;

import java.util.List;

import org.springframework.data.jpa.repository.Query;

import com.health.project.entitys.Especialidad;
import com.health.project.entitys.Servicio;
import com.health.project.entitys.Usuario;

public interface EspecialidadService {

    List<Especialidad> buscarTodos();

    Especialidad buscarPorId(Long id);

    void guardar(Especialidad especialidad);

    List<Object[]> conteoDeCitasporEspecialidad();

    
}
