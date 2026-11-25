
package com.health.project.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.health.project.entitys.Espacio;
import com.health.project.repository.EspacioRepository;;
@Service
public class EspacioServiceImpl implements EspacioService {
    @Autowired
    private EspacioRepository repo;

    @Override
    public List<Espacio> buscarTodos() {
        return repo.findAll();
    }

    @Override
    public Espacio buscarPorId(Long id) {
        return repo.findById(id).orElse(null);
    }



}


