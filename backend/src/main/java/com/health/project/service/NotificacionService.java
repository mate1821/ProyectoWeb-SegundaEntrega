package com.health.project.service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.health.project.entitys.Medico;
import com.health.project.entitys.Reserva;
import com.health.project.entitys.Usuario;


@Service
public class NotificacionService {

    private static final DateTimeFormatter FORMATO_FECHA = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter FORMATO_HORA = DateTimeFormatter.ofPattern("HH:mm");

    @Value("${brevo.api-key}")
    private String apiKey;

    @Value("${notificaciones.remitente}")
    private String remitente;

    private final RestClient restClient = RestClient.builder()
            .baseUrl("https://api.brevo.com/v3")
            .build();

    @Async
    public void enviarConfirmacionReserva(Reserva reserva) {
        Usuario paciente = reserva.getUsuario();
        if (paciente == null || paciente.getCorreo() == null || paciente.getCorreo().isBlank()) {
            return; // sin correo registrado no hay a quién avisar
        }

        // Este Map se convierte al JSON que pide Brevo en POST /v3/smtp/email
        Map<String, Object> cuerpoJson = Map.of(
                "sender", Map.of("name", "ProyectoWeb", "email", remitente),
                "to", List.of(Map.of("email", paciente.getCorreo(), "name", paciente.getNombre())),
                "subject", "Tu reserva #" + reserva.getIdReserva() + " está confirmada",
                "textContent", armarCuerpo(reserva, paciente));

        try {
            restClient.post()
                    .uri("/smtp/email")
                    .header("api-key", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(cuerpoJson)
                    .retrieve()
                    .toBodilessEntity();
            System.out.println("Correo de la reserva " + reserva.getIdReserva() + " enviado a " + paciente.getCorreo());
        } catch (RestClientException e) {
            System.err.println("No se pudo enviar el correo de la reserva "
                    + reserva.getIdReserva() + ": " + e.getMessage());
        }
    }

    private String armarCuerpo(Reserva reserva, Usuario paciente) {
        Medico medico = reserva.getMedico();
        StringBuilder sb = new StringBuilder();

        sb.append("Hola ").append(paciente.getNombre()).append(",\n\n");
        sb.append("Tu reserva quedó registrada con estos datos:\n\n");
        sb.append("Número de reserva: ").append(reserva.getIdReserva()).append("\n");
        sb.append("Fecha: ").append(reserva.getFecha().format(FORMATO_FECHA)).append("\n");
        sb.append("Hora: ").append(reserva.getHoraInicio().format(FORMATO_HORA))
        .append(" - ").append(reserva.getHoraFin().format(FORMATO_HORA)).append("\n");

        if (medico != null) {
            sb.append("Médico: ").append(medico.getNombre()).append("\n");
            if (medico.getEspecialidad() != null) {
                sb.append("Especialidad: ").append(medico.getEspecialidad().getNombreEspecialidad()).append("\n");
            }
            if (medico.getEspacio() != null) {
                sb.append("Lugar: ").append(medico.getEspacio().getNombre());
                if (medico.getEspacio().getUbicacion() != null) {
                    sb.append(" (").append(medico.getEspacio().getUbicacion()).append(")");
                }
                sb.append("\n");
            }
        }

        if (reserva.getServicios() != null && !reserva.getServicios().isEmpty()) {
            String servicios = reserva.getServicios().stream()
                    .map(s -> s.getNombre())
                    .collect(Collectors.joining(", "));
            sb.append("Servicios: ").append(servicios).append("\n");
        }

        sb.append("Total: $").append(String.format("%,.0f", reserva.getTotal())).append("\n");

        if (reserva.getObservaciones() != null && !reserva.getObservaciones().isBlank()) {
            sb.append("Observaciones: ").append(reserva.getObservaciones()).append("\n");
        }

        sb.append("\nSi no reconoces esta reserva, ignora este mensaje.\n");
        return sb.toString();
    }
}