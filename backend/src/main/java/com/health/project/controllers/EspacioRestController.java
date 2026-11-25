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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.Map;



@RestController
@RequestMapping("/api/espacios")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")



public class EspacioRestController {

@Autowired 
private  EspacioService espacioService;

@GetMapping()
public  List<Espacio> consultarEspecialidades () {
    return this.espacioService.buscarTodos();
}
@GetMapping("/{id}/foto")
public ResponseEntity<Map<String, String>> obtenerFoto(@PathVariable Long id) {
    Espacio espacio = this.espacioService.buscarPorId(id);
    if (espacio == null || espacio.getImagenUrl() == null || espacio.getImagenUrl().isBlank()) {
        return ResponseEntity.notFound().build();
    }
    String imagen = espacio.getImagenUrl();
    // Si se guardó solo el Base64, se le agrega el prefijo para que <img> lo entienda
    if (!imagen.startsWith("data:")) {
        imagen = "data:image/jpeg;base64," + imagen;
    }
    return ResponseEntity.ok(Map.of("url", imagen));
}
}
