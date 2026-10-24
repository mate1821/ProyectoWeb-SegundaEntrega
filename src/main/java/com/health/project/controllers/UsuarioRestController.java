package com.health.project.controllers;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.health.project.entitys.Usuario;
import com.health.project.errors.UsuarioConReservasException;

import com.health.project.service.UsuarioService;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/usuarios")
public class UsuarioRestController {

    private final UsuarioService usuarioService;

public UsuarioRestController(UsuarioService usuarioService) {
    this.usuarioService = usuarioService;
}

@GetMapping
public List<Usuario> listar() {
    return usuarioService.buscarTodos();
}

@GetMapping("/{id}")
public Usuario buscarPorId(@PathVariable Long id) {
    return usuarioService.buscarPorId(id);
}

@PostMapping
public Usuario crear(@RequestBody Usuario usuario) {
    usuarioService.guardar(usuario);
    return usuario;
}

@PutMapping("/{id}")
public Usuario actualizar(
        @PathVariable Long id,
        @RequestBody Usuario usuario) {

    usuario.setId(id);
    usuarioService.guardar(usuario);
    return usuario;
    
}
@PutMapping("/activar/{id}")
    public ResponseEntity<?> activarUsuario(@PathVariable Long id) {
        try {
            usuarioService.activar(id); 
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al activar el usuario: " + e.getMessage());
        }
    }

    @PutMapping("/desactivar/{id}")
    public ResponseEntity<?> desactivarUsuario(@PathVariable Long id) {
        try {
            usuarioService.desactivar(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al desactivar el usuario: " + e.getMessage());
        }
    }

    // DELETE /api/usuarios/{id} -> elimina el usuario (204). 404 si no existe, 409 si tiene reservas.
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        if (usuarioService.buscarPorId(id) == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "No existe el usuario con id " + id));
        }
        try {
            usuarioService.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (UsuarioConReservasException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
    }

}
