package com.health.project.pagos;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

@Service
public class WompiService {

    @Value("${wompi.public-key}")    private String publicKey;
    @Value("${wompi.integrity-key}") private String integrityKey;
    @Value("${wompi.events-secret}") private String eventsSecret;
    @Value("${app.frontend-url}")    private String frontendUrl;

    /** Arma el link a la pagina de pago de Wompi (Web Checkout) con la firma de integridad. */
    public String crearUrlCheckout(String referencia, long montoEnCentavos) {
        String moneda = "COP";
        String firma = sha256(referencia + montoEnCentavos + moneda + integrityKey);
        String redirect = frontendUrl + "/pago/resultado";

        return "https://checkout.wompi.co/p/"
            + "?public-key=" + enc(publicKey)
            + "&currency=" + moneda
            + "&amount-in-cents=" + montoEnCentavos
            + "&reference=" + enc(referencia)
            + "&signature:integrity=" + firma
            + "&redirect-url=" + enc(redirect);
    }

    /** Verifica que un evento (webhook) viene de verdad de Wompi. */
    public boolean firmaEventoValida(JsonNode evento) {
        JsonNode firma = evento.path("signature");
        StringBuilder texto = new StringBuilder();

        for (JsonNode propiedad : firma.path("properties")) {
            JsonNode valor = evento.path("data");
            for (String parte : propiedad.asText().split("\\.")) {
                valor = valor.path(parte);
            }
            texto.append(valor.asText());
        }
        texto.append(evento.path("timestamp").asText());
        texto.append(eventsSecret);

        return sha256(texto.toString()).equalsIgnoreCase(firma.path("checksum").asText());
    }

    static String sha256(String texto) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(texto.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    static String enc(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }
}
