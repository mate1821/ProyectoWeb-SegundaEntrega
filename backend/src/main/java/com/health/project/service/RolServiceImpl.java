package com.health.project.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.health.project.entitys.Rol;
import com.health.project.repository.RolRepository;

@Service 
public class RolServiceImpl implements RolService {

    @Autowired 
    private RolRepository rolrepo;

    @Override
    public List<Rol> searchAll() {
        return rolrepo.findAll();
    }

    @Override
    public Rol searchById(Long id) {
        return rolrepo.findById(id).orElseThrow();
    }
    
}
