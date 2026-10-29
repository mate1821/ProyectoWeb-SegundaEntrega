package com.health.project.controllers;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.health.project.entitys.Usuario;
import com.health.project.errors.UsuarioConReservasException;
import com.health.project.service.UsuarioService;

/** Prueba el DELETE /api/usuarios/{id} del UsuarioRestController sin base de datos. */
@ExtendWith(MockitoExtension.class)
class UsuarioRestControllerTest {

    @Mock UsuarioService usuarioService;

    MockMvc mvc;

    @BeforeEach
    void preparar() {
        mvc = MockMvcBuilders.standaloneSetup(new UsuarioRestController(usuarioService)).build();
    }

    @Test
    void delete_eliminaElUsuario_responde204() throws Exception {
        when(usuarioService.buscarPorId(5L)).thenReturn(new Usuario());

        mvc.perform(delete("/api/usuarios/5"))
                .andExpect(status().isNoContent())
                .andExpect(content().string(""));

        verify(usuarioService).eliminar(5L);
    }

    @Test
    void delete_usuarioInexistente_responde404() throws Exception {
        when(usuarioService.buscarPorId(99L)).thenReturn(null);

        mvc.perform(delete("/api/usuarios/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("No existe el usuario con id 99"));

        verify(usuarioService, never()).eliminar(any());
    }

    @Test
    void delete_usuarioConReservas_responde409ConMensajeJson() throws Exception {
        when(usuarioService.buscarPorId(5L)).thenReturn(new Usuario());
        doThrow(new UsuarioConReservasException(5L)).when(usuarioService).eliminar(5L);

        mvc.perform(delete("/api/usuarios/5"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error", containsString("tiene reservas")));
    }
}
