package com.health.project.controllers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.startsWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.health.project.entitys.Especialidad;
import com.health.project.entitys.EstadoReserva;
import com.health.project.entitys.Medico;
import com.health.project.entitys.Reserva;
import com.health.project.entitys.Servicio;
import com.health.project.entitys.Usuario;
import com.health.project.errors.HorarioNoDisponibleException;
import com.health.project.service.EstadoResService;
import com.health.project.service.MedicoService;
import com.health.project.service.ReservaService;
import com.health.project.service.ServicioService;
import com.health.project.service.UsuarioService;

/**
 * Prueba el ReservaRestController sin base de datos: los servicios van simulados con Mockito
 * y se verifica el JSON de entrada/salida y los códigos HTTP de los 4 requestMapping.
 */
@ExtendWith(MockitoExtension.class)
class ReservaRestControllerTest {

    @Mock ReservaService reservaService;
    @Mock UsuarioService usuarioService;
    @Mock MedicoService medicoService;
    @Mock EstadoResService estadoService;
    @Mock ServicioService servicioService;

    MockMvc mvc;

    Usuario paciente;
    Medico medico;
    EstadoReserva confirmada;
    Servicio nocturno;

    @BeforeEach
    void preparar() {
        mvc = MockMvcBuilders.standaloneSetup(
                new ReservaRestController(reservaService, usuarioService, medicoService, estadoService, servicioService))
                .build();

        paciente = new Usuario();
        paciente.setId(2L);
        paciente.setNombre("Ana Torres");
        paciente.setContrasena("clave-secreta");

        Especialidad pediatria = new Especialidad("PEDIATRIA", 70000.0);
        medico = new Medico();
        medico.setId(8L);
        medico.setNombre("Laura Gómez");
        medico.setContrasena("clave-secreta");
        medico.setEspecialidad(pediatria);

        confirmada = new EstadoReserva("Confirmada");
        confirmada.setId(1L);

        nocturno = new Servicio("Nocturno", 50000.0);
        nocturno.setId(1L);
    }

    private Reserva reservaGuardada(Long id) {
        Reserva r = new Reserva(LocalDate.of(2026, 11, 5), LocalTime.of(9, 0), LocalTime.of(10, 0),
                LocalDateTime.of(2026, 10, 24, 12, 0), "Control", 120000);
        r.setIdReserva(id);
        r.setUsuario(paciente);
        r.setMedico(medico);
        r.setEstado(confirmada);
        r.setServicios(List.of(nocturno));
        return r;
    }

    private static final String JSON_NUEVA = """
            {"usuario":{"id":2},"medico":{"id":8},"fecha":"2026-11-05","horaInicio":"09:00",
             "observaciones":"Control mensual","servicios":[{"id":1}]}
            """;

    // ---------- 1. GET ----------

    @Test
    void get_listaLasReservas_sinExponerContrasenas() throws Exception {
        when(reservaService.buscarReservas()).thenReturn(List.of(reservaGuardada(5L)));

        mvc.perform(get("/api/reservas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].idReserva").value(5))
                .andExpect(jsonPath("$[0].estado.nombre").value("Confirmada"))
                .andExpect(jsonPath("$[0].usuario.nombre").value("Ana Torres"))
                .andExpect(jsonPath("$[0].medico.especialidad.nombreEspecialidad").value("PEDIATRIA"))
                .andExpect(jsonPath("$[0].servicios[0].nombre").value("Nocturno"))
                .andExpect(jsonPath("$[0].usuario.contrasena").doesNotExist())
                .andExpect(jsonPath("$[0].medico.contrasena").doesNotExist());
    }

    // ---------- 2. POST ----------

    @Test
    void post_creaLaReserva_conTotalHoraFinYEstadoConfirmada() throws Exception {
        when(usuarioService.buscarPorId(2L)).thenReturn(paciente);
        when(medicoService.buscarPorId(8L)).thenReturn(medico);
        when(estadoService.buscarPorId(1L)).thenReturn(confirmada);
        when(servicioService.buscarPorIds(List.of(1L))).thenReturn(List.of(nocturno));

        mvc.perform(post("/api/reservas").contentType(MediaType.APPLICATION_JSON).content(JSON_NUEVA))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.total").value(120000.0)) // 70000 especialidad + 50000 servicio
                .andExpect(jsonPath("$.estado.nombre").value("Confirmada"))
                .andExpect(jsonPath("$.usuario.contrasena").doesNotExist());

        ArgumentCaptor<Reserva> guardada = ArgumentCaptor.forClass(Reserva.class);
        verify(reservaService).guardar(guardada.capture());
        Reserva r = guardada.getValue();
        assertThat(r.getIdReserva()).isNull();
        assertThat(r.getFechaSolicitud()).isNotNull();
        assertThat(r.getMedico()).isSameAs(medico);
        assertThat(r.getUsuario()).isSameAs(paciente);
        assertThat(r.getEstado()).isSameAs(confirmada);
        assertThat(r.getFecha()).isEqualTo(LocalDate.of(2026, 11, 5));
        assertThat(r.getHoraInicio()).isEqualTo(LocalTime.of(9, 0));
        assertThat(r.getHoraFin()).isEqualTo(LocalTime.of(10, 0)); // siempre +1 hora
        assertThat(r.getTotal()).isEqualTo(120000.0);
        assertThat(r.getServicios()).containsExactly(nocturno);
    }

    // Es exactamente el cuerpo que envía reserva.component.ts (sin servicios). Antes fallaba con
    // "Cannot map `null` into type `boolean`" porque Jackson construía Usuario/Medico con el JSON {id}.
    @Test
    void post_conElJsonQueEnviaAngular_creaLaReservaSinServicios() throws Exception {
        when(usuarioService.buscarPorId(2L)).thenReturn(paciente);
        when(medicoService.buscarPorId(8L)).thenReturn(medico);
        when(estadoService.buscarPorId(1L)).thenReturn(confirmada);

        String json = """
                {"usuario":{"id":2},"medico":{"id":8},"fecha":"2026-10-25","horaInicio":"18:45","observaciones":"lol"}
                """;
        mvc.perform(post("/api/reservas").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.total").value(70000.0)) // solo el costo de la especialidad
                .andExpect(jsonPath("$.horaFin").exists());

        ArgumentCaptor<Reserva> guardada = ArgumentCaptor.forClass(Reserva.class);
        verify(reservaService).guardar(guardada.capture());
        assertThat(guardada.getValue().getServicios()).isEmpty();
        assertThat(guardada.getValue().getHoraFin()).isEqualTo(LocalTime.of(19, 45));
        assertThat(guardada.getValue().getObservaciones()).isEqualTo("lol");
    }

    @Test
    void post_ignoraCamposDesconocidosEnUsuarioYMedico() throws Exception {
        when(usuarioService.buscarPorId(2L)).thenReturn(paciente);
        when(medicoService.buscarPorId(8L)).thenReturn(medico);
        when(estadoService.buscarPorId(1L)).thenReturn(confirmada);

        String json = """
                {"usuario":{"id":2,"nombre":"Ana Torres","contrasena":"x","activo":true},
                 "medico":{"id":8,"nombre":"Laura Gómez"},"fecha":"2026-11-05","horaInicio":"09:00:00",
                 "campoRaro":123}
                """;
        mvc.perform(post("/api/reservas").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isCreated());
    }

    @Test
    void post_conJsonInvalido_responde400ConMensajeJson() throws Exception {
        mvc.perform(post("/api/reservas").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"usuario\":{\"id\":2},\"fecha\":\"no-es-una-fecha\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());

        verify(reservaService, never()).guardar(any());
    }

    @Test
    void post_conHorarioOcupado_responde409ConMensajeJson() throws Exception {
        when(usuarioService.buscarPorId(2L)).thenReturn(paciente);
        when(medicoService.buscarPorId(8L)).thenReturn(medico);
        when(estadoService.buscarPorId(1L)).thenReturn(confirmada);
        when(servicioService.buscarPorIds(List.of(1L))).thenReturn(List.of(nocturno));
        doThrow(new HorarioNoDisponibleException(medico, LocalDate.of(2026, 11, 5), LocalTime.of(9, 0)))
                .when(reservaService).guardar(any(Reserva.class));

        mvc.perform(post("/api/reservas").contentType(MediaType.APPLICATION_JSON).content(JSON_NUEVA))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error", startsWith("El horario seleccionado")));
    }

    @Test
    void post_sinMedico_responde400() throws Exception {
        String json = """
                {"usuario":{"id":2},"fecha":"2026-11-05","horaInicio":"09:00"}
                """;
        mvc.perform(post("/api/reservas").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Debe indicar el médico (medico.id)"));

        verify(reservaService, never()).guardar(any());
    }

    @Test
    void post_conServicioInexistente_responde400() throws Exception {
        when(usuarioService.buscarPorId(2L)).thenReturn(paciente);
        when(medicoService.buscarPorId(8L)).thenReturn(medico);
        when(estadoService.buscarPorId(1L)).thenReturn(confirmada);
        when(servicioService.buscarPorIds(List.of(1L))).thenReturn(List.of());

        mvc.perform(post("/api/reservas").contentType(MediaType.APPLICATION_JSON).content(JSON_NUEVA))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Alguno de los servicios indicados no existe"));
    }

    // ---------- 3. PUT ----------

    @Test
    void put_actualizaConservandoEstadoServiciosYFechaSolicitud() throws Exception {
        Reserva existente = reservaGuardada(5L);
        when(reservaService.buscarPorId(5L)).thenReturn(existente);
        when(usuarioService.buscarPorId(2L)).thenReturn(paciente);
        when(medicoService.buscarPorId(8L)).thenReturn(medico);

        // El JSON no trae estado ni servicios: se conservan los de la reserva existente
        String json = """
                {"usuario":{"id":2},"medico":{"id":8},"fecha":"2026-11-06","horaInicio":"14:30",
                 "observaciones":"Cambio de hora"}
                """;
        mvc.perform(put("/api/reservas/5").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idReserva").value(5))
                .andExpect(jsonPath("$.estado.nombre").value("Confirmada"))
                .andExpect(jsonPath("$.total").value(120000.0));

        ArgumentCaptor<Reserva> guardada = ArgumentCaptor.forClass(Reserva.class);
        verify(reservaService).guardar(guardada.capture());
        Reserva r = guardada.getValue();
        assertThat(r.getIdReserva()).isEqualTo(5L);
        assertThat(r.getFecha()).isEqualTo(LocalDate.of(2026, 11, 6));
        assertThat(r.getHoraInicio()).isEqualTo(LocalTime.of(14, 30));
        assertThat(r.getHoraFin()).isEqualTo(LocalTime.of(15, 30));
        assertThat(r.getFechaSolicitud()).isEqualTo(existente.getFechaSolicitud()); // no cambia
        assertThat(r.getEstado()).isSameAs(confirmada);                              // se conserva
        assertThat(r.getServicios()).containsExactly(nocturno);                      // se conservan
    }

    @Test
    void put_reservaInexistente_responde404() throws Exception {
        when(reservaService.buscarPorId(99L)).thenReturn(null);

        mvc.perform(put("/api/reservas/99").contentType(MediaType.APPLICATION_JSON).content(JSON_NUEVA))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("No se encontró ninguna reserva con el ID: 99"));

        verify(reservaService, never()).guardar(any());
    }

    // ---------- 4. DELETE ----------

    @Test
    void delete_cancelaLaReserva_responde204() throws Exception {
        when(reservaService.buscarPorId(5L)).thenReturn(reservaGuardada(5L));

        mvc.perform(delete("/api/reservas/5"))
                .andExpect(status().isNoContent());

        verify(reservaService).cancelar(5L);
    }

    @Test
    void delete_reservaInexistente_responde404() throws Exception {
        when(reservaService.buscarPorId(99L)).thenReturn(null);

        mvc.perform(delete("/api/reservas/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").exists());

        verify(reservaService, never()).cancelar(any());
    }
}
