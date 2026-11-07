package com.health.project.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.health.project.entitys.EstadoReserva;
import com.health.project.service.EstadoResService;

@RestController
@RequestMapping("/api/estados")
@CrossOrigin(origins = "http://localhost:4200")
public class EstadoReservaRestController {

    private final EstadoResService estadoService;

    public EstadoReservaRestController(EstadoResService estadoService) {
        this.estadoService = estadoService;
    }
    @GetMapping
    public List<EstadoReserva> consultarEstados() {
        return estadoService.buscarTodos();
    }
}