package com.health.project.service;

import java.util.List;

import com.health.project.entitys.Tipo;

public interface TipoService {
    public List<Tipo> searchAll();
    public Tipo searchById(Long id);
}
