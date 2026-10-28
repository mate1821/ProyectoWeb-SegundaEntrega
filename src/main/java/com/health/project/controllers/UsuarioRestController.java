package com.health.project.controllers;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.health.project.entitys.Rol;
import com.health.project.entitys.Usuario;
import com.health.project.errors.UsuarioConReservasException;
import com.health.project.errors.UsuarioDuplicado;
import com.health.project.service.EspacioService;
import com.health.project.service.EspecialidadService;
import com.health.project.service.MedicoService;
import com.health.project.service.RolService;
import com.health.project.service.UsuarioService;
import jakarta.servlet.http.HttpSession;

@RestController
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
@RequestMapping("/api/usuarios")
public class UsuarioRestController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private RolService rolService;

    @Autowired
    private EspecialidadService espService;

    @Autowired
    private MedicoService medicoService;

    @Autowired
    private EspacioService espacioService;

    @GetMapping //Si solo dice api usuarios, los lista con paginación: /api/usuarios 
    public List<Usuario> listar() {
        return usuarioService.buscarTodos();
    }

    @GetMapping("/{id}")
    public Usuario buscarPorId(@PathVariable Long id) {
        return usuarioService.buscarPorId(id);
    }

    @PostMapping//Aqui la URL va a tener los 2 parámetros que se le envían
    public ResponseEntity<?> crear(@RequestBody Usuario usuario,
            @RequestParam(required = false) Long especialidadId,
            @RequestParam(required = false) Long espacioId) {

        if (usuario.getRol() == null || usuario.getRol().getId() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Debe seleccionar un rol"));
        }
        Rol rol = rolService.searchById(usuario.getRol().getId());
        if (rol == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "El rol no existe"));
        }
        usuario.setRol(rol);
        usuario.setFechaRegistro(LocalDateTime.now());

    
            if ("Medico".equalsIgnoreCase(rol.getNombre())) {
                medicoService.guardarMedicoDesdeUsuario(usuario, especialidadId, espacioId);
            } else {
                usuarioService.guardar(usuario);
            }
            return ResponseEntity.status(HttpStatus.CREATED).build();
        }

    @PutMapping("/{id}")//api/usuarios/id
    public Usuario actualizar(
            @PathVariable Long id,
            @RequestBody Usuario usuario) {

        usuario.setId(id);
        usuarioService.guardar(usuario);
        return usuario;

    }

    @PutMapping("/activar/{id}")//api/usuarios/activar/id
    public ResponseEntity<?> activarUsuario(@PathVariable Long id) {
        try {
            usuarioService.activar(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al activar el usuario: " + e.getMessage());
        }
    }

    @PutMapping("/desactivar/{id}")//api/usuarios/desactivar/id
    public ResponseEntity<?> desactivarUsuario(@PathVariable Long id) {
        try {
            usuarioService.desactivar(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al desactivar el usuario: " + e.getMessage());
        }
    }

    // DELETE /api/usuarios/{id} -> elimina el usuario (204). 404 si no existe, 409
    // si tiene reservas.
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
