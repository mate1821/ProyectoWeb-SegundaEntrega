package com.health.project.pagos;

import tools.jackson.databind.JsonNode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pagos")
public class WompiWebhookController {

    private final WompiService wompi;
    private final OrdenRepository ordenes;

    public WompiWebhookController(WompiService wompi, OrdenRepository ordenes) {
        this.wompi = wompi;
        this.ordenes = ordenes;
    }

    /** Wompi llama aqui cuando un pago se aprueba, se rechaza o falla. */
    @PostMapping("/webhook")
    public ResponseEntity<Void> recibir(@RequestBody JsonNode evento) {
        if (!wompi.firmaEventoValida(evento)) {
            return ResponseEntity.status(401).build();
        }
        if ("transaction.updated".equals(evento.path("event").asText())) {
            JsonNode tx = evento.path("data").path("transaction");
            ordenes.findByReferencia(tx.path("reference").asText()).ifPresent(orden -> {
                orden.setEstado(tx.path("status").asText()); // APPROVED, DECLINED, ERROR...
                orden.setWompiTransaccionId(tx.path("id").asText());
                ordenes.save(orden);
            });
        }
        return ResponseEntity.ok().build();
    }
}
