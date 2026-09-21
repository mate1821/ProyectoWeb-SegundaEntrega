package com.health.project.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.health.project.entitys.Tipo;

public interface TipoRepository extends JpaRepository<Tipo, Long>{
    
}
