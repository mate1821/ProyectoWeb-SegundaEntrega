package com.health.project.controllers;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.*;


import com.health.project.service.ServicioService;


import com.health.project.entitys.Servicio;

@RestController
@RequestMapping("/api/servicios")
@CrossOrigin(origins = "http://localhost:4200")

public class ServicioRestController {
    private final ServicioService servicioService;

    ServicioRestController(ServicioService service){

        this.servicioService = service ;

    }
    @GetMapping
    public List<Servicio> consultarServicios() {
        return servicioService.searchAll();
    }
    
}



