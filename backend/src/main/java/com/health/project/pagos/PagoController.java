package com.health.project.pagos;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/pagos")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class PagoController {

    private final WompiService wompi;
    private final OrdenRepository ordenes;

    public PagoController(WompiService wompi, OrdenRepository ordenes) {
        this.wompi = wompi;
        this.ordenes = ordenes;
    }

    /**
     * Crea la orden en PENDING y devuelve el link de pago de Wompi.
     * Body: { "monto": 15000 }  (en pesos)
     */
    @PostMapping("/checkout")
    public Map<String, String> checkout(@RequestBody Map<String, Long> body) {
        long pesos = body.get("monto");

        Orden orden = new Orden();
        orden.setReferencia("ORD-" + UUID.randomUUID());
        orden.setMontoEnCentavos(pesos * 100);
        orden.setEstado("PENDING");
        ordenes.save(orden);

        String url = wompi.crearUrlCheckout(orden.getReferencia(), orden.getMontoEnCentavos());
        return Map.of("url", url, "referencia", orden.getReferencia());
    }

    /** Consulta el estado de una orden (la usa la pagina de resultado de Angular). */
    @GetMapping("/orden/{referencia}")
    public ResponseEntity<Map<String, String>> estado(@PathVariable String referencia) {
        return ordenes.findByReferencia(referencia)
            .map(o -> ResponseEntity.ok(Map.of("referencia", o.getReferencia(), "estado", o.getEstado())))
            .orElse(ResponseEntity.notFound().build());
    }
}
