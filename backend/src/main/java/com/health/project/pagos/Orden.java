package com.health.project.pagos;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ordenes")
public class Orden {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String referencia;          // ej. "ORD-3f2a..." (la que viaja a Wompi)

    @Column(nullable = false)
    private Long montoEnCentavos;       // $15.000 COP = 1500000

    @Column(nullable = false)
    private String estado;              // PENDING, APPROVED, DECLINED, ERROR...

    private String wompiTransaccionId;  // lo llena el webhook

    private LocalDateTime fechaCreacion = LocalDateTime.now();

    public Long getId() { return id; }

    public String getReferencia() { return referencia; }
    public void setReferencia(String referencia) { this.referencia = referencia; }

    public Long getMontoEnCentavos() { return montoEnCentavos; }
    public void setMontoEnCentavos(Long montoEnCentavos) { this.montoEnCentavos = montoEnCentavos; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getWompiTransaccionId() { return wompiTransaccionId; }
    public void setWompiTransaccionId(String id) { this.wompiTransaccionId = id; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
}
