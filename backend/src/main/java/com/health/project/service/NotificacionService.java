package com.health.project.service;

import java.time.format.DateTimeFormatter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.health.project.entitys.Medico;
import com.health.project.entitys.Reserva;
import com.health.project.entitys.Servicio;
import com.health.project.entitys.Usuario;


@Service
public class NotificacionService {

    private static final DateTimeFormatter FORMATO_FECHA = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter FORMATO_HORA = DateTimeFormatter.ofPattern("HH:mm");

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String remitente;

    @Async
    public void notificarReservaCreada(Reserva reserva) {
        Usuario paciente = reserva.getUsuario();
        if (paciente == null || paciente.getCorreo() == null || paciente.getCorreo().isBlank()) {
            System.out.println("La reserva " + reserva.getIdReserva() + " no tiene correo de paciente, no se envía notificación");
            return;
        }

        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setFrom(remitente);
        mensaje.setTo(paciente.getCorreo());
        mensaje.setSubject("Confirmación de tu reserva #" + reserva.getIdReserva());
        mensaje.setText(armarCuerpo(reserva));

        try {
            mailSender.send(mensaje);
            System.out.println("Correo de reserva enviado a " + paciente.getCorreo());
        } catch (MailException e) {
            // Si el correo falla, la reserva ya quedó guardada: solo se registra el error
            System.err.println("No se pudo enviar el correo de la reserva " + reserva.getIdReserva() + ": " + e.getMessage());
        }
    }

    private String armarCuerpo(Reserva reserva) {
        Medico medico = reserva.getMedico();
        StringBuilder sb = new StringBuilder();

        sb.append("Hola ").append(reserva.getUsuario().getNombre()).append(",\n\n");
        sb.append("Tu reserva quedó registrada con los siguientes datos:\n\n");
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
            sb.append("Servicios adicionales:\n");
            for (Servicio s : reserva.getServicios()) {
                sb.append("  - ").append(s.getNombre()).append("\n");
            }
        }

        if (reserva.getEstado() != null) {
            sb.append("Estado: ").append(reserva.getEstado().getNombre()).append("\n");
        }
        sb.append("Total: $").append(String.format("%,.0f", reserva.getTotal())).append("\n");

        if (reserva.getObservaciones() != null && !reserva.getObservaciones().isBlank()) {
            sb.append("Observaciones: ").append(reserva.getObservaciones()).append("\n");
        }

        sb.append("\nSi no reconoces esta reserva, ignora este mensaje es un proyecto de la uni .\n");
        return sb.toString();
    }
}