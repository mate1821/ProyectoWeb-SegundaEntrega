package com.health.project.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.health.project.entitys.EstadoReserva;
import com.health.project.repository.EstadoReservaRepository;
@Service 
public class EstadoResServiceImpl implements EstadoResService{

    @Autowired 
    EstadoReservaRepository estadoRepo;

    @Override
    public List<EstadoReserva> buscarTodos() {
        return estadoRepo.findAll();
        
    }

    @Override
    public EstadoReserva buscarPorId(Long id) {
        return estadoRepo.findById(id).orElse(null);
    }
    
}
