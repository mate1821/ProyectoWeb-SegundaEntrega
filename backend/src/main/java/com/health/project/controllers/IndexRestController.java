package com.health.project.controllers;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.DisabledException;

import com.health.project.errors.RespuestaError;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.health.project.entitys.Usuario;
import com.health.project.service.UsuarioService;

import jakarta.servlet.http.HttpSession;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class IndexRestController {
    @Autowired
    UsuarioService userService;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> credenciales,
            HttpSession session,
            HttpServletRequest request,
            HttpServletResponse response) {

        String correo = credenciales.get("correo");
        String contrasena = credenciales.get("contrasena");

        if (correo == null || correo.isBlank() || contrasena == null || contrasena.isBlank()) {
            return RespuestaError.respuesta(HttpStatus.BAD_REQUEST, "Debes ingresar el correo y la contraseña.");
        }

        try {

            Authentication autenticacion = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(correo, contrasena));

            SecurityContext contexto = SecurityContextHolder.createEmptyContext();
            contexto.setAuthentication(autenticacion);
            SecurityContextHolder.setContext(contexto);

            Usuario usuario = userService.validarCredenciales(correo, contrasena);

            session.setAttribute("usuarioId", usuario.getId());

            HttpSessionSecurityContextRepository repository = new HttpSessionSecurityContextRepository();

            repository.saveContext(contexto, request, response);

            return ResponseEntity.ok(usuario);

        } catch (DisabledException e) {
            // El usuario existe pero un administrador lo desactivó
            SecurityContextHolder.clearContext();
            return RespuestaError.respuesta(HttpStatus.FORBIDDEN,
                    "Tu cuenta está desactivada. Comunícate con un administrador.");
        } catch (AuthenticationException e) {
            SecurityContextHolder.clearContext();
            return RespuestaError.respuesta(HttpStatus.UNAUTHORIZED, "Correo o contraseña incorrectos.");
        }
    }
}
