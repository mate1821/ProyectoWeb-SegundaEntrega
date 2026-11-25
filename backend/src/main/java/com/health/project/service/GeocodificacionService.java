package com.health.project.service;

import java.net.URI;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.health.project.entitys.Espacio;
import com.health.project.repository.EspacioRepository;


@Service
public class GeocodificacionService {

    private static final String CIUDAD = ", Bogotá, Colombia";

    @Autowired
    private EspacioRepository espacioRepository;

    private final RestClient restClient = RestClient.builder().defaultHeader("User-Agent", "ProyectoWeb-Javeriana/1.0 (proyecto academico)").build();

    public record Coordenadas(double latitud, double longitud) { }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record ResultadoNominatim(String lat, String lon) { }

    public Optional<Coordenadas> buscar(Espacio espacio) {
        if (espacio.getLatitud() != null && espacio.getLongitud() != null) {
            return Optional.of(new Coordenadas(espacio.getLatitud(), espacio.getLongitud()));
        }

        Optional<Coordenadas> resultado = consultar(espacio.getNombre());
        if (resultado.isEmpty() && espacio.getUbicacion() != null) {
            resultado = consultar(espacio.getUbicacion().replace("#", " "));
        }

        resultado.ifPresent(c -> {
            espacio.setLatitud(c.latitud());
            espacio.setLongitud(c.longitud());
            espacioRepository.save(espacio);
        });
        return resultado;
    }

    private Optional<Coordenadas> consultar(String texto) {
        if (texto == null || texto.isBlank()) {
            return Optional.empty();
        }
        URI url = UriComponentsBuilder
                .fromUriString("https://nominatim.openstreetmap.org/search")
                .queryParam("q", texto + CIUDAD)
                .queryParam("format", "jsonv2")
                .queryParam("countrycodes", "co")
                .queryParam("limit", 1)
                .encode()   
                .build()
                .toUri();
        try {
            ResultadoNominatim[] resultados = restClient.get().uri(url).retrieve()
                    .body(ResultadoNominatim[].class);
            if (resultados == null || resultados.length == 0) {
                return Optional.empty();
            }
            return Optional.of(new Coordenadas(
                    Double.parseDouble(resultados[0].lat()),
                    Double.parseDouble(resultados[0].lon())));
        } catch (RestClientException | NumberFormatException e) {
            return Optional.empty();
        }
    }
}