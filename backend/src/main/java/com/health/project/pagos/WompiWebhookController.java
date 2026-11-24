
package com.health.project.pagos;

import java.time.LocalDateTime;
import java.util.ArrayList;

import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import com.health.project.controllers.ReservaRequest;
import com.health.project.entitys.EstadoReserva;
import com.health.project.entitys.Reserva;
import com.health.project.repository.EstadoReservaRepository;
import com.health.project.service.ReservaService;
import com.health.project.service.UsuarioService;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/pagos")
public class WompiWebhookController {

    private static final Long ID_CONFIRMADA = 1L;

    private final WompiService wompi;
    private final OrdenRepository ordenes;
    private final ReservaService reservaService;
    private final UsuarioService usuarioService;
    private final EstadoReservaRepository estadoReservaRepository;
    private final ObjectMapper objectMapper;

    public WompiWebhookController(
            WompiService wompi,
            OrdenRepository ordenes,
            ReservaService reservaService,
            UsuarioService usuarioService,
            EstadoReservaRepository estadoReservaRepository,
            ObjectMapper objectMapper) {

        this.wompi = wompi;
        this.ordenes = ordenes;
        this.reservaService = reservaService;
        this.usuarioService = usuarioService;
        this.estadoReservaRepository = estadoReservaRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * Wompi notifica los cambios de estado de una transacción.
     * La reserva se crea únicamente cuando el pago está aprobado.
     */
    @Transactional
    @PostMapping("/webhook")
    public ResponseEntity<Void> recibir(@RequestBody JsonNode evento) {

        // 1. Validar la firma del evento enviado por Wompi.
        if (!wompi.firmaEventoValida(evento)) {
            return ResponseEntity.status(401).build();
        }

        // 2. Procesar únicamente actualizaciones de transacciones.
        if (!"transaction.updated".equals(evento.path("event").asText())) {
            return ResponseEntity.ok().build();
        }

        JsonNode tx = evento.path("data").path("transaction");

        String referencia = tx.path("reference").asText("");
        String estado = tx.path("status").asText("");
        String idTransaccion = tx.path("id").asText("");

        if (referencia.isBlank() || estado.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        // 3. Buscar la orden asociada a la referencia.
        Orden orden = ordenes.findByReferencia(referencia).orElse(null);

        if (orden == null) {
            return ResponseEntity.notFound().build();
        }

        // 4. Si el pago fue aprobado, verificar monto y moneda.
        if ("APPROVED".equals(estado)) {

            long montoPagado = tx.path("amount_in_cents").asLong(-1L);
            String moneda = tx.path("currency").asText("");

            if (orden.getMontoEnCentavos() == null
                    || montoPagado != orden.getMontoEnCentavos()
                    || !"COP".equals(moneda)) {
                return ResponseEntity.badRequest().build();
            }

            // 5. Crear la reserva solamente una vez.
            if (!orden.isReservaCreada()) {

                if (orden.getPacienteId() == null
                        || orden.getReservaJson() == null
                        || orden.getReservaJson().isBlank()) {
                    return ResponseEntity.badRequest().build();
                }

                // Recuperar los datos originales enviados desde Angular.
                ReservaRequest datos;

                try {
                    datos = objectMapper.readValue(
                            orden.getReservaJson(),
                            ReservaRequest.class
                    );
                } catch (Exception e) {
                    return ResponseEntity.badRequest().build();
                }

                // Recuperar el paciente y el estado de confirmación.
                var paciente = usuarioService.buscarPorId(orden.getPacienteId());

                if (paciente == null) {
                    return ResponseEntity.badRequest().build();
                }

                EstadoReserva estadoConfirmada =
                        estadoReservaRepository.findById(ID_CONFIRMADA).orElse(null);

                if (estadoConfirmada == null) {
                    return ResponseEntity.internalServerError().build();
                }

                // 6. Construir y completar la reserva.
                Reserva reserva = new Reserva();
                reserva.setFechaSolicitud(LocalDateTime.now());
                reserva.setUsuario(paciente);
                reserva.setEstado(estadoConfirmada);

                reservaService.completarReserva(
                        reserva,
                        datos,
                        new ArrayList<>()
                );

                // 7. Guardar la reserva.
                reservaService.guardar(reserva);

                // 8. Marcar que la reserva ya fue creada.
                orden.setReservaCreada(true);
            }
        }

        // 9. Actualizar el estado y el identificador de la transacción.
        orden.setEstado(estado);

        if (!idTransaccion.isBlank()) {
            orden.setWompiTransaccionId(idTransaccion);
        }

        ordenes.save(orden);

        return ResponseEntity.ok().build();
    }
}
