
package com.health.project.pagos;

import com.health.project.controllers.ReservaRequest;
import com.health.project.entitys.Reserva;
import com.health.project.service.ReservaService;
import com.health.project.service.UsuarioService;

import tools.jackson.databind.ObjectMapper;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.ArrayList;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/pagos")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class PagoController {

    private final WompiService wompi;
    private final OrdenRepository ordenes;
    private final ReservaService reservaService;
    private final UsuarioService usuarioService;
    private final ObjectMapper objectMapper;

    public PagoController(
            WompiService wompi,
            OrdenRepository ordenes,
            ReservaService reservaService,
            UsuarioService usuarioService,
            ObjectMapper objectMapper) {

        this.wompi = wompi;
        this.ordenes = ordenes;
        this.reservaService = reservaService;
        this.usuarioService = usuarioService;
        this.objectMapper = objectMapper;
    }

    /**
     * Crea la orden en PENDING y devuelve el link de pago de Wompi.
     * El monto se calcula en el backend usando los datos de la reserva.
     */
    @PostMapping("/checkout/{pacienteId}")
    public Map<String, String> checkout(
            @PathVariable Long pacienteId,
            @RequestBody ReservaRequest datos) {

        if (usuarioService.buscarPorId(pacienteId) == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "No existe el paciente con id " + pacienteId);
        }

        // Se reutiliza el cálculo original sin guardar la reserva.
        Reserva reservaTemporal = new Reserva();

        reservaService.completarReserva(
                reservaTemporal,
                datos,
                new ArrayList<>());

        long montoEnCentavos = Math.round(reservaTemporal.getTotal() * 100);

        Orden orden = new Orden();
        orden.setReferencia("ORD-" + UUID.randomUUID());
        orden.setMontoEnCentavos(montoEnCentavos);
        orden.setEstado("PENDING");
        orden.setPacienteId(pacienteId);

        try {
            orden.setReservaJson(
                    objectMapper.writeValueAsString(datos));
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "No fue posible guardar los datos de la reserva");
        }

        ordenes.save(orden);

        String url = wompi.crearUrlCheckout(
                orden.getReferencia(),
                orden.getMontoEnCentavos());

        return Map.of(
                "url", url,
                "referencia", orden.getReferencia());
    }

    /**
     * Consulta el estado de una orden (la usa la pagina de resultado de Angular).
     */

    @GetMapping("/orden/{referencia}")
    public ResponseEntity<Map<String, Object>> estado(
            @PathVariable String referencia) {

        return ordenes.findByReferencia(referencia)
                .map(o -> {
                    Map<String, Object> respuesta = new java.util.HashMap<>();

                    respuesta.put("referencia", o.getReferencia());
                    respuesta.put("estado", o.getEstado());
                    respuesta.put("reservaCreada", o.isReservaCreada());
                    respuesta.put("pacienteId", o.getPacienteId());

                    return ResponseEntity.ok(respuesta);
                })
                .orElse(ResponseEntity.notFound().build());
    }

}
