package com.health.project.pagos;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OrdenRepository extends JpaRepository<Orden, Long> {
    Optional<Orden> findByReferencia(String referencia);
}
