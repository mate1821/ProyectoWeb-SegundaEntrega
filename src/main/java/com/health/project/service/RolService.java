package com.health.project.service;

import java.util.List;

import com.health.project.entitys.Rol;

public interface RolService {
    public List<Rol> searchAll();
    public Rol searchById(Long id);

}
