package com.health.project.controllers;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.health.project.entitys.Espacio;
import com.health.project.entitys.Especialidad;
import com.health.project.service.EspacioService;
import com.health.project.service.EspecialidadService;
import com.health.project.service.UsuarioService;

import org.springframework.web.bind.annotation.GetMapping;



@RestController
@RequestMapping("/api/espacios")
@CrossOrigin(origins = "http://localhost:4200")



public class EspacioRestController {

@Autowired 
private  EspacioService espacioService;

@GetMapping()
public  List<Espacio> consultarEspecialidades () {
    return this.espacioService.buscarTodos();
}
}
