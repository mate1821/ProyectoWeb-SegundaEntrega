package com.health.project.controllers;
import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.health.project.entitys.Especialidad;
import com.health.project.service.EspecialidadService;
import com.health.project.service.UsuarioService;

import org.springframework.web.bind.annotation.GetMapping;



@RestController
@RequestMapping("/api/especialidades")
@CrossOrigin(origins = "http://localhost:4200")



public class EspecialidadesRestController {

private final EspecialidadService especialidadService;


public EspecialidadesRestController(EspecialidadService espe) {
    this.especialidadService = espe;
}

@GetMapping()
public  List<Especialidad> consultarEspecialidades () {
    return this.especialidadService.buscarTodos();
}
}
