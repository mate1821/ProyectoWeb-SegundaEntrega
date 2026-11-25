package com.health.project.errors;

import com.health.project.entitys.Rol;

public class UsuarioDuplicado extends RuntimeException{

    public UsuarioDuplicado (String mensaje){
        super(mensaje);
    }
    
}
