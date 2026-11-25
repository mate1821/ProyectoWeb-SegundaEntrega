package com.health.project.seguridad;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final ManejadorErroresSeguridad manejadorErrores;

    public SecurityConfig(ManejadorErroresSeguridad manejadorErrores) {
        this.manejadorErrores = manejadorErrores;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth

                // Inicio de sesión público
                .requestMatchers("/api/usuarios/login").permitAll()

                // Registro público
                .requestMatchers(HttpMethod.POST, "/api/usuarios").permitAll()


                .requestMatchers(HttpMethod.POST, "/api/resenas/**").permitAll()

                // Catálogos que necesita el formulario de registro antes de
                // iniciar sesión (sin esto el registro de médicos no cargaba nada)
                .requestMatchers(HttpMethod.GET, "/api/especialidades/**", "/api/espacios/**").permitAll()

                // Consultar un usuario: autenticado; que sea el suyo (o ADMIN)
                // lo valida @PreAuthorize en el controlador
                .requestMatchers(HttpMethod.GET, "/api/usuarios/*").authenticated()

                // Resto de gestión de usuarios: administradores
                .requestMatchers("/api/usuarios/**").hasRole("ADMIN")

                // Listar todas las reservas: administradores
                .requestMatchers(HttpMethod.GET, "/api/reservas").hasRole("ADMIN")

                // Demás operaciones de reservas: autenticados (la propiedad
                // de cada reserva se valida con @PreAuthorize)
                .requestMatchers("/api/reservas/**").authenticated()

                // Consulta de médicos para usuarios autenticados
                .requestMatchers("/api/medicos/**").authenticated()
                .requestMatchers("/api/pagos/webhook").permitAll()

                // Cualquier otra ruta requiere autenticación
                .requestMatchers("/error").permitAll()

                .anyRequest().authenticated()
            )
            .formLogin(form -> form.disable())
            // Errores personalizados en JSON (issue #19): 401 sin sesión, 403 sin permisos.
            // Antes Spring respondía solo "Forbidden" en ambos casos.
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(manejadorErrores)
                .accessDeniedHandler(manejadorErrores));

        return http.build();
    }
}