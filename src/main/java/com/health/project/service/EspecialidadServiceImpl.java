package com.health.project.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.health.project.entitys.Especialidad;
import com.health.project.repository.EspecialidadRepository;


@Service
public class EspecialidadServiceImpl implements EspecialidadService {
    @Autowired
    private EspecialidadRepository repo;

    @Override
    public List<Especialidad> buscarTodos() {
        return repo.findAll();
    }

    @Override
    public Especialidad buscarPorId(Long id) {
        return repo.findById(id).orElse(null);
    }

    @Override
    public void guardar(Especialidad especialidad) {
        repo.save(especialidad);
    }
    public List<Object[]> conteoDeCitasporEspecialidad() {
        return repo.conteoDeCitasporEspecialidad();
    }

   

   

    

}