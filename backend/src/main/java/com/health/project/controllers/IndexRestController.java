package com.health.project.controllers;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.health.project.entitys.Usuario;
import com.health.project.service.UsuarioService;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class IndexRestController {
    @Autowired 
    UsuarioService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credenciales, HttpSession session) {
        String correo = credenciales.get("correo");
        String contrasena = credenciales.get("contrasena");

        Usuario usuario = userService.validarCredenciales(correo, contrasena);
        
        if (usuario == null) {
            return ResponseEntity.status(401).body("Correo o contraseña incorrectos");
        }
        session.setAttribute("usuarioId", usuario.getId());
        return ResponseEntity.ok(usuario);
        
    }
}
