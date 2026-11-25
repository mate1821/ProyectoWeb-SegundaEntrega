package com.health.project.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;

import com.health.project.entitys.Tipo;
import com.health.project.repository.TipoRepository;

public class TipoServiceImpl implements TipoService {

    @Autowired 
    TipoRepository tiporepo;

    @Override
    public List<Tipo> searchAll() {
        return tiporepo.findAll();
    }

    @Override
    public Tipo searchById(Long id) {
        return tiporepo.findById(id).orElseThrow();
    }
    
}
