package com.health.project.service;

import java.util.List;

import com.health.project.entitys.Medico;
import com.health.project.entitys.Usuario;

public interface MedicoService {

    List<Medico> buscarTodos();

    Medico buscarPorId(Long id);

    void guardar(Medico medico);

    Medico guardarMedicoDesdeUsuario(Usuario usuario, Long especialidadId, Long espacioId);

    List<Medico> buscarPorEspecialidad(Long especialidadId);
    
    List<Object[]> medicosMasCotizados();



}